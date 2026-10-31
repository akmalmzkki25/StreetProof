import "../scripts/load-root-env";
import { eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { getReporterStatus, submitReport } from "./reports";
import {
  assignments,
  idempotencyKeys,
  memberships,
  outbox,
  reporterCredentials,
  reports,
  sites,
  teams,
  tenants,
  ticketEvents,
  ticketNotes,
  tickets,
} from "./schema";
import { addTicketNote, assignTicket, triageTicket } from "./ticket-commands";
import { getTicketDetail, listQueue, listTeams } from "./ticket-queries";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)(
  "search, teams, deadlines and notes (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];
    const reportIds: string[] = [];
    const keys: string[] = [];

    afterEach(async () => {
      if (ticketIds.length === 0) return;
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
      await db
        .delete(ticketNotes)
        .where(inArray(ticketNotes.ticketId, ticketIds));
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, ticketIds));
      await db
        .delete(assignments)
        .where(inArray(assignments.ticketId, ticketIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, keys));
      ticketIds.length = 0;
      reportIds.length = 0;
      keys.length = 0;
    });

    afterAll(async () => {
      await pool.end();
    });

    async function graha() {
      const [row] = await db
        .select({ siteId: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!row) throw new Error("Run pnpm db:seed first.");
      return row;
    }

    async function member(tenantId: string, role: "operator" | "technician") {
      const rows = await db
        .select({ userId: memberships.userId, role: memberships.role })
        .from(memberships)
        .where(eq(memberships.tenantId, tenantId));
      const found = rows.find((row) => row.role === role);
      if (!found) throw new Error("Run pnpm db:seed first.");
      return { userId: found.userId, roles: [role] };
    }

    async function newReport(description: string) {
      const { siteId, tenantId } = await graha();
      const reportId = randomUUID();
      const idempotencyKey = randomUUID();
      keys.push(idempotencyKey);
      reportIds.push(reportId);
      const outcome = await submitReport(db, {
        tenantId,
        siteId,
        reportId,
        locationId: null,
        locationText: "Floor 9",
        description,
        photos: [],
        idempotencyKey,
        requestDigest: "digest",
      });
      if (!outcome.ok) throw new Error(outcome.code);
      ticketIds.push(outcome.ticketId);
      return { ...outcome, tenantId, siteId };
    }

    async function triaged(description: string, category = "plumbing") {
      const report = await newReport(description);
      const outcome = await triageTicket(db, {
        tenantId: report.tenantId,
        ticketId: report.ticketId,
        actor: await member(report.tenantId, "operator"),
        expectedRevision: 0,
        summary: `${description} summary`,
        category,
        priority: "high",
        locationId: null,
      });
      if (!outcome.ok) throw new Error("Triage was refused.");
      return { ...report, revision: outcome.ticket.revision };
    }

    it("finds tickets by words in the report, ignoring case and wildcards", async () => {
      const token = randomUUID().slice(0, 8);
      const { tenantId, ticketId } = await newReport(
        `Kebocoran ${token} near the lift`,
      );
      await newReport(`Something else ${randomUUID().slice(0, 8)}`);
      const scope = { tenantId, siteIds: null };

      const found = await listQueue(db, scope, {
        search: token.toUpperCase(),
      });
      expect(found.map((item) => item.id)).toEqual([ticketId]);

      const wildcard = await listQueue(db, scope, { search: `${token}%lift` });
      expect(wildcard).toEqual([]);
    });

    it("filters by category and priority together", async () => {
      const token = randomUUID().slice(0, 8);
      const plumbing = await triaged(`Pipe ${token}`, "plumbing");
      await triaged(`Lamp ${token}`, "electrical");
      const scope = { tenantId: plumbing.tenantId, siteIds: null };

      const found = await listQueue(db, scope, {
        search: token,
        category: "plumbing",
        priority: "high",
      });
      expect(found.map((item) => item.id)).toEqual([plumbing.ticketId]);

      const none = await listQueue(db, scope, {
        search: token,
        category: "plumbing",
        priority: "low",
      });
      expect(none).toEqual([]);
    });

    it("records a team and deadline on assignment and shows them", async () => {
      const ticket = await triaged("Leak with a deadline");
      const scope = { tenantId: ticket.tenantId, siteIds: null };
      const [team] = await listTeams(db, ticket.tenantId);
      if (!team) throw new Error("Run pnpm db:seed first.");
      const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      const outcome = await assignTicket(db, {
        tenantId: ticket.tenantId,
        ticketId: ticket.ticketId,
        siteId: ticket.siteId,
        actor: await member(ticket.tenantId, "operator"),
        expectedRevision: ticket.revision,
        technicianId: (await member(ticket.tenantId, "technician")).userId,
        teamId: team.id,
        dueAt,
      });
      expect(outcome.ok).toBe(true);

      const detail = await getTicketDetail(db, scope, ticket.ticketId);
      expect(detail).toMatchObject({ teamName: team.name, dueAt });
      const [row] = await listQueue(db, scope, {
        search: "Leak with a deadline",
      });
      expect(row).toMatchObject({ teamName: team.name, dueAt });
    });

    it("refuses a team from another tenant", async () => {
      const ticket = await triaged("Leak for the wrong team");
      const [otherTenant] = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.name, "Kampus Contoh (synthetic)"));
      if (!otherTenant) throw new Error("Run pnpm db:seed first.");
      const [foreignTeam] = await listTeams(db, otherTenant.id);
      if (!foreignTeam) throw new Error("Run pnpm db:seed first.");

      const outcome = await assignTicket(db, {
        tenantId: ticket.tenantId,
        ticketId: ticket.ticketId,
        siteId: ticket.siteId,
        actor: await member(ticket.tenantId, "operator"),
        expectedRevision: ticket.revision,
        technicianId: (await member(ticket.tenantId, "technician")).userId,
        teamId: foreignTeam.id,
        dueAt: null,
      });

      expect(outcome).toEqual({
        ok: false,
        rejection: { code: "team_not_found" },
      });
    });

    it("keeps internal notes from the reporter and leaves the revision alone", async () => {
      const report = await newReport("Lobby door sticks");
      const operator = await member(report.tenantId, "operator");

      const outcome = await addTicketNote(db, {
        tenantId: report.tenantId,
        ticketId: report.ticketId,
        authorId: operator.userId,
        body: "Vendor visits on Tuesday.",
      });
      expect(outcome).toEqual({ ok: true });

      const detail = await getTicketDetail(
        db,
        { tenantId: report.tenantId, siteIds: null },
        report.ticketId,
      );
      expect(detail?.revision).toBe(0);
      expect(detail?.notes.map((note) => note.body)).toEqual([
        "Vendor visits on Tuesday.",
      ]);
      expect(detail?.events.map((event) => event.type)).toContain("note_added");
      // The body stays in its own table, out of events a reporter feed could read.
      expect(JSON.stringify(detail?.events)).not.toContain("Vendor visits");

      const status = await getReporterStatus(db, report.reporterToken);
      expect(JSON.stringify(status)).not.toContain("Vendor visits");
    });

    it("refuses a note on another tenant's ticket", async () => {
      const report = await newReport("Lobby door sticks again");

      const outcome = await addTicketNote(db, {
        tenantId: randomUUID(),
        ticketId: report.ticketId,
        authorId: (await member(report.tenantId, "operator")).userId,
        body: "Should not land.",
      });

      expect(outcome).toEqual({ ok: false, code: "not_found" });
    });

    it("lists a tenant's active teams only", async () => {
      const { tenantId } = await graha();
      const before = await listTeams(db, tenantId);
      const [hidden] = await db
        .insert(teams)
        .values({ tenantId, name: `Old team ${randomUUID()}`, active: false })
        .returning();
      if (!hidden) throw new Error("no team");

      const after = await listTeams(db, tenantId);
      await db.delete(teams).where(eq(teams.id, hidden.id));

      expect(after).toEqual(before);
    });
  },
);
