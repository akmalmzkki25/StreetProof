import type { TicketStatus } from "@streetproof/domain";
import { and, asc, desc, eq, inArray, isNull, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "./client";
import {
  completionSubmissions,
  locations,
  memberships,
  reports,
  sites,
  ticketEvents,
  tickets,
  uploads,
  user,
  verifications,
} from "./schema";

const QUEUE_LIMIT = 100;

export type MemberScope = {
  tenantId: string;
  // null means every site of the tenant.
  siteIds: readonly string[] | null;
};

function inScope(scope: MemberScope): SQL | undefined {
  return and(
    eq(tickets.tenantId, scope.tenantId),
    scope.siteIds === null
      ? undefined
      : inArray(tickets.siteId, [...scope.siteIds]),
  );
}

export type QueueFilter = {
  statuses?: readonly TicketStatus[];
  assigneeId?: string;
};

export async function listQueue(
  db: Db,
  scope: MemberScope,
  filter: QueueFilter = {},
) {
  const rows = await db
    .select({
      id: tickets.id,
      status: tickets.status,
      summary: tickets.summary,
      category: tickets.category,
      priority: tickets.priority,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      locationName: locations.name,
    })
    .from(tickets)
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .where(
      and(
        inScope(scope),
        filter.statuses
          ? inArray(tickets.status, [...filter.statuses])
          : undefined,
        filter.assigneeId
          ? eq(tickets.currentAssigneeId, filter.assigneeId)
          : undefined,
      ),
    )
    .orderBy(desc(tickets.updatedAt))
    .limit(QUEUE_LIMIT);

  if (rows.length === 0) return [];

  const ticketReports = await db
    .select({
      ticketId: reports.canonicalTicketId,
      description: reports.description,
      locationText: reports.locationText,
    })
    .from(reports)
    .where(
      inArray(
        reports.canonicalTicketId,
        rows.map((row) => row.id),
      ),
    )
    .orderBy(asc(reports.createdAt));

  return rows.map(function withReports(row) {
    const own = ticketReports.filter((report) => report.ticketId === row.id);
    return {
      ...row,
      title: row.summary ?? own[0]?.description ?? "",
      location: row.locationName ?? own[0]?.locationText ?? null,
      reportCount: own.length,
    };
  });
}

export async function getTicketDetail(
  db: Db,
  scope: MemberScope,
  ticketId: string,
) {
  const assignee = alias(user, "assignee");
  const [ticket] = await db
    .select({
      id: tickets.id,
      siteId: tickets.siteId,
      status: tickets.status,
      revision: tickets.revision,
      summary: tickets.summary,
      category: tickets.category,
      priority: tickets.priority,
      locationId: tickets.locationId,
      locationName: locations.name,
      currentAssigneeId: tickets.currentAssigneeId,
      assigneeName: assignee.name,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .leftJoin(assignee, eq(assignee.id, tickets.currentAssigneeId))
    .where(and(inScope(scope), eq(tickets.id, ticketId)));
  if (!ticket) return null;

  const ticketReports = await db
    .select({
      id: reports.id,
      description: reports.description,
      locationText: reports.locationText,
      locationName: locations.name,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .leftJoin(locations, eq(locations.id, reports.locationId))
    .where(eq(reports.canonicalTicketId, ticketId))
    .orderBy(asc(reports.createdAt));

  const photos = await db
    .select({
      id: uploads.id,
      reportId: uploads.reportId,
      objectKey: uploads.objectKey,
    })
    .from(uploads)
    .where(
      and(
        eq(uploads.state, "ready"),
        inArray(
          uploads.reportId,
          ticketReports.map((report) => report.id),
        ),
      ),
    );

  const events = await db
    .select({
      id: ticketEvents.id,
      seq: ticketEvents.seq,
      type: ticketEvents.type,
      fromStatus: ticketEvents.fromStatus,
      toStatus: ticketEvents.toStatus,
      actorName: user.name,
      payload: ticketEvents.payload,
      createdAt: ticketEvents.createdAt,
    })
    .from(ticketEvents)
    .leftJoin(user, eq(user.id, ticketEvents.actorId))
    .where(eq(ticketEvents.ticketId, ticketId))
    .orderBy(asc(ticketEvents.seq));

  const submitter = alias(user, "submitter");
  const verifier = alias(user, "verifier");
  const attempts = await db
    .select({
      id: completionSubmissions.id,
      note: completionSubmissions.note,
      status: completionSubmissions.status,
      submittedAt: completionSubmissions.submittedAt,
      submitterName: submitter.name,
      decisionReason: verifications.reason,
      decidedAt: verifications.decidedAt,
      verifierName: verifier.name,
    })
    .from(completionSubmissions)
    .innerJoin(submitter, eq(submitter.id, completionSubmissions.submittedBy))
    .leftJoin(
      verifications,
      eq(verifications.completionId, completionSubmissions.id),
    )
    .leftJoin(verifier, eq(verifier.id, verifications.verifierId))
    .where(eq(completionSubmissions.ticketId, ticketId))
    .orderBy(desc(completionSubmissions.submittedAt));

  const proofPhotos = await db
    .select({
      id: uploads.id,
      completionId: uploads.completionId,
      objectKey: uploads.objectKey,
    })
    .from(uploads)
    .where(
      and(
        eq(uploads.state, "ready"),
        inArray(
          uploads.completionId,
          attempts.map((attempt) => attempt.id),
        ),
      ),
    );

  return {
    ...ticket,
    reports: ticketReports.map((report) => ({
      ...report,
      photos: photos.filter((photo) => photo.reportId === report.id),
    })),
    attempts: attempts.map((attempt) => ({
      ...attempt,
      photos: proofPhotos.filter((photo) => photo.completionId === attempt.id),
    })),
    events,
  };
}

export async function listTechnicians(
  db: Db,
  tenantId: string,
  siteId: string,
) {
  return db
    .selectDistinct({ id: user.id, name: user.name })
    .from(memberships)
    .innerJoin(user, eq(user.id, memberships.userId))
    .where(
      and(
        eq(memberships.tenantId, tenantId),
        eq(memberships.role, "technician"),
        eq(memberships.active, true),
        or(eq(memberships.siteId, siteId), isNull(memberships.siteId)),
      ),
    )
    .orderBy(asc(user.name));
}

export async function listSiteLocations(
  db: Db,
  tenantId: string,
  siteId: string,
) {
  return db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .where(
      and(
        eq(locations.tenantId, tenantId),
        eq(locations.siteId, siteId),
        eq(locations.active, true),
      ),
    )
    .orderBy(asc(locations.name));
}

export async function listIntakeSites(db: Db, scope: MemberScope) {
  const rows = await db
    .select({ id: sites.id, name: sites.name, intakeCode: sites.intakeCode })
    .from(sites)
    .where(
      and(
        eq(sites.tenantId, scope.tenantId),
        eq(sites.active, true),
        scope.siteIds === null
          ? undefined
          : inArray(sites.id, [...scope.siteIds]),
      ),
    )
    .orderBy(asc(sites.name));
  return rows.filter((site) => site.intakeCode !== null);
}

export type QueueItem = Awaited<ReturnType<typeof listQueue>>[number];
export type TicketDetail = NonNullable<
  Awaited<ReturnType<typeof getTicketDetail>>
>;
