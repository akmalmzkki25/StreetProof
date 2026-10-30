import { and, desc, eq, gt, inArray, ne, notInArray } from "drizzle-orm";
import type { Db } from "./client";
import {
  aiDrafts,
  duplicateLinks,
  locations,
  reports,
  ticketEvents,
  tickets,
  uploads,
} from "./schema";
import { nextEventSeq } from "./ticket-commands";

const DUPLICATE_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_DUPLICATE_CANDIDATES = 20;

type DraftKey = {
  tenantId: string;
  reportId: string;
  inputRevision: number;
  promptVersion: string;
};

// Everything the model may read. Reporter contact and tokens are never selected.
export async function loadDraftInput(db: Db, reportId: string) {
  const [report] = await db
    .select({
      id: reports.id,
      tenantId: reports.tenantId,
      siteId: reports.siteId,
      ticketId: reports.canonicalTicketId,
      ticketStatus: tickets.status,
      description: reports.description,
      revision: reports.revision,
      locationText: reports.locationText,
      locationName: locations.name,
    })
    .from(reports)
    .innerJoin(tickets, eq(tickets.id, reports.canonicalTicketId))
    .leftJoin(locations, eq(locations.id, reports.locationId))
    .where(eq(reports.id, reportId));
  if (!report) return null;

  const photos = await db
    .select({ objectKey: uploads.objectKey, contentType: uploads.contentType })
    .from(uploads)
    .where(and(eq(uploads.reportId, reportId), eq(uploads.state, "ready")));

  const [ownLink] = await db
    .select({ id: duplicateLinks.id })
    .from(duplicateLinks)
    .where(
      and(
        eq(duplicateLinks.sourceTicketId, report.ticketId),
        eq(duplicateLinks.active, true),
      ),
    );

  // Recent open work on the same site only, so a suggestion can't cross sites.
  const candidates = await db
    .select({
      ticketId: tickets.id,
      summary: tickets.summary,
      locationName: locations.name,
    })
    .from(tickets)
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .where(
      and(
        eq(tickets.tenantId, report.tenantId),
        eq(tickets.siteId, report.siteId),
        ne(tickets.id, report.ticketId),
        notInArray(tickets.status, ["verified_closed", "cancelled"]),
        notInArray(
          tickets.id,
          db
            .select({ id: duplicateLinks.sourceTicketId })
            .from(duplicateLinks)
            .where(eq(duplicateLinks.active, true)),
        ),
        gt(tickets.createdAt, new Date(Date.now() - DUPLICATE_LOOKBACK_MS)),
      ),
    )
    .orderBy(desc(tickets.createdAt))
    .limit(MAX_DUPLICATE_CANDIDATES);

  const candidateReports = await db
    .select({
      ticketId: reports.canonicalTicketId,
      description: reports.description,
    })
    .from(reports)
    .where(
      inArray(
        reports.canonicalTicketId,
        candidates.map((candidate) => candidate.ticketId),
      ),
    );

  return {
    ...report,
    location: report.locationName ?? report.locationText ?? "",
    isLinkedDuplicate: Boolean(ownLink),
    photos,
    duplicateCandidates: candidates.map((candidate) => ({
      ticketId: candidate.ticketId,
      location: candidate.locationName,
      text:
        candidate.summary ??
        candidateReports.find((item) => item.ticketId === candidate.ticketId)
          ?.description ??
        "",
    })),
  };
}

export type DraftInput = NonNullable<
  Awaited<ReturnType<typeof loadDraftInput>>
>;

// One row per report revision and prompt version, however many times it retries.
export async function markDraftRunning(
  db: Db,
  key: DraftKey & { model: string; attempts: number; inputDigest: string },
) {
  await db
    .insert(aiDrafts)
    .values({ ...key, state: "running" })
    .onConflictDoUpdate({
      target: [
        aiDrafts.reportId,
        aiDrafts.inputRevision,
        aiDrafts.promptVersion,
      ],
      set: {
        state: "running",
        model: key.model,
        attempts: key.attempts,
        inputDigest: key.inputDigest,
        error: null,
      },
    });
}

export async function recordDraftSuccess(
  db: Db,
  key: DraftKey & {
    ticketId: string;
    draft: Record<string, unknown>;
    latencyMs: number;
    usage: Record<string, unknown>;
  },
) {
  await db.transaction(async function save(tx) {
    await tx
      .update(aiDrafts)
      .set({
        state: "succeeded",
        draft: key.draft,
        latencyMs: key.latencyMs,
        usage: key.usage,
        error: null,
        completedAt: new Date(),
      })
      .where(draftWhere(key));

    // Serializes with transitionTicket so event sequence numbers stay unique.
    // Status and revision are untouched: a draft is only a suggestion.
    await tx
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.id, key.ticketId))
      .for("update");
    await tx.insert(ticketEvents).values({
      tenantId: key.tenantId,
      ticketId: key.ticketId,
      seq: await nextEventSeq(tx, key.ticketId),
      type: "ai_draft_ready",
      payload: { reportId: key.reportId, promptVersion: key.promptVersion },
    });
  });
}

export async function recordDraftFailure(
  db: Db,
  key: DraftKey & {
    state: "failed_retryable" | "failed_terminal" | "skipped_manual";
    errorClass: string | null;
  },
) {
  await db
    .update(aiDrafts)
    .set({
      state: key.state,
      error: key.errorClass,
      completedAt: key.state === "failed_retryable" ? null : new Date(),
    })
    .where(draftWhere(key));
}

function draftWhere(key: DraftKey) {
  return and(
    eq(aiDrafts.reportId, key.reportId),
    eq(aiDrafts.inputRevision, key.inputRevision),
    eq(aiDrafts.promptVersion, key.promptVersion),
  );
}
