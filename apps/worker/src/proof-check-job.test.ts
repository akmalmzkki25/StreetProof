import type { ProofCheck } from "@streetproof/contracts";
import {
  acceptWork,
  assignTicket,
  createDb,
  decideCompletion,
  schema,
  submitCompletion,
  submitReport,
  transitionTicket,
  triageTicket,
  type ReportPhoto,
} from "@streetproof/db";
import { checklistFor, type Role } from "@streetproof/domain";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { ModelCallError, type CallModel } from "./meta-client";
import {
  handleUnexpectedProofFailure,
  PROOF_CHECK_TOPIC,
  runProofCheckJob,
} from "./proof-check-job";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
const url = process.env.DATABASE_URL;

const { aiDrafts, assignments, completionSubmissions, idempotencyKeys } =
  schema;
const { memberships, outbox, proofChecks, reporterCredentials, reports } =
  schema;
const { sites, tenants, ticketEvents, tickets, uploads, verifications } =
  schema;

const validCheck: ProofCheck = {
  sameLocation: "different",
  reportedProblem: "unclear",
  observations: ["The after photo shows a door, not a sink."],
  missingProof: ["A photo of the pipe joint"],
  limitations: [],
};

function replying(text: string): CallModel {
  return vi.fn(async () => ({
    outputText: text,
    usage: { input_tokens: 1 },
    latencyMs: 5,
  }));
}

function photo(name: string): ReportPhoto {
  return {
    objectKey: `test/${randomUUID()}-${name}.jpg`,
    contentType: "image/jpeg",
    bytes: 10,
    sha256: "abc",
  };
}

describe.skipIf(!url)(
  "runProofCheckJob (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];
    const reportIds: string[] = [];
    const keys: string[] = [];

    afterEach(async () => {
      if (ticketIds.length === 0) return;
      const attempts = await db
        .select({ id: completionSubmissions.id })
        .from(completionSubmissions)
        .where(inArray(completionSubmissions.ticketId, ticketIds));
      const attemptIds = attempts.map((attempt) => attempt.id);
      await db.delete(uploads).where(inArray(uploads.reportId, reportIds));
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
      await db.delete(aiDrafts).where(inArray(aiDrafts.reportId, reportIds));
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
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

    async function memberWith(tenantId: string, role: Role) {
      const [member] = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(
          and(eq(memberships.tenantId, tenantId), eq(memberships.role, role)),
        );
      if (!member) throw new Error("Run pnpm db:seed first.");
      return { userId: member.userId, roles: [role] };
    }

    // A real attempt through the real commands, waiting for a supervisor.
    async function newAttempt(reportPhotos: ReportPhoto[] = [photo("before")]) {
      const [site] = await db
        .select({ id: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!site) throw new Error("Run pnpm db:seed first.");
      const tenantId = site.tenantId;

      const reportId = randomUUID();
      const idempotencyKey = randomUUID();
      keys.push(idempotencyKey);
      reportIds.push(reportId);
      const submitted = await submitReport(db, {
        tenantId,
        siteId: site.id,
        reportId,
        locationId: null,
        locationText: "Floor 3 pantry",
        description: "Water below the sink",
        photos: reportPhotos,
        idempotencyKey,
        requestDigest: "digest",
      });
      if (!submitted.ok) throw new Error(submitted.code);
      const { ticketId } = submitted;
      ticketIds.push(ticketId);

      const operator = await memberWith(tenantId, "operator");
      const technician = await memberWith(tenantId, "technician");
      const ref = { tenantId, ticketId };
      let revision = 0;
      async function step(outcome: Promise<unknown>) {
        const result = (await outcome) as {
          ok: boolean;
          ticket: { revision: number };
        };
        if (!result.ok) throw new Error("A setup step was refused.");
        revision = result.ticket.revision;
      }
      await step(
        triageTicket(db, {
          ...ref,
          actor: operator,
          expectedRevision: revision,
          summary: "Leak under the sink",
          category: "plumbing",
          priority: "normal",
          locationId: null,
        }),
      );
      await step(
        assignTicket(db, {
          ...ref,
          siteId: site.id,
          actor: operator,
          expectedRevision: revision,
          technicianId: technician.userId,
        }),
      );
      await step(
        acceptWork(db, {
          ...ref,
          actor: technician,
          expectedRevision: revision,
        }),
      );
      await step(
        transitionTicket(db, {
          ...ref,
          actor: technician,
          to: "in_progress",
          expectedRevision: revision,
          provided: [],
        }),
      );
      await step(
        submitCompletion(db, {
          ...ref,
          actor: technician,
          expectedRevision: revision,
          note: "Tightened the joint.",
          photos: [photo("after")],
          checkedItemIds: checklistFor("plumbing").map((item) => item.id),
          exceptionReason: null,
        }),
      );

      const [job] = await db
        .select()
        .from(outbox)
        .where(
          and(
            eq(outbox.topic, PROOF_CHECK_TOPIC),
            eq(sql`${outbox.payload}->>'ticketId'`, ticketId),
          ),
        );
      if (!job) throw new Error("no job");
      return { job, ticketId, tenantId, revision };
    }

    function deps(callModel: CallModel) {
      return {
        db,
        callModel,
        readPhoto: async (objectKey: string) =>
          new TextEncoder().encode(objectKey),
        model: "test-model",
      };
    }

    async function checkOf(job: { payload: Record<string, unknown> }) {
      const [check] = await db
        .select()
        .from(proofChecks)
        .where(eq(proofChecks.completionId, String(job.payload.completionId)));
      return check;
    }

    it("stores the hint, sending before photos first, without moving the ticket", async () => {
      const { job, ticketId, revision } = await newAttempt();
      const callModel = replying(JSON.stringify(validCheck));

      const outcome = await runProofCheckJob(deps(callModel), job);

      expect(outcome).toBe("succeeded");
      expect(await checkOf(job)).toMatchObject({
        state: "succeeded",
        model: "test-model",
        result: { sameLocation: "different" },
      });
      const [request] = vi.mocked(callModel).mock.calls[0] ?? [];
      const sent = (request?.images ?? []).map((image) =>
        Buffer.from(image.base64, "base64").toString(),
      );
      expect(sent).toHaveLength(2);
      expect(sent[0]).toContain("before");
      expect(sent[1]).toContain("after");
      expect(request?.text).toContain("Tightened the joint.");

      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));
      expect(ticket).toMatchObject({
        status: "completion_submitted",
        revision,
      });
      const events = await db
        .select()
        .from(ticketEvents)
        .where(eq(ticketEvents.ticketId, ticketId));
      expect(events.map((event) => event.type)).toContain(
        "ai_proof_check_ready",
      );
    });

    it("won't report a problem as gone from a photo of somewhere else", async () => {
      const { job } = await newAttempt();
      const callModel = replying(
        JSON.stringify({ ...validCheck, reportedProblem: "not_visible" }),
      );

      await runProofCheckJob(deps(callModel), job);

      expect(await checkOf(job)).toMatchObject({
        result: { sameLocation: "different", reportedProblem: "unclear" },
      });
    });

    it("spends nothing once a supervisor has already decided", async () => {
      const { job, ticketId, tenantId, revision } = await newAttempt();
      const decided = await decideCompletion(db, {
        tenantId,
        ticketId,
        actor: await memberWith(tenantId, "supervisor"),
        expectedRevision: revision,
        decision: "rejected",
        reason: "The photo shows a door.",
      });
      expect(decided.ok).toBe(true);
      const callModel = replying(JSON.stringify(validCheck));

      const outcome = await runProofCheckJob(deps(callModel), job);

      expect(outcome).toBe("skipped_manual");
      expect(callModel).not.toHaveBeenCalled();
      expect(await checkOf(job)).toMatchObject({ state: "skipped_manual" });
    });

    it("spends nothing when the report has no photo to compare with", async () => {
      const { job } = await newAttempt([]);
      const callModel = replying(JSON.stringify(validCheck));

      const outcome = await runProofCheckJob(deps(callModel), job);

      expect(outcome).toBe("skipped_manual");
      expect(callModel).not.toHaveBeenCalled();
    });

    it("retries bad output, then gives up and leaves the decision alone", async () => {
      const { job, ticketId } = await newAttempt();
      const callModel = replying("not json");

      expect(
        await runProofCheckJob(deps(callModel), { ...job, attempts: 1 }),
      ).toBe("retrying");
      expect(await checkOf(job)).toMatchObject({
        state: "failed_retryable",
        error: "invalid_output",
      });

      expect(
        await runProofCheckJob(deps(callModel), { ...job, attempts: 3 }),
      ).toBe("failed_terminal");
      expect(await checkOf(job)).toMatchObject({ state: "failed_terminal" });

      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId));
      expect(ticket).toMatchObject({ status: "completion_submitted" });
    });

    it("doesn't retry a content policy denial", async () => {
      const { job } = await newAttempt();
      const callModel: CallModel = async () => {
        throw new ModelCallError("terminal", "content_policy_violation");
      };

      expect(await runProofCheckJob(deps(callModel), job)).toBe(
        "failed_terminal",
      );
      expect(await checkOf(job)).toMatchObject({
        error: "content_policy_violation",
      });
    });

    it("stops retrying a crash, such as storage being down", async () => {
      const { job } = await newAttempt();

      expect(
        await handleUnexpectedProofFailure(db, { ...job, attempts: 1 }),
      ).toBe("retrying");
      expect(await checkOf(job)).toMatchObject({ state: "queued" });

      expect(
        await handleUnexpectedProofFailure(db, { ...job, attempts: 3 }),
      ).toBe("failed_terminal");
      expect(await checkOf(job)).toMatchObject({
        state: "failed_terminal",
        error: "worker_error",
      });
      const [row] = await db.select().from(outbox).where(eq(outbox.id, job.id));
      expect(row?.status).toBe("failed");
    });

    it("drops a job whose worker keeps dying before it can report", async () => {
      const { job } = await newAttempt();
      const callModel = replying(JSON.stringify(validCheck));

      const outcome = await runProofCheckJob(deps(callModel), {
        ...job,
        attempts: 4,
      });

      expect(outcome).toBe("failed_terminal");
      expect(callModel).not.toHaveBeenCalled();
    });
  },
);
