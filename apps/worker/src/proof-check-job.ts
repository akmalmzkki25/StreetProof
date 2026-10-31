import { parseProofCheck, proofCheckJsonSchema } from "@streetproof/contracts";
import {
  completeOutboxJob,
  failOutboxJob,
  loadProofCheckInput,
  markProofCheckRunning,
  recordProofCheckFailure,
  recordProofCheckSuccess,
  retryOutboxJob,
  type Db,
  type OutboxJob,
} from "@streetproof/db";
import { createHash } from "node:crypto";

import {
  backoffMs,
  MAX_ATTEMPTS,
  safeJson,
  WORKER_ERROR,
  type JobOutcome,
} from "./draft-job";
import { ModelCallError, type CallModel } from "./meta-client";
import {
  applyProofCheckPolicy,
  buildProofCheckText,
  PROOF_CHECK_INSTRUCTIONS,
  PROOF_CHECK_PROMPT_VERSION,
} from "./proof-check-prompt";

export const PROOF_CHECK_TOPIC = "completion.submitted";

type Deps = {
  db: Db;
  callModel: CallModel;
  readPhoto: (objectKey: string) => Promise<Uint8Array>;
  model: string;
};

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

async function giveUpOnJob(db: Db, job: OutboxJob) {
  await failOutboxJob(db, job.id, WORKER_ERROR);
  await recordProofCheckFailure(db, {
    completionId: String(job.payload.completionId),
    state: "failed_terminal",
    errorClass: WORKER_ERROR,
  });
}

// Anything that isn't a model failure, such as storage being down.
export async function handleUnexpectedProofFailure(
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

export async function runProofCheckJob(
  deps: Deps,
  job: OutboxJob,
): Promise<JobOutcome> {
  const { db, callModel, readPhoto, model } = deps;
  const completionId = String(job.payload.completionId);

  // Over the limit only when workers died mid-job, as in runDraftJob.
  if (job.attempts > MAX_ATTEMPTS) {
    await giveUpOnJob(db, job);
    return "failed_terminal";
  }

  const input = await loadProofCheckInput(db, completionId);
  if (!input) {
    await failOutboxJob(db, job.id, "completion_not_found");
    return "failed_terminal";
  }

  // The supervisor already decided, or there's nothing to compare, so don't pay.
  if (input.status !== "pending" || input.beforePhotos.length === 0) {
    await recordProofCheckFailure(db, {
      completionId,
      state: "skipped_manual",
      errorClass: null,
    });
    await completeOutboxJob(db, job.id);
    return "skipped_manual";
  }

  const photos = [...input.beforePhotos, ...input.afterPhotos];
  const photoBytes = await Promise.all(
    photos.map((photo) => readPhoto(photo.objectKey)),
  );
  const text = buildProofCheckText(input);

  await markProofCheckRunning(db, {
    completionId,
    model,
    promptVersion: PROOF_CHECK_PROMPT_VERSION,
    attempts: job.attempts,
    inputDigest: sha256(
      [text, ...photoBytes.map((bytes) => sha256(bytes))].join("\n"),
    ),
  });

  try {
    const response = await callModel({
      instructions: PROOF_CHECK_INSTRUCTIONS,
      text,
      images: photoBytes.map((bytes, index) => ({
        contentType: photos[index]?.contentType ?? "image/jpeg",
        base64: Buffer.from(bytes).toString("base64"),
      })),
      jsonSchema: proofCheckJsonSchema(),
      schemaName: "proof_check",
      safetyIdentifier: sha256(input.tenantId).slice(0, 64),
    });

    const parsed = parseProofCheck(safeJson(response.outputText));
    if (!parsed.success) {
      throw new ModelCallError("retryable", "invalid_output");
    }

    await recordProofCheckSuccess(db, {
      tenantId: input.tenantId,
      ticketId: input.ticketId,
      completionId,
      result: applyProofCheckPolicy(parsed.data),
      latencyMs: response.latencyMs,
      usage: response.usage,
    });
    await completeOutboxJob(db, job.id);
    return "succeeded";
  } catch (error) {
    if (!(error instanceof ModelCallError)) throw error;

    if (error.failureClass === "retryable" && job.attempts < MAX_ATTEMPTS) {
      await recordProofCheckFailure(db, {
        completionId,
        state: "failed_retryable",
        errorClass: error.errorClass,
      });
      await retryOutboxJob(
        db,
        job.id,
        new Date(
          Date.now() +
            Math.max(backoffMs(job.attempts), error.retryAfterMs ?? 0),
        ),
        error.errorClass,
      );
      return "retrying";
    }

    // Terminal for the hint only. The supervisor reviews the photos unaided.
    await recordProofCheckFailure(db, {
      completionId,
      state: "failed_terminal",
      errorClass: error.errorClass,
    });
    await failOutboxJob(db, job.id, error.errorClass);
    return error.failureClass === "auth" ? "auth_failed" : "failed_terminal";
  }
}
