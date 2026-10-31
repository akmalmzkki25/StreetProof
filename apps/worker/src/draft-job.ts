import {
  completeOutboxJob,
  failOutboxJob,
  loadDraftInput,
  markDraftRunning,
  recordDraftFailure,
  recordDraftSuccess,
  retryOutboxJob,
  type Db,
  type OutboxJob,
} from "@streetproof/db";
import {
  intakeDraftJsonSchema,
  parseIntakeDraft,
} from "@streetproof/contracts";
import { createHash } from "node:crypto";

import {
  applyDraftPolicy,
  buildPromptText,
  INTAKE_INSTRUCTIONS,
  PROMPT_VERSION,
} from "./intake-prompt";
import { ModelCallError, type CallModel } from "./meta-client";

export const DRAFT_TOPIC = "report.submitted";

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 1000;
const WORKER_ERROR = "worker_error";

export type JobOutcome =
  | "succeeded"
  | "retrying"
  | "failed_terminal"
  | "auth_failed"
  | "skipped_manual";

type Deps = {
  db: Db;
  callModel: CallModel;
  readPhoto: (objectKey: string) => Promise<Uint8Array>;
  model: string;
};

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

export function backoffMs(attempt: number, random = Math.random()) {
  return BASE_BACKOFF_MS * 2 ** attempt + random * BASE_BACKOFF_MS;
}

// The ticket stays where it is and the operator triages by hand, or retries.
async function giveUpOnJob(db: Db, job: OutboxJob) {
  await failOutboxJob(db, job.id, WORKER_ERROR);
  await recordDraftFailure(db, {
    tenantId: job.tenantId,
    reportId: String(job.payload.reportId),
    inputRevision: Number(job.payload.inputRevision),
    promptVersion: PROMPT_VERSION,
    state: "failed_terminal",
    errorClass: WORKER_ERROR,
  });
}

// Anything that isn't a model failure, such as storage being down. It's capped
// like a model failure, so one job can't retry forever.
export async function handleUnexpectedFailure(
  db: Db,
  job: OutboxJob,
): Promise<JobOutcome> {
  if (job.attempts < MAX_ATTEMPTS) {
    await retryOutboxJob(
      db,
      job.id,
      new Date(Date.now() + backoffMs(job.attempts)),
      WORKER_ERROR,
    );
    return "retrying";
  }
  await giveUpOnJob(db, job);
  return "failed_terminal";
}

export async function runDraftJob(
  deps: Deps,
  job: OutboxJob,
): Promise<JobOutcome> {
  const { db, callModel, readPhoto, model } = deps;
  const reportId = String(job.payload.reportId);

  // Over the limit only when workers died mid-job and leases expired, so no
  // failure was ever handled. The job may be what kills them.
  if (job.attempts > MAX_ATTEMPTS) {
    await giveUpOnJob(db, job);
    return "failed_terminal";
  }

  const input = await loadDraftInput(db, reportId);
  if (!input) {
    await failOutboxJob(db, job.id, "report_not_found");
    return "failed_terminal";
  }

  // A reporter's answer queued a newer job, so this one would pay for its draft
  // twice. It only happens when jobs were still waiting at that moment.
  if (job.payload.inputRevision !== input.revision) {
    await completeOutboxJob(db, job.id);
    return "skipped_manual";
  }

  const key = {
    tenantId: input.tenantId,
    reportId,
    inputRevision: input.revision,
    promptVersion: PROMPT_VERSION,
  };

  const photoBytes = await Promise.all(
    input.photos.map((photo) => readPhoto(photo.objectKey)),
  );
  const { text, maps } = buildPromptText(input);
  const inputDigest = sha256(
    [text, ...photoBytes.map((bytes) => sha256(bytes))].join("\n"),
  );

  await markDraftRunning(db, {
    ...key,
    model,
    attempts: job.attempts,
    inputDigest,
  });

  // A person already moved on, so don't spend money on a draft nobody will read.
  if (input.ticketStatus !== "submitted" || input.isLinkedDuplicate) {
    await recordDraftFailure(db, {
      ...key,
      state: "skipped_manual",
      errorClass: null,
    });
    await completeOutboxJob(db, job.id);
    return "skipped_manual";
  }

  try {
    const response = await callModel({
      instructions: INTAKE_INSTRUCTIONS,
      text,
      images: photoBytes.map((bytes, index) => ({
        contentType: input.photos[index]?.contentType ?? "image/jpeg",
        base64: Buffer.from(bytes).toString("base64"),
      })),
      jsonSchema: intakeDraftJsonSchema(),
      schemaName: "intake_draft",
      safetyIdentifier: sha256(input.tenantId).slice(0, 64),
    });

    const parsed = parseIntakeDraft(safeJson(response.outputText));
    if (!parsed.success) {
      throw new ModelCallError("retryable", "invalid_output");
    }

    await recordDraftSuccess(db, {
      ...key,
      ticketId: input.ticketId,
      draft: applyDraftPolicy(parsed.data, maps, input.revision),
      latencyMs: response.latencyMs,
      usage: response.usage,
    });
    await completeOutboxJob(db, job.id);
    return "succeeded";
  } catch (error) {
    if (!(error instanceof ModelCallError)) throw error;

    const canRetry =
      error.failureClass === "retryable" && job.attempts < MAX_ATTEMPTS;
    if (canRetry) {
      const delay = Math.max(backoffMs(job.attempts), error.retryAfterMs ?? 0);
      await recordDraftFailure(db, {
        ...key,
        state: "failed_retryable",
        errorClass: error.errorClass,
      });
      await retryOutboxJob(
        db,
        job.id,
        new Date(Date.now() + delay),
        error.errorClass,
      );
      return "retrying";
    }

    // Terminal for the draft only. The ticket stays where it is and the
    // operator triages by hand.
    await recordDraftFailure(db, {
      ...key,
      state: "failed_terminal",
      errorClass: error.errorClass,
    });
    await failOutboxJob(db, job.id, error.errorClass);
    return error.failureClass === "auth" ? "auth_failed" : "failed_terminal";
  }
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
