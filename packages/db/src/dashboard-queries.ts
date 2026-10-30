import {
  computeDashboard,
  DASHBOARD_WINDOW_DAYS,
  draftOutcome,
} from "@streetproof/domain";
import { and, asc, desc, eq, gte, inArray, notInArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "./client";
import {
  aiDrafts,
  completionSubmissions,
  duplicateLinks,
  locations,
  reports,
  ticketEvents,
  tickets,
  user,
} from "./schema";
import { inScope, type MemberScope } from "./ticket-queries";

const DAY_MS = 24 * 60 * 60 * 1000;

// Open work of any age, plus anything created or changed inside the window.
// That bounds the read without dropping an old ticket closed last week.
export async function getDashboard(
  db: Db,
  scope: MemberScope,
  now: Date = new Date(),
) {
  const since = new Date(now.getTime() - DASHBOARD_WINDOW_DAYS * DAY_MS);
  const assignee = alias(user, "assignee");

  const rows = await db
    .select({
      id: tickets.id,
      status: tickets.status,
      summary: tickets.summary,
      category: tickets.category,
      locationName: locations.name,
      assigneeName: assignee.name,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .leftJoin(assignee, eq(assignee.id, tickets.currentAssigneeId))
    .where(
      and(
        inScope(scope),
        or(
          notInArray(tickets.status, ["verified_closed", "cancelled"]),
          gte(tickets.createdAt, since),
          gte(tickets.updatedAt, since),
        ),
      ),
    );
  const ticketIds = rows.map((row) => row.id);

  const ticketReports = await db
    .select({
      id: reports.id,
      ticketId: reports.canonicalTicketId,
      description: reports.description,
      locationText: reports.locationText,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(inArray(reports.canonicalTicketId, ticketIds))
    .orderBy(asc(reports.createdAt));

  const links = await db
    .select({ ticketId: duplicateLinks.sourceTicketId })
    .from(duplicateLinks)
    .where(
      and(
        eq(duplicateLinks.active, true),
        inArray(duplicateLinks.sourceTicketId, ticketIds),
      ),
    );
  const duplicateIds = new Set(links.map((link) => link.ticketId));

  const events = await db
    .select({
      ticketId: ticketEvents.ticketId,
      fromStatus: ticketEvents.fromStatus,
      toStatus: ticketEvents.toStatus,
      createdAt: ticketEvents.createdAt,
    })
    .from(ticketEvents)
    .where(inArray(ticketEvents.ticketId, ticketIds));

  const attemptRows = await db
    .select({
      ticketId: completionSubmissions.ticketId,
      exceptionReason: completionSubmissions.exceptionReason,
      submittedAt: completionSubmissions.submittedAt,
    })
    .from(completionSubmissions)
    .where(inArray(completionSubmissions.ticketId, ticketIds));

  const reportsInWindow = ticketReports.filter(
    (report) => report.createdAt >= since,
  );
  const draftRows = await db
    .select({ reportId: aiDrafts.reportId, state: aiDrafts.state })
    .from(aiDrafts)
    .where(
      inArray(
        aiDrafts.reportId,
        reportsInWindow.map((report) => report.id),
      ),
    )
    .orderBy(desc(aiDrafts.createdAt));

  return computeDashboard({
    now,
    events,
    attempts: attemptRows.map((attempt) => ({
      ticketId: attempt.ticketId,
      hasException: attempt.exceptionReason !== null,
      submittedAt: attempt.submittedAt,
    })),
    tickets: rows.map(function toTicket(row) {
      const first = ticketReports.find((report) => report.ticketId === row.id);
      return {
        id: row.id,
        status: row.status,
        title: row.summary ?? first?.description ?? "",
        location: row.locationName ?? first?.locationText ?? null,
        category: row.category,
        assigneeName: row.assigneeName,
        isDuplicate: duplicateIds.has(row.id),
        createdAt: row.createdAt,
      };
    }),
    // Newest first, so each report takes the state of its latest revision.
    drafts: reportsInWindow.map((report) =>
      draftOutcome(
        draftRows.find((draft) => draft.reportId === report.id)?.state ?? null,
      ),
    ),
  });
}
