import { reporterStage, type ReporterStage } from "@streetproof/domain";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import type { Db, Transaction } from "./client";
import {
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

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function issueReceipt(
  tx: Transaction,
  tenantId: string,
  reportId: string,
) {
  const token = randomBytes(32).toString("base64url");
  await tx.insert(reporterCredentials).values({
    tenantId,
    reportId,
    tokenHash: hashToken(token),
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

export type ReporterStatus = {
  reference: string;
  siteName: string;
  location: string;
  description: string;
  stage: ReporterStage;
  submittedAt: Date;
  updatedAt: Date;
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
        eq(reporterCredentials.tokenHash, hashToken(token)),
        isNull(reporterCredentials.revokedAt),
        gt(reporterCredentials.expiresAt, new Date()),
      ),
    );
  if (!row) return null;

  return {
    reference: reportReference(row.reportId),
    siteName: row.siteName,
    location: row.locationName ?? row.locationText ?? "",
    description: row.description,
    stage: reporterStage(row.status),
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
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
