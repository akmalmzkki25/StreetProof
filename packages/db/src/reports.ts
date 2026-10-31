import { reporterStage, type ReporterStage } from "@streetproof/domain";
import { and, asc, count, desc, eq, gt, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { recordAudit } from "./audit";
import type { Db, Transaction } from "./client";
import { hashReporterToken } from "./reporter-token";
import {
  clarifications,
  duplicateLinks,
  idempotencyKeys,
  locations,
  outbox,
  reporterCredentials,
  reports,
  sites,
  ticketEvents,
  tickets,
  uploads,
} from "./schema";

const RECEIPT_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_RECEIPTS_PER_REPORT = 4;
const MAX_RECOVERY_LINKS = 10;
const INTAKE_SCOPE = "intake";

export type ReportPhoto = {
  objectKey: string;
  contentType: string;
  bytes: number;
  sha256: string;
};

export type SubmitReportInput = {
  tenantId: string;
  siteId: string;
  reportId: string;
  locationId: string | null;
  locationText: string | null;
  description: string;
  reporterEmail?: string | null;
  photos: readonly ReportPhoto[];
  idempotencyKey: string;
  requestDigest: string;
};

export type SubmitReportOutcome =
  | {
      ok: true;
      reportId: string;
      ticketId: string;
      reporterToken: string;
      replayed: boolean;
    }
  | { ok: false; code: "idempotency_conflict" | "receipt_limit_reached" };

async function issueReceipt(
  tx: Transaction,
  tenantId: string,
  reportId: string,
) {
  const token = randomBytes(32).toString("base64url");
  await tx.insert(reporterCredentials).values({
    tenantId,
    reportId,
    tokenHash: hashReporterToken(token),
    expiresAt: new Date(Date.now() + RECEIPT_LIFETIME_MS),
  });
  return token;
}

// The raw receipt is never stored, so a retry can't get the original back. It
// revokes the old receipt and issues a new one for the same report.
async function replaySubmission(
  tx: Transaction,
  input: SubmitReportInput,
): Promise<SubmitReportOutcome> {
  const [existing] = await tx
    .select()
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.tenantId, input.tenantId),
        eq(idempotencyKeys.scope, INTAKE_SCOPE),
        eq(idempotencyKeys.key, input.idempotencyKey),
      ),
    );
  if (!existing || existing.requestDigest !== input.requestDigest) {
    return { ok: false, code: "idempotency_conflict" };
  }

  const reportId = String(existing.response.reportId);
  const ticketId = String(existing.response.ticketId);

  await tx
    .select({ id: reports.id })
    .from(reports)
    .where(eq(reports.id, reportId))
    .for("update");

  const [issued] = await tx
    .select({ total: count() })
    .from(reporterCredentials)
    .where(eq(reporterCredentials.reportId, reportId));
  if ((issued?.total ?? 0) >= MAX_RECEIPTS_PER_REPORT) {
    return { ok: false, code: "receipt_limit_reached" };
  }

  await tx
    .update(reporterCredentials)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(reporterCredentials.reportId, reportId),
        isNull(reporterCredentials.revokedAt),
      ),
    );

  const reporterToken = await issueReceipt(tx, input.tenantId, reportId);
  return { ok: true, reportId, ticketId, reporterToken, replayed: true };
}

export async function hasIntakeSubmission(
  db: Db,
  tenantId: string,
  idempotencyKey: string,
) {
  const [existing] = await db
    .select({ key: idempotencyKeys.key })
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.tenantId, tenantId),
        eq(idempotencyKeys.scope, INTAKE_SCOPE),
        eq(idempotencyKeys.key, idempotencyKey),
      ),
    );
  return existing !== undefined;
}

// Photos are stored before this runs; no upload happens inside the transaction.
export async function submitReport(
  db: Db,
  input: SubmitReportInput,
): Promise<SubmitReportOutcome> {
  return db.transaction(async function run(tx) {
    const ticketId = crypto.randomUUID();
    const claimed = await tx
      .insert(idempotencyKeys)
      .values({
        tenantId: input.tenantId,
        scope: INTAKE_SCOPE,
        key: input.idempotencyKey,
        requestDigest: input.requestDigest,
        response: { reportId: input.reportId, ticketId },
      })
      .onConflictDoNothing()
      .returning({ key: idempotencyKeys.key });

    if (claimed.length === 0) return replaySubmission(tx, input);

    await tx.insert(tickets).values({
      id: ticketId,
      tenantId: input.tenantId,
      siteId: input.siteId,
      locationId: input.locationId,
    });

    await tx.insert(reports).values({
      id: input.reportId,
      tenantId: input.tenantId,
      siteId: input.siteId,
      locationId: input.locationId,
      locationText: input.locationText,
      description: input.description,
      reporterEmail: input.reporterEmail?.toLowerCase() ?? null,
      canonicalTicketId: ticketId,
    });

    if (input.photos.length > 0) {
      await tx.insert(uploads).values(
        input.photos.map((photo) => ({
          tenantId: input.tenantId,
          objectKey: photo.objectKey,
          contentType: photo.contentType,
          bytes: photo.bytes,
          sha256: photo.sha256,
          purpose: "report_photo" as const,
          state: "ready" as const,
          reportId: input.reportId,
        })),
      );
    }

    await tx.insert(ticketEvents).values({
      tenantId: input.tenantId,
      ticketId,
      seq: 1,
      type: "report_submitted",
      toStatus: "submitted",
      payload: { reportId: input.reportId },
    });

    await tx.insert(outbox).values({
      tenantId: input.tenantId,
      topic: "report.submitted",
      payload: { reportId: input.reportId, ticketId, inputRevision: 0 },
    });

    const reporterToken = await issueReceipt(
      tx,
      input.tenantId,
      input.reportId,
    );
    return {
      ok: true,
      reportId: input.reportId,
      ticketId,
      reporterToken,
      replayed: false,
    };
  });
}

// New links alongside any the reporter still has, so asking on someone else's
// behalf can't cut them off. Reports at the receipt limit are left out.
export async function issueRecoveryLinks(db: Db, email: string) {
  return db.transaction(async function run(tx) {
    const rows = await tx
      .select({ reportId: reports.id, tenantId: reports.tenantId })
      .from(reports)
      .where(eq(reports.reporterEmail, email.toLowerCase()))
      .orderBy(desc(reports.createdAt))
      .limit(MAX_RECOVERY_LINKS)
      .for("update");

    const links: { reference: string; token: string }[] = [];
    for (const row of rows) {
      const [issued] = await tx
        .select({ total: count() })
        .from(reporterCredentials)
        .where(
          and(
            eq(reporterCredentials.reportId, row.reportId),
            isNull(reporterCredentials.revokedAt),
            gt(reporterCredentials.expiresAt, new Date()),
          ),
        );
      if ((issued?.total ?? 0) >= MAX_RECEIPTS_PER_REPORT) continue;
      links.push({
        reference: reportReference(row.reportId),
        token: await issueReceipt(tx, row.tenantId, row.reportId),
      });
    }
    return links;
  });
}

// For a reporter with no email who asks the building team. It replaces their old
// links, since the person asking might be the reason they need a new one.
export async function reissueStatusLink(
  db: Db,
  input: { tenantId: string; reportId: string; actorId: string },
): Promise<{ ok: true; token: string } | { ok: false }> {
  return db.transaction(async function run(tx) {
    const [report] = await tx
      .select({ id: reports.id, ticketId: reports.canonicalTicketId })
      .from(reports)
      .where(
        and(
          eq(reports.tenantId, input.tenantId),
          eq(reports.id, input.reportId),
        ),
      )
      .for("update");
    if (!report) return { ok: false };

    await tx
      .update(reporterCredentials)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(reporterCredentials.reportId, report.id),
          isNull(reporterCredentials.revokedAt),
        ),
      );
    const token = await issueReceipt(tx, input.tenantId, report.id);
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "status_link.reissued",
      targetType: "ticket",
      targetId: report.ticketId,
      metadata: { reportId: report.id },
    });
    return { ok: true, token };
  });
}

export type ReporterStatus = {
  reference: string;
  siteName: string;
  location: string;
  description: string;
  stage: ReporterStage;
  submittedAt: Date;
  updatedAt: Date;
  clarifications: {
    id: string;
    question: string;
    answer: string | null;
    isOpen: boolean;
  }[];
};

export function reportReference(reportId: string) {
  return reportId.slice(0, 8).toUpperCase();
}

// Returns null for a wrong, expired or revoked token alike, so a caller can't
// tell which one it was or whether the report exists.
export async function getReporterStatus(
  db: Db,
  token: string,
): Promise<ReporterStatus | null> {
  const [row] = await db
    .select({
      reportId: reports.id,
      description: reports.description,
      locationText: reports.locationText,
      locationName: locations.name,
      siteName: sites.name,
      submittedAt: reports.createdAt,
      ticketId: tickets.id,
      status: tickets.status,
      updatedAt: tickets.updatedAt,
    })
    .from(reporterCredentials)
    .innerJoin(reports, eq(reports.id, reporterCredentials.reportId))
    .innerJoin(tickets, eq(tickets.id, reports.canonicalTicketId))
    .innerJoin(sites, eq(sites.id, reports.siteId))
    .leftJoin(locations, eq(locations.id, reports.locationId))
    .where(
      and(
        eq(reporterCredentials.tokenHash, hashReporterToken(token)),
        isNull(reporterCredentials.revokedAt),
        gt(reporterCredentials.expiresAt, new Date()),
      ),
    );
  if (!row) return null;

  // A report linked as a duplicate follows the work that will fix the problem.
  const [followed] = await db
    .select({ status: tickets.status, updatedAt: tickets.updatedAt })
    .from(duplicateLinks)
    .innerJoin(tickets, eq(tickets.id, duplicateLinks.targetTicketId))
    .where(
      and(
        eq(duplicateLinks.sourceTicketId, row.ticketId),
        eq(duplicateLinks.active, true),
      ),
    );

  // Never who asked, or a question the operator closed without an answer.
  const questions = await db
    .select({
      id: clarifications.id,
      question: clarifications.question,
      answer: clarifications.answer,
      closedAt: clarifications.closedAt,
    })
    .from(clarifications)
    .where(eq(clarifications.reportId, row.reportId))
    .orderBy(asc(clarifications.askedAt));

  return {
    reference: reportReference(row.reportId),
    siteName: row.siteName,
    location: row.locationName ?? row.locationText ?? "",
    description: row.description,
    stage: reporterStage(followed?.status ?? row.status),
    submittedAt: row.submittedAt,
    updatedAt: followed?.updatedAt ?? row.updatedAt,
    clarifications: questions.flatMap(function visible(item) {
      const isOpen =
        row.status === "needs_clarification" &&
        item.answer === null &&
        item.closedAt === null;
      if (!isOpen && item.answer === null) return [];
      return [
        {
          id: item.id,
          question: item.question,
          answer: item.answer,
          isOpen,
        },
      ];
    }),
  };
}

export async function findIntakeSite(db: Db, intakeCode: string) {
  const [site] = await db
    .select({ id: sites.id, tenantId: sites.tenantId, name: sites.name })
    .from(sites)
    .where(and(eq(sites.intakeCode, intakeCode), eq(sites.active, true)));
  if (!site) return null;

  const siteLocations = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .where(and(eq(locations.siteId, site.id), eq(locations.active, true)));

  return { ...site, locations: siteLocations };
}
