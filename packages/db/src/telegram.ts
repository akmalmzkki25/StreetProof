import {
  reporterNotice,
  reporterStage,
  type ReporterStage,
  type Role,
  type TicketStatus,
} from "@streetproof/domain";
import { and, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { recordAudit } from "./audit";
import type { Db } from "./client";
import { hashReporterToken } from "./reporter-token";
import { reportReference } from "./reports";
import {
  duplicateLinks,
  locations,
  memberships,
  reporterCredentials,
  reports,
  telegramConversations,
  telegramLinkCodes,
  telegramMembers,
  telegramNotices,
  telegramReportSubscriptions,
  tickets,
  user,
} from "./schema";

const LINK_CODE_LIFETIME_MS = 15 * 60 * 1000;

export type TelegramLocale = "en" | "id";

export type TelegramMember = {
  userId: string;
  name: string;
  tenantId: string;
  roles: Role[];
  // null means every site of the tenant.
  siteIds: string[] | null;
};

function hashLinkCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

async function issueLinkCode(
  db: Db,
  target: { tenantId: string; userId?: string; reportId?: string },
) {
  const code = randomBytes(24).toString("base64url");
  await db.insert(telegramLinkCodes).values({
    codeHash: hashLinkCode(code),
    tenantId: target.tenantId,
    userId: target.userId ?? null,
    reportId: target.reportId ?? null,
    expiresAt: new Date(Date.now() + LINK_CODE_LIFETIME_MS),
  });
  return code;
}

export function createMemberLinkCode(
  db: Db,
  input: { userId: string; tenantId: string },
) {
  return issueLinkCode(db, input);
}

// Needs a receipt that still works, so a link can't be made for someone else's report.
export async function createReportLinkCode(db: Db, receiptToken: string) {
  const [row] = await db
    .select({
      reportId: reporterCredentials.reportId,
      tenantId: reporterCredentials.tenantId,
    })
    .from(reporterCredentials)
    .where(
      and(
        eq(reporterCredentials.tokenHash, hashReporterToken(receiptToken)),
        isNull(reporterCredentials.revokedAt),
        gt(reporterCredentials.expiresAt, new Date()),
      ),
    );
  if (!row) return null;
  return issueLinkCode(db, row);
}

export type RedeemedLink =
  { kind: "member"; name: string } | { kind: "report"; reference: string };

// A code works once, and an expired or unknown one looks the same as a used one.
export async function redeemLinkCode(
  db: Db,
  input: { code: string; chatId: string; locale: TelegramLocale },
): Promise<RedeemedLink | null> {
  return db.transaction(async function run(tx) {
    const now = new Date();
    const [claimed] = await tx
      .update(telegramLinkCodes)
      .set({ usedAt: now })
      .where(
        and(
          eq(telegramLinkCodes.codeHash, hashLinkCode(input.code)),
          isNull(telegramLinkCodes.usedAt),
          gt(telegramLinkCodes.expiresAt, now),
        ),
      )
      .returning();
    if (!claimed) return null;

    if (claimed.reportId) {
      await tx
        .insert(telegramReportSubscriptions)
        .values({
          tenantId: claimed.tenantId,
          reportId: claimed.reportId,
          chatId: input.chatId,
          locale: input.locale,
        })
        .onConflictDoNothing();
      return { kind: "report", reference: reportReference(claimed.reportId) };
    }

    const userId = claimed.userId;
    if (!userId) return null;
    const [member] = await tx
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId));
    if (!member) return null;

    // One chat per account and one account per chat: the newest link wins.
    await tx
      .delete(telegramMembers)
      .where(
        or(
          eq(telegramMembers.userId, userId),
          eq(telegramMembers.chatId, input.chatId),
        ),
      );
    await tx
      .insert(telegramMembers)
      .values({ userId, chatId: input.chatId, locale: input.locale });
    await recordAudit(tx, {
      tenantId: claimed.tenantId,
      actorId: userId,
      action: "telegram.linked",
      targetType: "user",
      targetId: userId,
    });
    return { kind: "member", name: member.name };
  });
}

// Read on every action, so a deactivated member loses access straight away.
export async function findTelegramMember(
  db: Db,
  chatId: string,
): Promise<TelegramMember | null> {
  const rows = await db
    .select({
      userId: telegramMembers.userId,
      name: user.name,
      tenantId: memberships.tenantId,
      role: memberships.role,
      siteId: memberships.siteId,
    })
    .from(telegramMembers)
    .innerJoin(user, eq(user.id, telegramMembers.userId))
    .innerJoin(memberships, eq(memberships.userId, telegramMembers.userId))
    .where(
      and(eq(telegramMembers.chatId, chatId), eq(memberships.active, true)),
    );
  const first = rows[0];
  if (!first) return null;

  const tenantRows = rows.filter((row) => row.tenantId === first.tenantId);
  const coversAllSites = tenantRows.some((row) => row.siteId === null);
  return {
    userId: first.userId,
    name: first.name,
    tenantId: first.tenantId,
    roles: [...new Set(tenantRows.map((row) => row.role))],
    siteIds: coversAllSites
      ? null
      : [
          ...new Set(
            tenantRows
              .map((row) => row.siteId)
              .filter((siteId) => siteId !== null),
          ),
        ],
  };
}

export async function isTelegramLinked(db: Db, userId: string) {
  const [row] = await db
    .select({ userId: telegramMembers.userId })
    .from(telegramMembers)
    .where(eq(telegramMembers.userId, userId));
  return row !== undefined;
}

export async function subscribeChatToReport(
  db: Db,
  input: {
    tenantId: string;
    reportId: string;
    chatId: string;
    locale: TelegramLocale;
  },
) {
  await db
    .insert(telegramReportSubscriptions)
    .values(input)
    .onConflictDoNothing();
}

export type TelegramReportStatus = {
  reference: string;
  stage: ReporterStage;
};

const MAX_LISTED_REPORTS = 10;

// The collapsed reporter view, and a duplicate follows the ticket it points to.
export async function listChatReports(
  db: Db,
  chatId: string,
): Promise<TelegramReportStatus[]> {
  const rows = await db
    .select({
      reportId: reports.id,
      ticketId: reports.canonicalTicketId,
      status: tickets.status,
    })
    .from(telegramReportSubscriptions)
    .innerJoin(reports, eq(reports.id, telegramReportSubscriptions.reportId))
    .innerJoin(tickets, eq(tickets.id, reports.canonicalTicketId))
    .where(eq(telegramReportSubscriptions.chatId, chatId))
    .limit(MAX_LISTED_REPORTS);
  if (rows.length === 0) return [];

  const followed = await db
    .select({
      sourceTicketId: duplicateLinks.sourceTicketId,
      status: tickets.status,
    })
    .from(duplicateLinks)
    .innerJoin(tickets, eq(tickets.id, duplicateLinks.targetTicketId))
    .where(
      and(
        eq(duplicateLinks.active, true),
        inArray(
          duplicateLinks.sourceTicketId,
          rows.map((row) => row.ticketId),
        ),
      ),
    );

  return rows.map(function statusOf(row) {
    const link = followed.find((item) => item.sourceTicketId === row.ticketId);
    return {
      reference: reportReference(row.reportId),
      stage: reporterStage(link?.status ?? row.status),
    };
  });
}

// Everything tying this chat to StreetProof, for a person who asks to stop.
export async function disconnectChat(db: Db, chatId: string) {
  await db.transaction(async function run(tx) {
    await tx
      .delete(telegramReportSubscriptions)
      .where(eq(telegramReportSubscriptions.chatId, chatId));
    await tx.delete(telegramMembers).where(eq(telegramMembers.chatId, chatId));
    await tx
      .delete(telegramConversations)
      .where(eq(telegramConversations.chatId, chatId));
  });
}

export async function getConversation(db: Db, chatId: string) {
  const [row] = await db
    .select({ state: telegramConversations.state })
    .from(telegramConversations)
    .where(eq(telegramConversations.chatId, chatId));
  return row?.state ?? null;
}

export async function saveConversation(
  db: Db,
  chatId: string,
  state: Record<string, unknown>,
) {
  await db
    .insert(telegramConversations)
    .values({ chatId, state })
    .onConflictDoUpdate({
      target: telegramConversations.chatId,
      set: { state, updatedAt: new Date() },
    });
}

export async function clearConversation(db: Db, chatId: string) {
  await db
    .delete(telegramConversations)
    .where(eq(telegramConversations.chatId, chatId));
}

export type TelegramAudience =
  | "reporter"
  | "assignee_assigned"
  | "assignee_rejected"
  | "assignee_reopened"
  | "supervisor_review";

export type TelegramRecipient = {
  chatId: string;
  locale: TelegramLocale;
  audience: TelegramAudience;
  reference: string | null;
};

function asLocale(value: string): TelegramLocale {
  return value === "id" ? "id" : "en";
}

function assigneeAudience(
  from: TicketStatus,
  to: TicketStatus,
): TelegramAudience | null {
  if (to === "assigned") return "assignee_assigned";
  if (to === "rejected_with_reason") return "assignee_rejected";
  if (from === "reopened" && to === "in_progress") return "assignee_reopened";
  return null;
}

async function reporterRecipients(db: Db, ticketId: string) {
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
      chatId: telegramReportSubscriptions.chatId,
      locale: telegramReportSubscriptions.locale,
      reportId: reports.id,
    })
    .from(telegramReportSubscriptions)
    .innerJoin(reports, eq(reports.id, telegramReportSubscriptions.reportId))
    .where(
      inArray(reports.canonicalTicketId, [
        ticketId,
        ...linked.map((link) => link.ticketId),
      ]),
    );
  return rows.map((row) => ({
    chatId: row.chatId,
    locale: asLocale(row.locale),
    audience: "reporter" as const,
    reference: reportReference(row.reportId),
  }));
}

async function supervisorRecipients(
  db: Db,
  ticket: { tenantId: string; siteId: string },
) {
  const rows = await db
    .selectDistinct({
      chatId: telegramMembers.chatId,
      locale: telegramMembers.locale,
    })
    .from(telegramMembers)
    .innerJoin(memberships, eq(memberships.userId, telegramMembers.userId))
    .where(
      and(
        eq(memberships.tenantId, ticket.tenantId),
        eq(memberships.role, "supervisor"),
        eq(memberships.active, true),
        or(eq(memberships.siteId, ticket.siteId), isNull(memberships.siteId)),
      ),
    );
  return rows.map((row) => ({
    chatId: row.chatId,
    locale: asLocale(row.locale),
    audience: "supervisor_review" as const,
    reference: null,
  }));
}

// Who hears about this change on Telegram. Those already told about this event are
// left out, so a retried job doesn't repeat itself.
export async function listTelegramRecipients(
  db: Db,
  event: {
    ticketId: string;
    seq: number;
    from: TicketStatus;
    to: TicketStatus;
  },
): Promise<TelegramRecipient[]> {
  const [ticket] = await db
    .select({
      tenantId: tickets.tenantId,
      siteId: tickets.siteId,
      assigneeId: tickets.currentAssigneeId,
    })
    .from(tickets)
    .where(eq(tickets.id, event.ticketId));
  if (!ticket) return [];

  const recipients: TelegramRecipient[] = [];
  if (reporterNotice(event.from, event.to)) {
    recipients.push(...(await reporterRecipients(db, event.ticketId)));
  }

  const audience = assigneeAudience(event.from, event.to);
  if (audience && ticket.assigneeId) {
    const [assignee] = await db
      .select({
        chatId: telegramMembers.chatId,
        locale: telegramMembers.locale,
      })
      .from(telegramMembers)
      .innerJoin(memberships, eq(memberships.userId, telegramMembers.userId))
      .where(
        and(
          eq(telegramMembers.userId, ticket.assigneeId),
          eq(memberships.tenantId, ticket.tenantId),
          eq(memberships.active, true),
        ),
      );
    if (assignee) {
      recipients.push({
        chatId: assignee.chatId,
        locale: asLocale(assignee.locale),
        audience,
        reference: null,
      });
    }
  }

  if (event.to === "completion_submitted") {
    recipients.push(...(await supervisorRecipients(db, ticket)));
  }
  if (recipients.length === 0) return [];

  const sent = await db
    .select({ chatId: telegramNotices.chatId })
    .from(telegramNotices)
    .where(
      and(
        eq(telegramNotices.ticketId, event.ticketId),
        eq(telegramNotices.eventSeq, event.seq),
      ),
    );
  const seen = new Set(sent.map((row) => row.chatId));
  return recipients.filter(function isNew(recipient) {
    if (seen.has(recipient.chatId)) return false;
    seen.add(recipient.chatId);
    return true;
  });
}

export async function recordTelegramNotice(
  db: Db,
  input: { chatId: string; ticketId: string; eventSeq: number },
) {
  await db.insert(telegramNotices).values(input).onConflictDoNothing();
}

export async function getTicketHeadline(db: Db, ticketId: string) {
  const [ticket] = await db
    .select({ summary: tickets.summary, locationName: locations.name })
    .from(tickets)
    .leftJoin(locations, eq(locations.id, tickets.locationId))
    .where(eq(tickets.id, ticketId));
  if (!ticket) return null;
  const [report] = await db
    .select({
      description: reports.description,
      locationText: reports.locationText,
    })
    .from(reports)
    .where(eq(reports.canonicalTicketId, ticketId))
    .limit(1);
  return {
    title: ticket.summary ?? report?.description ?? "",
    location: ticket.locationName ?? report?.locationText ?? "",
  };
}
