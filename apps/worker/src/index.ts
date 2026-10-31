import { claimOutboxJob, getDb } from "@streetproof/db";
import { createStorage, storageConfigFromEnv } from "@streetproof/db/storage";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { DRAFT_TOPIC, handleUnexpectedFailure, runDraftJob } from "./draft-job";
import { createMetaClient } from "./meta-client";

const POLL_INTERVAL_MS = 2000;
const AUTH_FAILURE_PAUSE_MS = 60_000;

// The monorepo has one .env at the root. Values already set win.
const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const apiKey = process.env.META_API_KEY;
if (!apiKey) {
  throw new Error("META_API_KEY is not set in the root .env.");
}
const baseUrl = process.env.META_API_BASE_URL || "https://api.meta.ai/v1";
const model = process.env.META_MODEL || "muse-spark-1.3";

const db = getDb();
const storage = createStorage(storageConfigFromEnv());
const callModel = createMetaClient({ apiKey, baseUrl, model });

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
  const job = await claimOutboxJob(db, DRAFT_TOPIC);
  if (!job) return POLL_INTERVAL_MS;

  try {
    const outcome = await runDraftJob(
      { db, callModel, readPhoto: storage.getObjectBytes, model },
      job,
    );
    console.info(`Draft job ${job.id}: ${outcome}`);
    if (outcome === "auth_failed") {
      console.error(
        "Meta rejected the key, billing or permissions. Pausing before the next job.",
      );
      return AUTH_FAILURE_PAUSE_MS;
    }
    return 0;
  } catch (error) {
    console.error(`Draft job ${job.id} failed unexpectedly`, error);
    await handleUnexpectedFailure(db, job);
    return POLL_INTERVAL_MS;
  }
}

console.info(`Worker started with model ${model}.`);
while (!isStopping) {
  try {
    const delay = await runOnce();
    if (delay > 0) await sleep(delay);
  } catch (error) {
    console.error("Worker poll failed", error);
    await sleep(POLL_INTERVAL_MS);
  }
}
console.info("Worker stopped.");
process.exit(0);
