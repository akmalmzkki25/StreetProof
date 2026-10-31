import {
  claimOutboxJob,
  errorFields,
  getDb,
  logEvent,
  recordHeartbeat,
  type OutboxJob,
} from "@streetproof/db";
import { createMailer } from "@streetproof/db/mail";
import { createStorage, storageConfigFromEnv } from "@streetproof/db/storage";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  DRAFT_TOPIC,
  handleUnexpectedFailure,
  runDraftJob,
  type JobOutcome,
} from "./draft-job";
import { createMetaClient } from "./meta-client";
import {
  handleUnexpectedNotificationFailure,
  NOTIFICATION_TOPIC,
  runNotificationJob,
} from "./notification-job";
import {
  handleUnexpectedProofFailure,
  PROOF_CHECK_TOPIC,
  runProofCheckJob,
} from "./proof-check-job";

const POLL_INTERVAL_MS = 2000;
const AUTH_FAILURE_PAUSE_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = 30_000;

// The monorepo has one .env at the root. Values already set win.
const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const apiKey = process.env.META_API_KEY;
if (!apiKey) {
  throw new Error("META_API_KEY is not set in the root .env.");
}
const baseUrl = process.env.META_API_BASE_URL || "https://api.meta.ai/v1";
const model = process.env.META_MODEL || "muse-spark-1.3";
const appUrl = process.env.APP_URL ?? "";

const db = getDb();
const storage = createStorage(storageConfigFromEnv());
const callModel = createMetaClient({ apiKey, baseUrl, model });
const sendMail = createMailer();
const modelDeps = { db, callModel, readPhoto: storage.getObjectBytes, model };

// In the order they're claimed: an operator waits on a draft, while a proof check
// is a hint and a status email can arrive a little later.
const HANDLERS: readonly {
  topic: string;
  run: (job: OutboxJob) => Promise<JobOutcome>;
  onCrash: (job: OutboxJob) => Promise<JobOutcome>;
}[] = [
  {
    topic: DRAFT_TOPIC,
    run: (job) => runDraftJob(modelDeps, job),
    onCrash: (job) => handleUnexpectedFailure(db, job),
  },
  {
    topic: PROOF_CHECK_TOPIC,
    run: (job) => runProofCheckJob(modelDeps, job),
    onCrash: (job) => handleUnexpectedProofFailure(db, job),
  },
  {
    topic: NOTIFICATION_TOPIC,
    run: (job) => runNotificationJob({ db, sendMail, appUrl }, job),
    onCrash: (job) => handleUnexpectedNotificationFailure(db, job),
  },
];

let isStopping = false;
function stop() {
  isStopping = true;
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Waits between jobs, not during one, so a stop signal lets the current job end.
async function runOnce(): Promise<number> {
  for (const handler of HANDLERS) {
    const job = await claimOutboxJob(db, handler.topic);
    if (!job) continue;

    const fields = { topic: job.topic, jobId: job.id, attempt: job.attempts };
    try {
      const outcome = await handler.run(job);
      logEvent("info", "Job finished", { ...fields, outcome });
      if (outcome === "auth_failed") {
        logEvent(
          "error",
          "Meta rejected the key, billing or permissions. Pausing.",
          fields,
        );
        return AUTH_FAILURE_PAUSE_MS;
      }
      return 0;
    } catch (error) {
      logEvent("error", "Job crashed", { ...fields, ...errorFields(error) });
      await handler.onCrash(job);
      return POLL_INTERVAL_MS;
    }
  }
  return POLL_INTERVAL_MS;
}

logEvent("info", "Worker started", { model, email: sendMail !== null });
let lastHeartbeatAt = 0;
while (!isStopping) {
  try {
    if (Date.now() - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
      await recordHeartbeat(db, "worker");
      lastHeartbeatAt = Date.now();
    }
    const delay = await runOnce();
    if (delay > 0) await sleep(delay);
  } catch (error) {
    logEvent("error", "Worker poll failed", errorFields(error));
    await sleep(POLL_INTERVAL_MS);
  }
}
logEvent("info", "Worker stopped");
process.exit(0);
