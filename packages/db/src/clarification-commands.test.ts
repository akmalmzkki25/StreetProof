import "../scripts/load-root-env";
import type { Role } from "@streetproof/domain";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import {
  answerClarification,
  requestClarification,
  resumeAfterClarification,
} from "./clarification-commands";
import { createDb } from "./client";
import { linkDuplicate } from "./duplicate-commands";
import { getReporterStatus, submitReport } from "./reports";
import {
  clarifications,
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
import { transitionTicket } from "./ticket-commands";
import { getTicketDetail, listQueue } from "./ticket-queries";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)(
  "clarifications (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];
    const reportIds: string[] = [];
    const keys: string[] = [];

    afterEach(async () => {
      if (ticketIds.length === 0) return;
      await db
        .delete(duplicateLinks)
        .where(inArray(duplicateLinks.sourceTicketId, ticketIds));
      await db
        .delete(clarifications)
        .where(inArray(clarifications.ticketId, ticketIds));
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

    async function report(description = "Pintu lobi rusak") {
      const [place] = await db
        .select({ siteId: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!place) throw new Error("Run pnpm db:seed first.");

      const reportId = randomUUID();
      const idempotencyKey = randomUUID();
      const outcome = await submitReport(db, {
        ...place,
        reportId,
        locationId: null,
        locationText: "Lobi",
        description,
        photos: [],
        idempotencyKey,
        requestDigest: idempotencyKey,
      });
      if (!outcome.ok) throw new Error(outcome.code);
      ticketIds.push(outcome.ticketId);
      reportIds.push(reportId);
      keys.push(idempotencyKey);
      return { ...outcome, tenantId: place.tenantId };
    }

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

    // A report with an open question, ready for the reporter to answer.
    async function asked() {
      const created = await report();
      const operator = await memberWith(created.tenantId, "operator");
      const outcome = await requestClarification(db, {
        tenantId: created.tenantId,
        ticketId: created.ticketId,
        actor: operator,
        expectedRevision: 0,
        question: "Pintu lobi yang mana?",
      });
      expect(outcome.ok).toBe(true);
      const status = await getReporterStatus(db, created.reporterToken);
      const question = status?.clarifications[0];
      if (!question) throw new Error("Question not visible to the reporter.");
      return { ...created, operator, questionId: question.id };
    }

    function detail(tenantId: string, ticketId: string) {
      return getTicketDetail(db, { tenantId, siteIds: null }, ticketId);
    }

    it("shows the question to the reporter without naming who asked", async () => {
      const { reporterToken, tenantId, ticketId } = await asked();

      const status = await getReporterStatus(db, reporterToken);
      expect(status?.stage).toBe("in_review");
      expect(status?.clarifications).toEqual([
        expect.objectContaining({
          question: "Pintu lobi yang mana?",
          answer: null,
          isOpen: true,
        }),
      ]);
      expect(Object.keys(status?.clarifications[0] ?? {}).sort()).toEqual([
        "answer",
        "id",
        "isOpen",
        "question",
      ]);

      const ticket = await detail(tenantId, ticketId);
      expect(ticket?.status).toBe("needs_clarification");
      expect(ticket?.events.at(-1)?.payload.reason).toBe(
        "Pintu lobi yang mana?",
      );
    });

    it("keeps status, revision and the original report when answered", async () => {
      const { reporterToken, questionId, tenantId, ticketId } = await asked();

      const outcome = await answerClarification(db, {
        token: reporterToken,
        clarificationId: questionId,
        answer: "Pintu kaca sisi barat",
      });
      expect(outcome).toEqual({ ok: true, ticketId });

      const ticket = await detail(tenantId, ticketId);
      expect(ticket?.status).toBe("needs_clarification");
      expect(ticket?.revision).toBe(1);
      expect(ticket?.reports[0]?.description).toBe("Pintu lobi rusak");
      expect(ticket?.clarifications[0]?.answer).toBe("Pintu kaca sisi barat");
      expect(ticket?.events.at(-1)?.type).toBe("clarification_answered");
      expect(ticket?.events.at(-1)?.actorName).toBeNull();

      const queue = await listQueue(db, { tenantId, siteIds: null });
      expect(
        queue.find((item) => item.id === ticketId)?.hasUnreviewedAnswer,
      ).toBe(true);
    });

    it("gives the same answer for every refused write", async () => {
      const first = await asked();
      const other = await report("Lampu mati");
      const refused = { ok: false, code: "unavailable" };

      expect(
        await answerClarification(db, {
          token: "not-a-real-token",
          clarificationId: first.questionId,
          answer: "x",
        }),
      ).toEqual(refused);
      // A receipt for another report can't touch this question.
      expect(
        await answerClarification(db, {
          token: other.reporterToken,
          clarificationId: first.questionId,
          answer: "x",
        }),
      ).toEqual(refused);

      await db
        .update(reporterCredentials)
        .set({ revokedAt: new Date() })
        .where(eq(reporterCredentials.reportId, first.reportId));
      expect(
        await answerClarification(db, {
          token: first.reporterToken,
          clarificationId: first.questionId,
          answer: "x",
        }),
      ).toEqual(refused);

      const ticket = await detail(first.tenantId, first.ticketId);
      expect(ticket?.clarifications[0]?.answer).toBeNull();
    });

    it("accepts one answer only", async () => {
      const { reporterToken, questionId, tenantId, ticketId } = await asked();

      const outcomes = await Promise.all(
        ["Jawaban satu", "Jawaban dua"].map((answer) =>
          answerClarification(db, {
            token: reporterToken,
            clarificationId: questionId,
            answer,
          }),
        ),
      );

      expect(outcomes.filter((outcome) => outcome.ok)).toHaveLength(1);
      const ticket = await detail(tenantId, ticketId);
      const events = ticket?.events.filter(
        (event) => event.type === "clarification_answered",
      );
      expect(events).toHaveLength(1);
    });

    it("returns to triage and asks for a new draft after an answer", async () => {
      const created = await asked();
      await answerClarification(db, {
        token: created.reporterToken,
        clarificationId: created.questionId,
        answer: "Pintu kaca sisi barat",
      });

      const outcome = await resumeAfterClarification(db, {
        tenantId: created.tenantId,
        ticketId: created.ticketId,
        actor: created.operator,
        expectedRevision: 1,
        reason: null,
      });
      expect(outcome.ok).toBe(true);

      const ticket = await detail(created.tenantId, created.ticketId);
      expect(ticket?.status).toBe("submitted");
      expect(ticket?.clarifications[0]?.closedAt).not.toBeNull();

      const [row] = await db
        .select({ revision: reports.revision })
        .from(reports)
        .where(eq(reports.id, created.reportId));
      expect(row?.revision).toBe(1);

      const jobs = await db
        .select({ payload: outbox.payload })
        .from(outbox)
        .where(
          and(
            eq(outbox.topic, "report.submitted"),
            eq(sql`${outbox.payload}->>'ticketId'`, created.ticketId),
          ),
        );
      expect(jobs.map((job) => job.payload.inputRevision)).toContain(1);

      // The reporter still sees their answer, and can't send another.
      const status = await getReporterStatus(db, created.reporterToken);
      expect(status?.clarifications[0]).toMatchObject({
        answer: "Pintu kaca sisi barat",
        isOpen: false,
      });
    });

    it("needs a reason to continue without an answer, then hides the question", async () => {
      const created = await asked();
      const command = {
        tenantId: created.tenantId,
        ticketId: created.ticketId,
        actor: created.operator,
        expectedRevision: 1,
      };

      expect(
        await resumeAfterClarification(db, { ...command, reason: null }),
      ).toEqual({
        ok: false,
        rejection: { code: "missing_requirements", missing: ["reason"] },
      });

      const outcome = await resumeAfterClarification(db, {
        ...command,
        reason: "Pelapor tidak menjawab, lokasi sudah jelas dari foto",
      });
      expect(outcome.ok).toBe(true);

      const status = await getReporterStatus(db, created.reporterToken);
      expect(status?.clarifications).toEqual([]);
      expect(
        await answerClarification(db, {
          token: created.reporterToken,
          clarificationId: created.questionId,
          answer: "Terlambat",
        }),
      ).toEqual({ ok: false, code: "unavailable" });

      const [row] = await db
        .select({ revision: reports.revision })
        .from(reports)
        .where(eq(reports.id, created.reportId));
      expect(row?.revision).toBe(0);
    });

    it("stops taking answers once the ticket is cancelled", async () => {
      const created = await asked();
      const cancelled = await transitionTicket(db, {
        tenantId: created.tenantId,
        ticketId: created.ticketId,
        actor: created.operator,
        to: "cancelled",
        expectedRevision: 1,
        provided: ["reason"],
        payload: { reason: "Laporan ganda" },
      });
      expect(cancelled.ok).toBe(true);

      const status = await getReporterStatus(db, created.reporterToken);
      expect(status?.clarifications).toEqual([]);
      expect(
        await answerClarification(db, {
          token: created.reporterToken,
          clarificationId: created.questionId,
          answer: "Terlambat",
        }),
      ).toEqual({ ok: false, code: "unavailable" });
    });

    it("closes the question when the report is linked as a duplicate", async () => {
      const created = await asked();
      const target = await report("Pintu lobi lepas");

      const linked = await linkDuplicate(db, {
        tenantId: created.tenantId,
        sourceTicketId: created.ticketId,
        targetTicketId: target.ticketId,
        actor: created.operator,
        expectedRevision: 1,
        reason: "Pintu yang sama",
      });
      expect(linked.ok).toBe(true);

      const status = await getReporterStatus(db, created.reporterToken);
      expect(status?.clarifications).toEqual([]);
    });

    it("rejects a technician asking, and an empty question", async () => {
      const created = await report();
      const technician = await memberWith(created.tenantId, "technician");
      const operator = await memberWith(created.tenantId, "operator");

      const byTechnician = await requestClarification(db, {
        tenantId: created.tenantId,
        ticketId: created.ticketId,
        actor: technician,
        expectedRevision: 0,
        question: "Yang mana?",
      });
      expect(byTechnician.ok).toBe(false);

      const empty = await requestClarification(db, {
        tenantId: created.tenantId,
        ticketId: created.ticketId,
        actor: operator,
        expectedRevision: 0,
        question: "   ",
      });
      expect(empty).toEqual({
        ok: false,
        rejection: { code: "missing_requirements", missing: ["reason"] },
      });
    });
  },
);
