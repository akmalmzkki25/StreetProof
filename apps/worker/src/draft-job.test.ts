import type { IntakeDraft } from "@streetproof/contracts";
import {
  claimOutboxJob,
  createDb,
  linkDuplicate,
  retryDraft,
  schema,
  submitReport,
  triageTicket,
} from "@streetproof/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { DRAFT_TOPIC, handleUnexpectedFailure, runDraftJob } from "./draft-job";
import { ModelCallError, type CallModel } from "./meta-client";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
const url = process.env.DATABASE_URL;

const { aiDrafts, duplicateLinks, idempotencyKeys, memberships, outbox } =
  schema;
const { reporterCredentials } = schema;
const { reports, sites, tenants, ticketEvents, tickets } = schema;

const validDraft: IntakeDraft = {
  summary: "Leak under the sink",
  visibleFacts: [],
  userContext: [],
  inferences: [],
  missing_fields: [],
  categoryCandidate: "plumbing",
  priorityCandidate: "normal",
  priorityRationale: "Water on the floor",
  duplicateCandidates: [],
  limitations: [],
  damagePhrase: "",
};

function replying(text: string): CallModel {
  return vi.fn(async () => ({
    outputText: text,
    usage: { input_tokens: 1 },
    latencyMs: 5,
  }));
}

describe.skipIf(!url)("runDraftJob (needs the seeded local database)", () => {
  const { db, pool } = createDb(url ?? "");
  const ticketIds: string[] = [];
  const reportIds: string[] = [];
  const keys: string[] = [];

  afterEach(async () => {
    if (ticketIds.length > 0) {
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
        .delete(duplicateLinks)
        .where(inArray(duplicateLinks.sourceTicketId, ticketIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, keys));
    }
    ticketIds.length = 0;
    reportIds.length = 0;
    keys.length = 0;
  });

  afterAll(async () => {
    await pool.end();
  });

  async function newJob() {
    const [site] = await db
      .select({ id: sites.id, tenantId: sites.tenantId })
      .from(sites)
      .innerJoin(tenants, eq(tenants.id, sites.tenantId))
      .where(eq(tenants.name, "Graha Contoh (synthetic)"));
    if (!site) throw new Error("Run pnpm db:seed first.");

    const reportId = randomUUID();
    const idempotencyKey = randomUUID();
    keys.push(idempotencyKey);
    reportIds.push(reportId);
    const outcome = await submitReport(db, {
      tenantId: site.tenantId,
      siteId: site.id,
      reportId,
      locationId: null,
      locationText: "Floor 3 pantry",
      description: "Water below the sink",
      photos: [],
      idempotencyKey,
      requestDigest: "digest",
    });
    if (!outcome.ok) throw new Error(outcome.code);
    ticketIds.push(outcome.ticketId);

    const [job] = await db
      .select()
      .from(outbox)
      .where(eq(sql`${outbox.payload}->>'ticketId'`, outcome.ticketId));
    if (!job) throw new Error("no job");
    return {
      job,
      reportId,
      ticketId: outcome.ticketId,
      tenantId: site.tenantId,
    };
  }

  function deps(callModel: CallModel) {
    return {
      db,
      callModel,
      readPhoto: async () => new Uint8Array(),
      model: "test-model",
    };
  }

  async function draftOf(reportId: string) {
    const [draft] = await db
      .select()
      .from(aiDrafts)
      .where(eq(aiDrafts.reportId, reportId));
    return draft;
  }

  it("stores the draft without touching ticket status or revision", async () => {
    const { job, reportId, ticketId } = await newJob();

    const outcome = await runDraftJob(
      deps(replying(JSON.stringify(validDraft))),
      job,
    );

    expect(outcome).toBe("succeeded");
    expect(await draftOf(reportId)).toMatchObject({
      state: "succeeded",
      model: "test-model",
      latencyMs: 5,
      draft: { summary: "Leak under the sink" },
    });
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    expect(ticket).toMatchObject({ status: "submitted", revision: 0 });

    const events = await db
      .select()
      .from(ticketEvents)
      .where(eq(ticketEvents.ticketId, ticketId));
    expect(events.map((event) => event.type)).toEqual([
      "report_submitted",
      "ai_draft_ready",
    ]);
  });

  it("queues the damage outline only when the draft names something", async () => {
    const locateJobs = (ticketId: string) =>
      db
        .select()
        .from(outbox)
        .where(
          and(
            eq(outbox.topic, "report.locate_damage"),
            eq(sql`${outbox.payload}->>'ticketId'`, ticketId),
          ),
        );

    const silent = await newJob();
    await runDraftJob(deps(replying(JSON.stringify(validDraft))), silent.job);
    expect(await locateJobs(silent.ticketId)).toEqual([]);

    const named = await newJob();
    await runDraftJob(
      deps(
        replying(
          JSON.stringify({ ...validDraft, damagePhrase: "water puddle" }),
        ),
      ),
      named.job,
    );
    const [job] = await locateJobs(named.ticketId);
    expect(job?.payload).toMatchObject({ phrase: "water puddle" });
  });

  it("retries bad output, then gives up and leaves the ticket for manual triage", async () => {
    const { job, reportId, ticketId } = await newJob();
    const callModel = replying("not json");

    const first = await runDraftJob(deps(callModel), { ...job, attempts: 1 });
    expect(first).toBe("retrying");
    expect(await draftOf(reportId)).toMatchObject({
      state: "failed_retryable",
      error: "invalid_output",
    });

    const last = await runDraftJob(deps(callModel), { ...job, attempts: 3 });
    expect(last).toBe("failed_terminal");
    expect(await draftOf(reportId)).toMatchObject({ state: "failed_terminal" });

    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    expect(ticket).toMatchObject({ status: "submitted" });
  });

  it("retries a crash, then gives up so the ticket stops waiting on a draft", async () => {
    const { job, reportId, ticketId } = await newJob();
    const readJob = async () => {
      const [row] = await db.select().from(outbox).where(eq(outbox.id, job.id));
      return row;
    };

    const first = await handleUnexpectedFailure(db, { ...job, attempts: 1 });
    expect(first).toBe("retrying");
    expect(await readJob()).toMatchObject({
      status: "pending",
      lastError: "worker_error",
    });
    expect(await draftOf(reportId)).toBeUndefined();

    const last = await handleUnexpectedFailure(db, { ...job, attempts: 3 });
    expect(last).toBe("failed_terminal");
    expect(await readJob()).toMatchObject({
      status: "failed",
      lastError: "worker_error",
    });
    // Nothing had written a draft row yet, as when photos can't be read.
    expect(await draftOf(reportId)).toMatchObject({
      state: "failed_terminal",
      error: "worker_error",
    });

    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    expect(ticket).toMatchObject({ status: "submitted" });
  });

  it("drops a job whose worker keeps dying before it can report", async () => {
    const { job, reportId } = await newJob();
    const callModel = replying(JSON.stringify(validDraft));

    const outcome = await runDraftJob(deps(callModel), { ...job, attempts: 4 });

    expect(outcome).toBe("failed_terminal");
    expect(callModel).not.toHaveBeenCalled();
    expect(await draftOf(reportId)).toMatchObject({
      state: "failed_terminal",
      error: "worker_error",
    });
  });

  it("lets an operator retry a failed draft once, without moving the ticket", async () => {
    const { job, reportId, ticketId, tenantId } = await newJob();
    await runDraftJob(deps(replying("not json")), { ...job, attempts: 3 });
    const [operator] = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(eq(memberships.tenantId, tenantId));
    if (!operator) throw new Error("no member");
    const command = { tenantId, ticketId, actorId: operator.userId };

    expect(await retryDraft(db, command)).toEqual({ ok: true });
    expect(await draftOf(reportId)).toMatchObject({
      state: "queued",
      error: null,
      completedAt: null,
    });
    // The first click already queued it, so a second can't pay for another.
    expect(await retryDraft(db, command)).toEqual({
      ok: false,
      code: "not_failed",
    });

    const jobs = await db
      .select()
      .from(outbox)
      .where(eq(sql`${outbox.payload}->>'ticketId'`, ticketId));
    const retried = jobs.find((row) => row.id !== job.id);
    if (!retried) throw new Error("no new job");
    expect(jobs).toHaveLength(2);

    const outcome = await runDraftJob(
      deps(replying(JSON.stringify(validDraft))),
      { ...retried, attempts: 1 },
    );
    expect(outcome).toBe("succeeded");
    expect(await draftOf(reportId)).toMatchObject({ state: "succeeded" });

    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    expect(ticket).toMatchObject({ status: "submitted", revision: 0 });
    const events = await db
      .select()
      .from(ticketEvents)
      .where(eq(ticketEvents.ticketId, ticketId));
    expect(events.map((event) => event.type)).toContain("ai_draft_retried");
    expect(
      events.find((event) => event.type === "ai_draft_retried")?.actorId,
    ).toBe(operator.userId);
  });

  it("refuses a retry from another tenant or after triage", async () => {
    const { job, ticketId, tenantId } = await newJob();
    await runDraftJob(deps(replying("not json")), { ...job, attempts: 3 });
    const [operator] = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(
        and(
          eq(memberships.tenantId, tenantId),
          eq(memberships.role, "operator"),
        ),
      );
    if (!operator) throw new Error("no operator");

    expect(
      await retryDraft(db, {
        tenantId: randomUUID(),
        ticketId,
        actorId: operator.userId,
      }),
    ).toEqual({ ok: false, code: "not_found" });

    const triaged = await triageTicket(db, {
      tenantId,
      ticketId,
      actor: { userId: operator.userId, roles: ["operator"] },
      expectedRevision: 0,
      summary: "Leak under the sink",
      category: "plumbing",
      priority: "normal",
      locationId: null,
    });
    expect(triaged.ok).toBe(true);

    expect(
      await retryDraft(db, { tenantId, ticketId, actorId: operator.userId }),
    ).toEqual({ ok: false, code: "not_awaiting_triage" });
  });

  it("doesn't retry a content policy denial", async () => {
    const { job, reportId } = await newJob();
    const callModel: CallModel = async () => {
      throw new ModelCallError("terminal", "content_policy_violation");
    };

    const outcome = await runDraftJob(deps(callModel), job);

    expect(outcome).toBe("failed_terminal");
    expect(await draftOf(reportId)).toMatchObject({
      state: "failed_terminal",
      error: "content_policy_violation",
    });
  });

  it("signals a bad key so the worker can pause", async () => {
    const { job } = await newJob();
    const callModel: CallModel = async () => {
      throw new ModelCallError("auth", "invalid_api_key");
    };

    expect(await runDraftJob(deps(callModel), job)).toBe("auth_failed");
  });

  it("skips the model when a person already triaged the ticket", async () => {
    const { job, reportId, ticketId, tenantId } = await newJob();
    const [operator] = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(eq(memberships.tenantId, tenantId));
    if (!operator) throw new Error("Seed data is incomplete.");
    await triageTicket(db, {
      tenantId,
      ticketId,
      actor: { userId: operator.userId, roles: ["operator"] },
      expectedRevision: 0,
      summary: "Done by hand",
      category: "plumbing",
      priority: "normal",
      locationId: null,
    });
    const callModel = replying(JSON.stringify(validDraft));

    const outcome = await runDraftJob(deps(callModel), job);

    expect(outcome).toBe("skipped_manual");
    expect(callModel).not.toHaveBeenCalled();
    expect(await draftOf(reportId)).toMatchObject({ state: "skipped_manual" });
  });

  it("skips the model when the report is linked as a duplicate", async () => {
    const source = await newJob();
    const target = await newJob();
    const [operator] = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(eq(memberships.tenantId, source.tenantId));
    if (!operator) throw new Error("Seed data is incomplete.");
    const linked = await linkDuplicate(db, {
      tenantId: source.tenantId,
      sourceTicketId: source.ticketId,
      targetTicketId: target.ticketId,
      actor: { userId: operator.userId, roles: ["operator"] },
      expectedRevision: 0,
      reason: "Same leak",
    });
    expect(linked.ok).toBe(true);
    const callModel = replying(JSON.stringify(validDraft));

    const outcome = await runDraftJob(deps(callModel), source.job);

    expect(outcome).toBe("skipped_manual");
    expect(callModel).not.toHaveBeenCalled();
  });

  it("skips a job for a report revision that has been replaced", async () => {
    const { job, reportId } = await newJob();
    await db
      .update(reports)
      .set({ revision: 1 })
      .where(eq(reports.id, reportId));
    const callModel = replying(JSON.stringify(validDraft));

    const outcome = await runDraftJob(deps(callModel), job);

    expect(outcome).toBe("skipped_manual");
    expect(callModel).not.toHaveBeenCalled();
    expect(await draftOf(reportId)).toBeUndefined();
  });

  it("gives a job to only one of two racing claims", async () => {
    const { job } = await newJob();
    // Claims take the longest-waiting job first, so this one goes first even if
    // the queue already holds others.
    await db
      .update(outbox)
      .set({ availableAt: new Date(0) })
      .where(eq(outbox.id, job.id));

    const claims = await Promise.all([
      claimOutboxJob(db, DRAFT_TOPIC),
      claimOutboxJob(db, DRAFT_TOPIC),
    ]);

    const ids = claims.flatMap((claim) => (claim ? [claim.id] : []));
    expect(ids.filter((id) => id === job.id)).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
