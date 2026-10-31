import { errorFields, getDb, getJobHealth, logEvent } from "@streetproof/db";
import { connection } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

import { getStorage } from "@/lib/storage";

// The worker writes a heartbeat every 30 seconds, so this means it has stopped.
const WORKER_SILENT_AFTER_SECONDS = 120;

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function isAuthorized(request: Request, token: string) {
  const given = request.headers.get("authorization") ?? "";
  return timingSafeEqual(digest(given), digest(`Bearer ${token}`));
}

// For an uptime checker. It reports counts and ages only, never report content.
export async function GET(request: Request) {
  await connection();
  const token = process.env.MONITORING_TOKEN;
  if (!token) return new Response(null, { status: 404 });
  if (!isAuthorized(request, token)) return new Response(null, { status: 401 });

  const storageOk = await getStorage().isReachable();
  try {
    const jobs = await getJobHealth(getDb());
    const workerOk =
      jobs.workerLastSeenSeconds !== null &&
      jobs.workerLastSeenSeconds < WORKER_SILENT_AFTER_SECONDS;
    const ok = storageOk && workerOk;
    return Response.json(
      { ok, database: true, storage: storageOk, worker: workerOk, ...jobs },
      { status: ok ? 200 : 503 },
    );
  } catch (error) {
    logEvent("error", "Monitoring check failed", errorFields(error));
    return Response.json(
      { ok: false, database: false, storage: storageOk, worker: false },
      { status: 503 },
    );
  }
}
