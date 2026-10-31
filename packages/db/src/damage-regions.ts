import { and, asc, eq } from "drizzle-orm";
import type { Db } from "./client";
import { damageRegions, reports, tickets, uploads } from "./schema";

export type DamageRegionInput = {
  source: "sam" | "grounding";
  label: string;
  frameWidth: number;
  frameHeight: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  maskPath: string | null;
};

// The first photo only: one picture is enough to point at, and each costs money.
export async function loadDamageLocateInput(db: Db, reportId: string) {
  const [report] = await db
    .select({
      tenantId: reports.tenantId,
      status: tickets.status,
    })
    .from(reports)
    .innerJoin(tickets, eq(tickets.id, reports.canonicalTicketId))
    .where(eq(reports.id, reportId));
  if (!report) return null;

  const [photo] = await db
    .select({
      id: uploads.id,
      objectKey: uploads.objectKey,
      contentType: uploads.contentType,
    })
    .from(uploads)
    .where(and(eq(uploads.reportId, reportId), eq(uploads.state, "ready")))
    .orderBy(asc(uploads.createdAt))
    .limit(1);

  return { ...report, photo: photo ?? null };
}

// Replaces what's there, so a redraft after a clarification doesn't stack outlines.
export async function saveDamageRegions(
  db: Db,
  input: {
    tenantId: string;
    reportId: string;
    uploadId: string;
    regions: readonly DamageRegionInput[];
  },
) {
  await db.transaction(async function save(tx) {
    await tx
      .delete(damageRegions)
      .where(eq(damageRegions.reportId, input.reportId));
    if (input.regions.length === 0) return;
    await tx.insert(damageRegions).values(
      input.regions.map((region) => ({
        ...region,
        tenantId: input.tenantId,
        reportId: input.reportId,
        uploadId: input.uploadId,
      })),
    );
  });
}
