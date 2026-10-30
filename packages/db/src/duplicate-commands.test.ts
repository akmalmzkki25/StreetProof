import "../scripts/load-root-env";
import type { Role } from "@streetproof/domain";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { linkDuplicate, unlinkDuplicate } from "./duplicate-commands";
import { getReporterStatus, submitReport } from "./reports";
import {
  assignments,
  duplicateLinks,
  idempotencyKeys,
  memberships,
  outbox,
  reporterCredentials,
  reports,
  sites,
  tenants,
  ticketEvents,
  tickets,
} from "./schema";
import { assignTicket, transitionTicket } from "./ticket-commands";
import {
  getTicketDetail,
  listLinkCandidates,
  listQueue,
} from "./ticket-queries";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)(
  "duplicate links (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];
    const reportIds: string[] = [];
    const idempotencyKeyValues: string[] = [];

    afterEach(async () => {
      if (ticketIds.length === 0) return;
      await db
        .delete(duplicateLinks)
        .where(inArray(duplicateLinks.sourceTicketId, ticketIds));
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, ticketIds));
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
      await db
        .delete(assignments)
        .where(inArray(assignments.ticketId, ticketIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, idempotencyKeyValues));
      ticketIds.length = 0;
      reportIds.length = 0;
      idempotencyKeyValues.length = 0;
    });

    afterAll(async () => {
      await pool.end();
    });

    async function memberWith(tenantId: string, role: Role) {
      const [row] = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(
          and(eq(memberships.tenantId, tenantId), eq(memberships.role, role)),
        );
      if (!row) throw new Error("Seed data is incomplete.");
      return { userId: row.userId, roles: [role] };
    }

    async function seededSite(name = "Graha Contoh (synthetic)") {
      const [row] = await db
        .select({ siteId: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, name));
      if (!row) throw new Error("Run pnpm db:seed first.");
      return row;
    }

    async function report(
      place: { tenantId: string; siteId: string },
      description: string,
    ) {
      const reportId = randomUUID();
      const idempotencyKey = randomUUID();
      const outcome = await submitReport(db, {
        ...place,
        reportId,
        locationId: null,
        locationText: "Lobby",
        description,
        photos: [],
        idempotencyKey,
        requestDigest: idempotencyKey,
      });
      if (!outcome.ok) throw new Error(outcome.code);
      ticketIds.push(outcome.ticketId);
      reportIds.push(reportId);
      idempotencyKeyValues.push(idempotencyKey);
      return outcome;
    }

    async function pair() {
      const place = await seededSite();
      const operator = await memberWith(place.tenantId, "operator");
      const source = await report(place, "Lamp out in the lobby");
      const target = await report(place, "Lobby lamp is dark");
      const command = {
        tenantId: place.tenantId,
        sourceTicketId: source.ticketId,
        targetTicketId: target.ticketId,
        actor: operator,
        expectedRevision: 0,
        reason: "Same lamp, reported twice",
      };
      return { place, operator, source, target, command };
    }

    function detail(
      place: { tenantId: string },
      ticketId: string,
    ): ReturnType<typeof getTicketDetail> {
      return getTicketDetail(
        db,
        { tenantId: place.tenantId, siteIds: null },
        ticketId,
      );
    }

    it("links a report, keeps it, and records the change on both tickets", async () => {
      const { place, source, target, command } = await pair();

      expect(await linkDuplicate(db, command)).toEqual({ ok: true });

      const sourceDetail = await detail(place, source.ticketId);
      expect(sourceDetail?.status).toBe("submitted");
      expect(sourceDetail?.revision).toBe(1);
      expect(sourceDetail?.reports).toHaveLength(1);
      expect(sourceDetail?.duplicateOf?.ticketId).toBe(target.ticketId);
      expect(sourceDetail?.events.at(-1)?.type).toBe("duplicate_linked");

      const targetDetail = await detail(place, target.ticketId);
      expect(targetDetail?.revision).toBe(0);
      expect(targetDetail?.reports).toHaveLength(1);
      expect(targetDetail?.linkedDuplicates).toHaveLength(1);
      expect(targetDetail?.linkedDuplicates[0]?.reports[0]?.description).toBe(
        "Lamp out in the lobby",
      );
      expect(targetDetail?.events.at(-1)?.payload.role).toBe("target");
    });

    it("moves the duplicate out of the queue and counts it on the target", async () => {
      const { place, source, target, command } = await pair();
      await linkDuplicate(db, command);

      const queue = await listQueue(db, {
        tenantId: place.tenantId,
        siteIds: null,
      });
      expect(queue.map((item) => item.id)).not.toContain(source.ticketId);
      expect(
        queue.find((item) => item.id === target.ticketId)?.linkedCount,
      ).toBe(1);

      const candidates = await listLinkCandidates(
        db,
        { tenantId: place.tenantId, siteIds: null },
        { id: target.ticketId, siteId: place.siteId },
      );
      expect(candidates.map((item) => item.id)).not.toContain(source.ticketId);
    });

    it("restores the ticket when unlinked", async () => {
      const { place, operator, source, target, command } = await pair();
      await linkDuplicate(db, command);

      const outcome = await unlinkDuplicate(db, {
        tenantId: place.tenantId,
        sourceTicketId: source.ticketId,
        actor: operator,
        expectedRevision: 1,
        reason: "Different lamps after all",
      });
      expect(outcome).toEqual({ ok: true });

      const sourceDetail = await detail(place, source.ticketId);
      expect(sourceDetail?.status).toBe("submitted");
      expect(sourceDetail?.duplicateOf).toBeNull();
      expect(sourceDetail?.revision).toBe(2);
      expect(sourceDetail?.events.at(-1)?.type).toBe("duplicate_unlinked");

      const targetDetail = await detail(place, target.ticketId);
      expect(targetDetail?.linkedDuplicates).toHaveLength(0);

      const queue = await listQueue(db, {
        tenantId: place.tenantId,
        siteIds: null,
      });
      expect(queue.map((item) => item.id)).toContain(source.ticketId);
    });

    it("rejects a stale revision, a technician and an empty reason", async () => {
      const { place, command } = await pair();
      const technician = await memberWith(place.tenantId, "technician");

      expect(
        await linkDuplicate(db, { ...command, expectedRevision: 9 }),
      ).toEqual({
        ok: false,
        rejection: { code: "stale_revision", currentRevision: 0 },
      });
      expect(
        await linkDuplicate(db, { ...command, actor: technician }),
      ).toEqual({ ok: false, rejection: { code: "forbidden_role" } });
      expect(await linkDuplicate(db, { ...command, reason: "  " })).toEqual({
        ok: false,
        rejection: { code: "missing_reason" },
      });
    });

    it("refuses another tenant's ticket as if it didn't exist", async () => {
      const { command } = await pair();
      const other = await seededSite("Kampus Contoh (synthetic)");
      const foreign = await report(other, "Gate is stuck");

      expect(
        await linkDuplicate(db, {
          ...command,
          targetTicketId: foreign.ticketId,
        }),
      ).toEqual({ ok: false, rejection: { code: "not_found" } });
    });

    it("refuses chains in both directions", async () => {
      const { place, source, target, command } = await pair();
      await linkDuplicate(db, command);
      const third = await report(place, "Dark lobby");

      expect(
        await linkDuplicate(db, {
          ...command,
          sourceTicketId: third.ticketId,
          targetTicketId: source.ticketId,
        }),
      ).toEqual({
        ok: false,
        rejection: { code: "link_problem", problem: "target_is_duplicate" },
      });
      expect(
        await linkDuplicate(db, {
          ...command,
          sourceTicketId: target.ticketId,
          targetTicketId: third.ticketId,
        }),
      ).toEqual({
        ok: false,
        rejection: { code: "link_problem", problem: "source_has_duplicates" },
      });
    });

    it("refuses to link work a technician already holds", async () => {
      const { place, operator, source, command } = await pair();
      const triaged = await transitionTicket(db, {
        tenantId: place.tenantId,
        ticketId: source.ticketId,
        actor: operator,
        to: "triaged",
        expectedRevision: 0,
        provided: ["triage_fields"],
      });
      expect(triaged.ok).toBe(true);
      const technician = await memberWith(place.tenantId, "technician");
      const assigned = await assignTicket(db, {
        tenantId: place.tenantId,
        siteId: place.siteId,
        ticketId: source.ticketId,
        actor: operator,
        expectedRevision: 1,
        technicianId: technician.userId,
      });
      expect(assigned.ok).toBe(true);

      expect(
        await linkDuplicate(db, { ...command, expectedRevision: 2 }),
      ).toEqual({
        ok: false,
        rejection: { code: "link_problem", problem: "source_has_work" },
      });
    });

    it("lets only one of two racing links through", async () => {
      const { place, command } = await pair();
      const other = await report(place, "Lobby is dark");

      const outcomes = await Promise.all([
        linkDuplicate(db, command),
        linkDuplicate(db, { ...command, targetTicketId: other.ticketId }),
      ]);

      expect(outcomes.filter((outcome) => outcome.ok)).toHaveLength(1);
      const links = await db
        .select({ id: duplicateLinks.id })
        .from(duplicateLinks)
        .where(
          and(
            eq(duplicateLinks.sourceTicketId, command.sourceTicketId),
            eq(duplicateLinks.active, true),
          ),
        );
      expect(links).toHaveLength(1);
    });

    it("blocks transitions on the duplicate and silent cancellation of its target", async () => {
      const { place, operator, source, target, command } = await pair();
      await linkDuplicate(db, command);

      expect(
        await transitionTicket(db, {
          tenantId: place.tenantId,
          ticketId: source.ticketId,
          actor: operator,
          to: "triaged",
          expectedRevision: 1,
          provided: ["triage_fields"],
        }),
      ).toEqual({ ok: false, rejection: { code: "linked_as_duplicate" } });

      const triaged = await transitionTicket(db, {
        tenantId: place.tenantId,
        ticketId: target.ticketId,
        actor: operator,
        to: "triaged",
        expectedRevision: 0,
        provided: ["triage_fields"],
      });
      expect(triaged.ok).toBe(true);

      expect(
        await transitionTicket(db, {
          tenantId: place.tenantId,
          ticketId: target.ticketId,
          actor: operator,
          to: "cancelled",
          expectedRevision: 1,
          provided: ["reason"],
          payload: { reason: "Not a real problem" },
        }),
      ).toEqual({ ok: false, rejection: { code: "has_linked_duplicates" } });
    });

    it("shows the duplicate's reporter the target's progress", async () => {
      const { place, operator, source, target, command } = await pair();
      await linkDuplicate(db, command);

      await transitionTicket(db, {
        tenantId: place.tenantId,
        ticketId: target.ticketId,
        actor: operator,
        to: "triaged",
        expectedRevision: 0,
        provided: ["triage_fields"],
      });

      const status = await getReporterStatus(db, source.reporterToken);
      const targetStatus = await getReporterStatus(db, target.reporterToken);
      expect(status?.stage).toBe(targetStatus?.stage);
      expect(status?.description).toBe("Lamp out in the lobby");
      expect(status?.updatedAt).toEqual(targetStatus?.updatedAt);
    });
  },
);
