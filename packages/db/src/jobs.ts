import {
  and,
  asc,
  count,
  eq,
  inArray,
  lt,
  lte,
  min,
  or,
  sql,
} from "drizzle-orm";
import type { Db } from "./client";
import { outbox, serviceHeartbeats } from "./schema";

// A worker that dies mid-job leaves its row "processing". Once the lease runs
// out, another claim picks it up.
const LEASE_MS = 2 * 60 * 1000;

export type OutboxJob = typeof outbox.$inferSelect;

// SKIP LOCKED lets several workers poll without taking the same row.
export async function claimOutboxJob(
  db: Db,
  topic: string,
  now = new Date(),
): Promise<OutboxJob | null> {
  return db.transaction(async function claim(tx) {
    const [job] = await tx
      .select()
      .from(outbox)
      .where(
        and(
          eq(outbox.topic, topic),
          or(
            and(eq(outbox.status, "pending"), lte(outbox.availableAt, now)),
            and(
              eq(outbox.status, "processing"),
              lt(outbox.lockedAt, new Date(now.getTime() - LEASE_MS)),
            ),
          ),
        ),
      )
      .orderBy(asc(outbox.availableAt))
      .limit(1)
      .for("update", { skipLocked: true });
    if (!job) return null;

    const [claimed] = await tx
      .update(outbox)
      .set({
        status: "processing",
        lockedAt: now,
        attempts: sql`${outbox.attempts} + 1`,
      })
      .where(eq(outbox.id, job.id))
      .returning();
    return claimed ?? null;
  });
}

export async function completeOutboxJob(db: Db, jobId: string) {
  await db
    .update(outbox)
    .set({ status: "done", lockedAt: null, lastError: null })
    .where(eq(outbox.id, jobId));
}

export async function retryOutboxJob(
  db: Db,
  jobId: string,
  availableAt: Date,
  errorClass: string,
) {
  await db
    .update(outbox)
    .set({
      status: "pending",
      lockedAt: null,
      availableAt,
      lastError: errorClass,
    })
    .where(eq(outbox.id, jobId));
}

export async function failOutboxJob(db: Db, jobId: string, errorClass: string) {
  await db
    .update(outbox)
    .set({ status: "failed", lockedAt: null, lastError: errorClass })
    .where(eq(outbox.id, jobId));
}

export async function recordHeartbeat(db: Db, service: string) {
  const lastSeenAt = new Date();
  await db
    .insert(serviceHeartbeats)
    .values({ service, lastSeenAt })
    .onConflictDoUpdate({
      target: serviceHeartbeats.service,
      set: { lastSeenAt },
    });
}

// What a monitor needs to tell whether work is flowing.
export async function getJobHealth(db: Db, now = new Date()) {
  const [heartbeat] = await db
    .select({ lastSeenAt: serviceHeartbeats.lastSeenAt })
    .from(serviceHeartbeats)
    .where(eq(serviceHeartbeats.service, "worker"));
  const rows = await db
    .select({
      topic: outbox.topic,
      status: outbox.status,
      total: count(),
      oldest: min(outbox.availableAt),
    })
    .from(outbox)
    .where(inArray(outbox.status, ["pending", "processing", "failed"]))
    .groupBy(outbox.topic, outbox.status);

  const oldestWaiting = rows
    .filter((row) => row.status === "pending" && row.oldest)
    .map((row) => (row.oldest as Date).getTime())
    .sort((first, second) => first - second)[0];

  return {
    workerLastSeenSeconds: heartbeat
      ? Math.floor((now.getTime() - heartbeat.lastSeenAt.getTime()) / 1000)
      : null,
    oldestWaitingSeconds: oldestWaiting
      ? Math.max(0, Math.floor((now.getTime() - oldestWaiting) / 1000))
      : 0,
    jobs: rows.map((row) => ({
      topic: row.topic,
      status: row.status,
      total: row.total,
    })),
  };
}
