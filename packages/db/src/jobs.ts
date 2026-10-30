import { and, asc, eq, lt, lte, or, sql } from "drizzle-orm";
import type { Db } from "./client";
import { outbox } from "./schema";

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
