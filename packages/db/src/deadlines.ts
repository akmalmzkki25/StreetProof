import { isOverdue, TICKET_STATUSES } from "@streetproof/domain";
import { and, eq, inArray, isNotNull, lte, or } from "drizzle-orm";
import type { Db } from "./client";
import {
  deadlineNotices,
  locations,
  memberships,
  reports,
  sites,
  telegramMembers,
  tickets,
  user,
} from "./schema";

export const DUE_SOON_MS = 24 * 60 * 60 * 1000;

export type DeadlineKind = "due_soon" | "overdue";

export type DeadlineRecipient = {
  userId: string;
  email: string;
  chatId: string | null;
  locale: "en" | "id";
};

export type DeadlineAlert = {
  ticketId: string;
  kind: DeadlineKind;
  dueAt: Date;
  title: string;
  location: string;
  timeZone: string;
  recipients: DeadlineRecipient[];
};

const CLOSED = new Set(["verified_closed", "cancelled"]);
const OPEN_STATUSES = TICKET_STATUSES.filter((status) => !CLOSED.has(status));

// A technician hears a day before; when it passes, the site's operators and
// supervisors hear too, so late work is everyone's to sort out, not a silent row.
export async function listDeadlineAlerts(
  db: Db,
  now: Date = new Date(),
): Promise<DeadlineAlert[]> {
  const soon = new Date(now.getTime() + DUE_SOON_MS);
  const rows = await db
    .select({
      id: tickets.id,
      tenantId: tickets.tenantId,
      siteId: tickets.siteId,
      status: tickets.status,
      summary: tickets.summary,
      dueAt: tickets.dueAt,
      assigneeId: tickets.currentAssigneeId,
      locationName: locations.name,
      timeZone: sites.timezone,
    })
    .from(tickets)
    .innerJoin(sites, eq(sites.id, tickets.siteId))
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .where(
      and(
        inArray(tickets.status, OPEN_STATUSES),
        isNotNull(tickets.dueAt),
        lte(tickets.dueAt, soon),
      ),
    );
  if (rows.length === 0) return [];

  const sent = await db
    .select({
      ticketId: deadlineNotices.ticketId,
      kind: deadlineNotices.kind,
      dueAt: deadlineNotices.dueAt,
    })
    .from(deadlineNotices)
    .where(
      inArray(
        deadlineNotices.ticketId,
        rows.map((row) => row.id),
      ),
    );

  const pending = rows.flatMap(function alertOf(row) {
    if (!row.dueAt) return [];
    const kind: DeadlineKind = isOverdue(
      { status: row.status, dueAt: row.dueAt },
      now,
    )
      ? "overdue"
      : "due_soon";
    // A reminder only matters to someone still working on it. Once proof is in,
    // the wait is a supervisor's, and only an overdue escalation reaches them.
    const isWithSupervisor = row.status === "completion_submitted";
    if (kind === "due_soon" && (!row.assigneeId || isWithSupervisor)) {
      return [];
    }
    const isSent = sent.some(
      (item) =>
        item.ticketId === row.id &&
        item.kind === kind &&
        item.dueAt.getTime() === row.dueAt?.getTime(),
    );
    return isSent ? [] : [{ ...row, dueAt: row.dueAt, kind }];
  });
  if (pending.length === 0) return [];

  const firstReports = await db
    .select({
      ticketId: reports.canonicalTicketId,
      description: reports.description,
      locationText: reports.locationText,
    })
    .from(reports)
    .where(
      inArray(
        reports.canonicalTicketId,
        pending.map((row) => row.id),
      ),
    );

  const staff = await db
    .select({
      userId: user.id,
      email: user.email,
      tenantId: memberships.tenantId,
      siteId: memberships.siteId,
      role: memberships.role,
      chatId: telegramMembers.chatId,
      locale: telegramMembers.locale,
    })
    .from(memberships)
    .innerJoin(user, eq(user.id, memberships.userId))
    .leftJoin(telegramMembers, eq(telegramMembers.userId, user.id))
    .where(
      and(
        eq(memberships.active, true),
        inArray(memberships.tenantId, [
          ...new Set(pending.map((row) => row.tenantId)),
        ]),
        or(
          inArray(memberships.role, ["operator", "supervisor"]),
          inArray(
            memberships.userId,
            pending.flatMap((row) => (row.assigneeId ? [row.assigneeId] : [])),
          ),
        ),
      ),
    );

  return pending.map(function toAlert(row) {
    const report = firstReports.find((item) => item.ticketId === row.id);
    const people = staff.filter(function hears(person) {
      if (person.tenantId !== row.tenantId) return false;
      if (person.siteId !== null && person.siteId !== row.siteId) return false;
      if (row.status === "completion_submitted") {
        return person.role === "supervisor";
      }
      if (person.userId === row.assigneeId) return true;
      return row.kind === "overdue" && person.role !== "technician";
    });
    const recipients = new Map<string, DeadlineRecipient>();
    for (const person of people) {
      recipients.set(person.userId, {
        userId: person.userId,
        email: person.email,
        chatId: person.chatId,
        locale: person.locale === "id" ? "id" : "en",
      });
    }
    return {
      ticketId: row.id,
      kind: row.kind,
      dueAt: row.dueAt,
      title: row.summary ?? report?.description ?? "",
      location: row.locationName ?? report?.locationText ?? "",
      timeZone: row.timeZone,
      recipients: [...recipients.values()],
    };
  });
}

// True when this call claimed the reminder and should send it.
export async function claimDeadlineNotice(
  db: Db,
  alert: Pick<DeadlineAlert, "ticketId" | "kind" | "dueAt">,
) {
  const claimed = await db
    .insert(deadlineNotices)
    .values({ ticketId: alert.ticketId, kind: alert.kind, dueAt: alert.dueAt })
    .onConflictDoNothing()
    .returning({ ticketId: deadlineNotices.ticketId });
  return claimed.length > 0;
}

// For a send that failed, so the next sweep tries again.
export async function releaseDeadlineNotice(
  db: Db,
  alert: Pick<DeadlineAlert, "ticketId" | "kind" | "dueAt">,
) {
  await db
    .delete(deadlineNotices)
    .where(
      and(
        eq(deadlineNotices.ticketId, alert.ticketId),
        eq(deadlineNotices.kind, alert.kind),
        eq(deadlineNotices.dueAt, alert.dueAt),
      ),
    );
}
