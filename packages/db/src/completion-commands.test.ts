import "../scripts/load-root-env";
import { checklistFor, type Role } from "@streetproof/domain";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import {
  acceptWork,
  decideCompletion,
  submitCompletion,
} from "./completion-commands";
import {
  assignments,
  completionSubmissions,
  memberships,
  outbox,
  sites,
  tenants,
  ticketEvents,
  tickets,
  uploads,
  verifications,
} from "./schema";
import {
  assignTicket,
  transitionTicket,
  triageTicket,
  type TransitionOutcome,
} from "./ticket-commands";
import { getTicketDetail, listQueue } from "./ticket-queries";

const url = process.env.DATABASE_URL;
const ALL_CHECKS = checklistFor("plumbing").map((item) => item.id);

describe.skipIf(!url)(
  "completion flow (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];

    afterEach(async () => {
      if (ticketIds.length === 0) return;
      const attempts = await db
        .select({ id: completionSubmissions.id })
        .from(completionSubmissions)
        .where(inArray(completionSubmissions.ticketId, ticketIds));
      const attemptIds = attempts.map((attempt) => attempt.id);
      if (attemptIds.length > 0) {
        await db
          .delete(verifications)
          .where(inArray(verifications.completionId, attemptIds));
        await db
          .delete(uploads)
          .where(inArray(uploads.completionId, attemptIds));
        await db
          .delete(completionSubmissions)
          .where(inArray(completionSubmissions.id, attemptIds));
      }
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
      ticketIds.length = 0;
    });

    afterAll(async () => {
      await pool.end();
    });

    function revisionOf(outcome: TransitionOutcome) {
      if (!outcome.ok) {
        throw new Error(`Rejected: ${outcome.rejection.code}`);
      }
      return outcome.ticket.revision;
    }

    async function memberWith(tenantId: string, role: Role) {
      const rows = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(
          and(eq(memberships.tenantId, tenantId), eq(memberships.role, role)),
        );
      return rows.map((row) => ({ userId: row.userId, roles: [role] }));
    }

    // A ticket assigned and in progress, ready for a completion attempt.
    async function ticketInProgress() {
      const [row] = await db
        .select({ siteId: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!row) throw new Error("Run pnpm db:seed first.");
      const { tenantId, siteId } = row;

      const [operator] = await memberWith(tenantId, "operator");
      const [technician, otherTechnician] = await memberWith(
        tenantId,
        "technician",
      );
      const [supervisor] = await memberWith(tenantId, "supervisor");
      if (!operator || !technician || !otherTechnician || !supervisor) {
        throw new Error("Seed data is incomplete.");
      }

      const [ticket] = await db
        .insert(tickets)
        .values({ tenantId, siteId })
        .returning();
      if (!ticket) throw new Error("no ticket");
      ticketIds.push(ticket.id);
      const ref = { tenantId, ticketId: ticket.id };

      let revision = revisionOf(
        await triageTicket(db, {
          ...ref,
          actor: operator,
          expectedRevision: 0,
          summary: "Leak under pantry sink",
          category: "plumbing",
          priority: "high",
          locationId: null,
        }),
      );
      revision = revisionOf(
        await assignTicket(db, {
          ...ref,
          siteId,
          actor: operator,
          expectedRevision: revision,
          technicianId: technician.userId,
        }),
      );
      revision = revisionOf(
        await acceptWork(db, {
          ...ref,
          actor: technician,
          expectedRevision: revision,
        }),
      );
      revision = revisionOf(
        await transitionTicket(db, {
          ...ref,
          actor: technician,
          to: "in_progress",
          expectedRevision: revision,
          provided: [],
        }),
      );

      return {
        ...ref,
        siteId,
        revision,
        operator,
        technician,
        otherTechnician,
        supervisor,
      };
    }

    function proof() {
      return {
        objectKey: `test/${randomUUID()}.jpg`,
        contentType: "image/jpeg",
        bytes: 10,
        sha256: "abc",
      };
    }

    it("records when the technician accepted the work", async () => {
      const { ticketId } = await ticketInProgress();

      const [assignment] = await db
        .select()
        .from(assignments)
        .where(
          and(eq(assignments.ticketId, ticketId), isNull(assignments.endedAt)),
        );

      expect(assignment?.acceptedAt).toBeInstanceOf(Date);
    });

    it("refuses completion without proof", async () => {
      const { tenantId, ticketId, technician, revision } =
        await ticketInProgress();

      const outcome = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "Fixed",
        photos: [],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });

      expect(outcome).toEqual({
        ok: false,
        rejection: {
          code: "missing_requirements",
          missing: ["completion_proof"],
        },
      });
    });

    it("refuses a photo without the full checklist", async () => {
      const { tenantId, ticketId, technician, revision } =
        await ticketInProgress();

      const outcome = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "Fixed",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS.slice(1),
        exceptionReason: null,
      });

      expect(outcome).toEqual({
        ok: false,
        rejection: {
          code: "missing_requirements",
          missing: ["completion_proof"],
        },
      });
    });

    it("sends a reasoned exception to the supervisor, who can't verify it without a photo", async () => {
      const { tenantId, ticketId, technician, supervisor, revision } =
        await ticketInProgress();

      const submitted = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "Fixed the valve",
        photos: [],
        checkedItemIds: ALL_CHECKS.slice(1),
        exceptionReason: "Cameras aren't allowed in this plant room.",
      });
      const submittedRevision = revisionOf(submitted);

      const ticket = await getTicketDetail(
        db,
        { tenantId, siteIds: null },
        ticketId,
      );
      expect(ticket?.status).toBe("completion_submitted");
      expect(ticket?.attempts[0]?.exceptionReason).toBe(
        "Cameras aren't allowed in this plant room.",
      );
      expect(
        ticket?.attempts[0]?.checklist.map((item) => item.checked),
      ).toEqual([false, true, true]);

      const verified = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: submittedRevision,
        decision: "accepted",
        reason: "Looks fine to me",
      });
      expect(verified).toEqual({
        ok: false,
        rejection: {
          code: "missing_requirements",
          missing: ["ready_evidence"],
        },
      });

      const rejected = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: submittedRevision,
        decision: "rejected",
        reason: "Ask the site manager to take a photo.",
      });
      expect(rejected.ok).toBe(true);
    });

    it("lets a supervisor verify an exception that has a photo", async () => {
      const { tenantId, ticketId, technician, supervisor, revision } =
        await ticketInProgress();

      const submitted = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "Fixed, but the water is off for now",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS.slice(1),
        exceptionReason: "The water supply is off, so I can't run the test.",
      });

      const verified = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: revisionOf(submitted),
        decision: "accepted",
        reason: "The photo shows the repair and the reason holds.",
      });
      expect(verified.ok).toBe(true);
    });

    it("refuses completion from a technician who isn't assigned", async () => {
      const { tenantId, ticketId, otherTechnician, revision } =
        await ticketInProgress();

      const outcome = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: otherTechnician,
        expectedRevision: revision,
        note: "Fixed",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });

      expect(outcome).toEqual({
        ok: false,
        rejection: { code: "not_current_assignee" },
      });
    });

    it("closes only after a supervisor accepts the proof", async () => {
      const { tenantId, ticketId, technician, supervisor, revision } =
        await ticketInProgress();

      const submitted = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "Replaced the seal",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });
      expect(submitted).toMatchObject({
        ok: true,
        ticket: { status: "completion_submitted" },
      });

      const byTechnician = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revisionOf(submitted),
        decision: "accepted",
        reason: "Looks fine to me",
      });
      expect(byTechnician).toMatchObject({
        ok: false,
        rejection: { code: "forbidden_role" },
      });

      const closed = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: revisionOf(submitted),
        decision: "accepted",
        reason: "Seal replaced and floor is dry",
      });
      expect(closed).toMatchObject({
        ok: true,
        ticket: { status: "verified_closed" },
      });
    });

    it("requires a reason for a decision", async () => {
      const { tenantId, ticketId, technician, supervisor, revision } =
        await ticketInProgress();
      const submitted = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "Done",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });

      const outcome = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: revisionOf(submitted),
        decision: "rejected",
        reason: "   ",
      });

      expect(outcome).toEqual({
        ok: false,
        rejection: { code: "missing_requirements", missing: ["reason"] },
      });
    });

    it("keeps a rejected attempt and accepts a corrected one", async () => {
      const { tenantId, ticketId, siteId, technician, supervisor, revision } =
        await ticketInProgress();

      const first = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "First attempt",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });
      const rejected = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: revisionOf(first),
        decision: "rejected",
        reason: "Photo doesn't show the pipe",
      });
      const resumed = await transitionTicket(db, {
        tenantId,
        ticketId,
        actor: technician,
        to: "in_progress",
        expectedRevision: revisionOf(rejected),
        provided: [],
      });
      const second = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revisionOf(resumed),
        note: "Second attempt",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });
      expect(second).toMatchObject({ ok: true });

      const detail = await getTicketDetail(
        db,
        { tenantId, siteIds: [siteId] },
        ticketId,
      );
      expect(detail?.attempts.map((attempt) => attempt.status)).toEqual([
        "pending",
        "rejected",
      ]);
      expect(detail?.attempts[1]).toMatchObject({
        note: "First attempt",
        decisionReason: "Photo doesn't show the pipe",
      });
      expect(detail?.attempts[1]?.photos).toHaveLength(1);
    });

    it("lets only one of two racing decisions win", async () => {
      const { tenantId, ticketId, technician, supervisor, revision } =
        await ticketInProgress();
      const submitted = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: technician,
        expectedRevision: revision,
        note: "Done",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });
      const decision = {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: revisionOf(submitted),
      };

      const outcomes = await Promise.all([
        decideCompletion(db, {
          ...decision,
          decision: "accepted",
          reason: "Ok",
        }),
        decideCompletion(db, {
          ...decision,
          decision: "rejected",
          reason: "Not ok",
        }),
      ]);

      expect(outcomes.filter((outcome) => outcome.ok)).toHaveLength(1);
      const rows = await db
        .select({ id: completionSubmissions.id })
        .from(completionSubmissions)
        .innerJoin(
          verifications,
          eq(verifications.completionId, completionSubmissions.id),
        )
        .where(eq(completionSubmissions.ticketId, ticketId));
      expect(rows).toHaveLength(1);
    });

    it("reopens closed work and hands it to a new technician", async () => {
      const context = await ticketInProgress();
      const { tenantId, ticketId, siteId, supervisor, operator } = context;
      const submitted = await submitCompletion(db, {
        tenantId,
        ticketId,
        actor: context.technician,
        expectedRevision: context.revision,
        note: "Done",
        photos: [proof()],
        checkedItemIds: ALL_CHECKS,
        exceptionReason: null,
      });
      const closed = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        expectedRevision: revisionOf(submitted),
        decision: "accepted",
        reason: "Good",
      });
      const reopened = await transitionTicket(db, {
        tenantId,
        ticketId,
        actor: supervisor,
        to: "reopened",
        expectedRevision: revisionOf(closed),
        provided: ["reason"],
        payload: { reason: "Leak came back" },
      });

      const reassigned = await assignTicket(db, {
        tenantId,
        siteId,
        ticketId,
        actor: operator,
        expectedRevision: revisionOf(reopened),
        technicianId: context.otherTechnician.userId,
      });

      expect(reassigned).toMatchObject({
        ok: true,
        ticket: {
          status: "assigned",
          currentAssigneeId: context.otherTechnician.userId,
        },
      });
      const active = await db
        .select()
        .from(assignments)
        .where(
          and(eq(assignments.ticketId, ticketId), isNull(assignments.endedAt)),
        );
      expect(active).toHaveLength(1);
    });

    it("filters the queue by status and assignee", async () => {
      const { tenantId, siteId, ticketId, technician, otherTechnician } =
        await ticketInProgress();
      const scope = { tenantId, siteIds: [siteId] };

      const mine = await listQueue(db, scope, {
        assigneeId: technician.userId,
      });
      const theirs = await listQueue(db, scope, {
        assigneeId: otherTechnician.userId,
      });
      const closed = await listQueue(db, scope, {
        statuses: ["verified_closed"],
      });

      expect(mine.map((item) => item.id)).toContain(ticketId);
      expect(theirs.map((item) => item.id)).not.toContain(ticketId);
      expect(closed.map((item) => item.id)).not.toContain(ticketId);
    });
  },
);
