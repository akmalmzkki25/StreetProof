import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type { Db } from "./client";
import { reportReference } from "./reports";
import { duplicateLinks, reporterNotifications, reports } from "./schema";

// Everyone who should hear about this ticket: its own reporters, plus reporters
// whose report is linked to it as a duplicate. Those already told about this event
// are left out, so a retried job doesn't mail them again.
export async function listNoticeRecipients(
  db: Db,
  ticketId: string,
  eventSeq: number,
) {
  const linked = await db
    .select({ ticketId: duplicateLinks.sourceTicketId })
    .from(duplicateLinks)
    .where(
      and(
        eq(duplicateLinks.targetTicketId, ticketId),
        eq(duplicateLinks.active, true),
      ),
    );
  const rows = await db
    .select({
      reportId: reports.id,
      tenantId: reports.tenantId,
      email: reports.reporterEmail,
    })
    .from(reports)
    .where(
      and(
        inArray(reports.canonicalTicketId, [
          ticketId,
          ...linked.map((link) => link.ticketId),
        ]),
        isNotNull(reports.reporterEmail),
      ),
    );
  if (rows.length === 0) return [];

  const sent = await db
    .select({ reportId: reporterNotifications.reportId })
    .from(reporterNotifications)
    .where(
      and(
        eq(reporterNotifications.eventSeq, eventSeq),
        inArray(
          reporterNotifications.reportId,
          rows.map((row) => row.reportId),
        ),
      ),
    );

  return rows.flatMap(function unsent(row) {
    if (!row.email || sent.some((item) => item.reportId === row.reportId)) {
      return [];
    }
    return [
      {
        reportId: row.reportId,
        tenantId: row.tenantId,
        email: row.email,
        reference: reportReference(row.reportId),
      },
    ];
  });
}

export async function recordNoticeSent(
  db: Db,
  input: { tenantId: string; reportId: string; eventSeq: number },
) {
  await db.insert(reporterNotifications).values(input).onConflictDoNothing();
}
