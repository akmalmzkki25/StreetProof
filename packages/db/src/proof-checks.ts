import { and, asc, eq, inArray } from "drizzle-orm";
import { nextEventSeq } from "./ticket-commands";
import type { Db } from "./client";
import {
  completionSubmissions,
  locations,
  proofChecks,
  reports,
  ticketEvents,
  tickets,
  uploads,
} from "./schema";

type StoredPhoto = { objectKey: string; contentType: string };

// Everything the model may read. Names, contact details and tokens are never selected.
export async function loadProofCheckInput(db: Db, completionId: string) {
  const [attempt] = await db
    .select({
      completionId: completionSubmissions.id,
      tenantId: completionSubmissions.tenantId,
      ticketId: completionSubmissions.ticketId,
      status: completionSubmissions.status,
      note: completionSubmissions.note,
      checklist: completionSubmissions.checklist,
      exceptionReason: completionSubmissions.exceptionReason,
      category: tickets.category,
    })
    .from(completionSubmissions)
    .innerJoin(tickets, eq(tickets.id, completionSubmissions.ticketId))
    .where(eq(completionSubmissions.id, completionId));
  if (!attempt) return null;

  const ticketReports = await db
    .select({
      id: reports.id,
      description: reports.description,
      locationText: reports.locationText,
      locationName: locations.name,
    })
    .from(reports)
    .leftJoin(locations, eq(locations.id, reports.locationId))
    .where(eq(reports.canonicalTicketId, attempt.ticketId))
    .orderBy(asc(reports.createdAt));

  const photoFields = {
    objectKey: uploads.objectKey,
    contentType: uploads.contentType,
  };
  const beforePhotos: StoredPhoto[] = await db
    .select(photoFields)
    .from(uploads)
    .where(
      and(
        eq(uploads.state, "ready"),
        inArray(
          uploads.reportId,
          ticketReports.map((report) => report.id),
        ),
      ),
    )
    .orderBy(asc(uploads.createdAt));
  const afterPhotos: StoredPhoto[] = await db
    .select(photoFields)
    .from(uploads)
    .where(
      and(eq(uploads.state, "ready"), eq(uploads.completionId, completionId)),
    )
    .orderBy(asc(uploads.createdAt));

  return {
    ...attempt,
    reports: ticketReports.map((report) => ({
      description: report.description,
      location: report.locationName ?? report.locationText ?? "",
    })),
    beforePhotos,
    afterPhotos,
  };
}

export type ProofCheckInput = NonNullable<
  Awaited<ReturnType<typeof loadProofCheckInput>>
>;

export async function markProofCheckRunning(
  db: Db,
  key: {
    completionId: string;
    model: string;
    promptVersion: string;
    attempts: number;
    inputDigest: string;
  },
) {
  await db
    .update(proofChecks)
    .set({
      state: "running",
      model: key.model,
      promptVersion: key.promptVersion,
      attempts: key.attempts,
      inputDigest: key.inputDigest,
      error: null,
    })
    .where(eq(proofChecks.completionId, key.completionId));
}

export async function recordProofCheckSuccess(
  db: Db,
  key: {
    tenantId: string;
    ticketId: string;
    completionId: string;
    result: Record<string, unknown>;
    latencyMs: number;
    usage: Record<string, unknown>;
  },
) {
  await db.transaction(async function save(tx) {
    await tx
      .update(proofChecks)
      .set({
        state: "succeeded",
        result: key.result,
        latencyMs: key.latencyMs,
        usage: key.usage,
        error: null,
        completedAt: new Date(),
      })
      .where(eq(proofChecks.completionId, key.completionId));

    // Serializes with transitionTicket so event sequence numbers stay unique.
    // Status and revision are untouched: this is only a hint.
    await tx
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.id, key.ticketId))
      .for("update");
    await tx.insert(ticketEvents).values({
      tenantId: key.tenantId,
      ticketId: key.ticketId,
      seq: await nextEventSeq(tx, key.ticketId),
      type: "ai_proof_check_ready",
      payload: { completionId: key.completionId },
    });
  });
}

export async function recordProofCheckFailure(
  db: Db,
  key: {
    completionId: string;
    state: "failed_retryable" | "failed_terminal" | "skipped_manual";
    errorClass: string | null;
  },
) {
  await db
    .update(proofChecks)
    .set({
      state: key.state,
      error: key.errorClass,
      completedAt: key.state === "failed_retryable" ? null : new Date(),
    })
    .where(eq(proofChecks.completionId, key.completionId));
}
