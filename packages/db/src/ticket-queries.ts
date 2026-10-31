import {
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@streetproof/domain";
import {
  and,
  asc,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  isNotNull,
  isNull,
  notInArray,
  or,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "./client";
import {
  aiDrafts,
  clarifications,
  completionSubmissions,
  damageRegions,
  duplicateLinks,
  proofChecks,
  locations,
  memberships,
  reports,
  sites,
  teams,
  ticketEvents,
  ticketNotes,
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

export function inScope(scope: MemberScope): SQL | undefined {
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
  search?: string;
  category?: string;
  priority?: TicketPriority;
};

// So a typed % or _ means itself rather than "anything".
function containsPattern(text: string) {
  return `%${text.replace(/[\\%_]/g, "\\$&")}%`;
}

function matchesSearch(db: Db, search: string) {
  const pattern = containsPattern(search);
  return or(
    ilike(tickets.summary, pattern),
    ilike(locations.name, pattern),
    exists(
      db
        .select({ id: reports.id })
        .from(reports)
        .where(
          and(
            eq(reports.canonicalTicketId, tickets.id),
            or(
              ilike(reports.description, pattern),
              ilike(reports.locationText, pattern),
            ),
          ),
        ),
    ),
  );
}

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
      dueAt: tickets.dueAt,
      locationName: locations.name,
      teamName: teams.name,
    })
    .from(tickets)
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .leftJoin(teams, eq(teams.id, tickets.teamId))
    .where(
      and(
        inScope(scope),
        filter.statuses
          ? inArray(tickets.status, [...filter.statuses])
          : undefined,
        filter.assigneeId
          ? eq(tickets.currentAssigneeId, filter.assigneeId)
          : undefined,
        filter.search ? matchesSearch(db, filter.search) : undefined,
        filter.category ? eq(tickets.category, filter.category) : undefined,
        filter.priority ? eq(tickets.priority, filter.priority) : undefined,
        // A linked duplicate needs no work of its own; it shows on its target.
        notInArray(
          tickets.id,
          db
            .select({ id: duplicateLinks.sourceTicketId })
            .from(duplicateLinks)
            .where(eq(duplicateLinks.active, true)),
        ),
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

  const links = await db
    .select({ targetTicketId: duplicateLinks.targetTicketId })
    .from(duplicateLinks)
    .where(
      and(
        eq(duplicateLinks.active, true),
        inArray(
          duplicateLinks.targetTicketId,
          rows.map((row) => row.id),
        ),
      ),
    );

  const answered = await db
    .select({ ticketId: clarifications.ticketId })
    .from(clarifications)
    .where(
      and(
        isNull(clarifications.closedAt),
        isNotNull(clarifications.answer),
        inArray(
          clarifications.ticketId,
          rows.map((row) => row.id),
        ),
      ),
    );

  return rows.map(function withReports(row) {
    const own = ticketReports.filter((report) => report.ticketId === row.id);
    return {
      ...row,
      title: row.summary ?? own[0]?.description ?? "",
      location: row.locationName ?? own[0]?.locationText ?? null,
      reportCount: own.length,
      linkedCount: links.filter((link) => link.targetTicketId === row.id)
        .length,
      hasUnreviewedAnswer: answered.some((item) => item.ticketId === row.id),
    };
  });
}

async function loadReports(db: Db, ticketIds: string[]) {
  const ticketReports = await db
    .select({
      id: reports.id,
      ticketId: reports.canonicalTicketId,
      description: reports.description,
      locationText: reports.locationText,
      locationName: locations.name,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .leftJoin(locations, eq(locations.id, reports.locationId))
    .where(inArray(reports.canonicalTicketId, ticketIds))
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

  return ticketReports.map((report) => ({
    ...report,
    photos: photos.filter((photo) => photo.reportId === report.id),
  }));
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
      teamName: teams.name,
      dueAt: tickets.dueAt,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .leftJoin(assignee, eq(assignee.id, tickets.currentAssigneeId))
    .leftJoin(teams, eq(teams.id, tickets.teamId))
    .where(and(inScope(scope), eq(tickets.id, ticketId)));
  if (!ticket) return null;

  const ticketReports = await loadReports(db, [ticketId]);

  const [outgoing] = await db
    .select({
      ticketId: duplicateLinks.targetTicketId,
      reason: duplicateLinks.reason,
      summary: tickets.summary,
      status: tickets.status,
    })
    .from(duplicateLinks)
    .innerJoin(tickets, eq(tickets.id, duplicateLinks.targetTicketId))
    .where(
      and(
        eq(duplicateLinks.sourceTicketId, ticketId),
        eq(duplicateLinks.active, true),
      ),
    );
  const targetReports = outgoing
    ? await loadReports(db, [outgoing.ticketId])
    : [];

  const incoming = await db
    .select({
      ticketId: duplicateLinks.sourceTicketId,
      reason: duplicateLinks.reason,
    })
    .from(duplicateLinks)
    .where(
      and(
        eq(duplicateLinks.targetTicketId, ticketId),
        eq(duplicateLinks.active, true),
      ),
    )
    .orderBy(asc(duplicateLinks.createdAt));
  const incomingReports = await loadReports(
    db,
    incoming.map((link) => link.ticketId),
  );

  const questions = await db
    .select({
      id: clarifications.id,
      question: clarifications.question,
      askerName: user.name,
      askedAt: clarifications.askedAt,
      answer: clarifications.answer,
      answeredAt: clarifications.answeredAt,
      closedAt: clarifications.closedAt,
    })
    .from(clarifications)
    .innerJoin(user, eq(user.id, clarifications.askedBy))
    .where(eq(clarifications.ticketId, ticketId))
    .orderBy(asc(clarifications.askedAt));

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
      checklist: completionSubmissions.checklist,
      exceptionReason: completionSubmissions.exceptionReason,
      status: completionSubmissions.status,
      submittedAt: completionSubmissions.submittedAt,
      submittedBy: completionSubmissions.submittedBy,
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

  const notes = await db
    .select({
      id: ticketNotes.id,
      body: ticketNotes.body,
      authorName: user.name,
      createdAt: ticketNotes.createdAt,
    })
    .from(ticketNotes)
    .innerJoin(user, eq(user.id, ticketNotes.authorId))
    .where(eq(ticketNotes.ticketId, ticketId))
    .orderBy(asc(ticketNotes.createdAt));

  const regions = await db
    .select({
      id: damageRegions.id,
      objectKey: uploads.objectKey,
      source: damageRegions.source,
      label: damageRegions.label,
      frameWidth: damageRegions.frameWidth,
      frameHeight: damageRegions.frameHeight,
      left: damageRegions.left,
      top: damageRegions.top,
      right: damageRegions.right,
      bottom: damageRegions.bottom,
      maskPath: damageRegions.maskPath,
    })
    .from(damageRegions)
    .innerJoin(uploads, eq(uploads.id, damageRegions.uploadId))
    .where(
      inArray(
        damageRegions.reportId,
        ticketReports.map((report) => report.id),
      ),
    );

  const checks = await db
    .select({
      completionId: proofChecks.completionId,
      state: proofChecks.state,
      result: proofChecks.result,
      model: proofChecks.model,
    })
    .from(proofChecks)
    .where(
      inArray(
        proofChecks.completionId,
        attempts.map((attempt) => attempt.id),
      ),
    );

  const drafts = await db
    .select({
      id: aiDrafts.id,
      reportId: aiDrafts.reportId,
      state: aiDrafts.state,
      draft: aiDrafts.draft,
      model: aiDrafts.model,
      createdAt: aiDrafts.createdAt,
    })
    .from(aiDrafts)
    .where(
      inArray(
        aiDrafts.reportId,
        ticketReports.map((report) => report.id),
      ),
    )
    .orderBy(desc(aiDrafts.createdAt));

  return {
    ...ticket,
    aiDraft: drafts[0] ?? null,
    reports: ticketReports,
    damageRegions: regions,
    notes,
    clarifications: questions,
    duplicateOf: outgoing
      ? {
          ticketId: outgoing.ticketId,
          reason: outgoing.reason,
          status: outgoing.status,
          title: outgoing.summary ?? targetReports[0]?.description ?? "",
        }
      : null,
    linkedDuplicates: incoming.map((link) => ({
      ...link,
      reports: incomingReports.filter(
        (report) => report.ticketId === link.ticketId,
      ),
    })),
    attempts: attempts.map((attempt) => ({
      ...attempt,
      photos: proofPhotos.filter((photo) => photo.completionId === attempt.id),
      proofCheck:
        checks.find((check) => check.completionId === attempt.id) ?? null,
    })),
    events,
  };
}

// Open work on the same site. listQueue already leaves out linked duplicates,
// so a link can't start a chain.
export async function listLinkCandidates(
  db: Db,
  scope: MemberScope,
  ticket: { id: string; siteId: string },
) {
  const items = await listQueue(
    db,
    { ...scope, siteIds: [ticket.siteId] },
    {
      statuses: TICKET_STATUSES.filter(
        (status) => status !== "verified_closed" && status !== "cancelled",
      ),
    },
  );
  return items.filter((item) => item.id !== ticket.id);
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

export async function listTeams(db: Db, tenantId: string) {
  return db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(and(eq(teams.tenantId, tenantId), eq(teams.active, true)))
    .orderBy(asc(teams.name));
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
