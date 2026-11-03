import { and, inArray, isNotNull, lt, sql } from "drizzle-orm";
import type { Db } from "./client";
import {
  rateLimits,
  reports,
  telegramConversations,
  telegramLinkCodes,
  telegramReportSubscriptions,
  tickets,
} from "./schema";

const DAY_MS = 24 * 60 * 60 * 1000;

// How long a reporter's way of being reached outlives their closed report.
export const REPORTER_CONTACT_DAYS = 90;
const UNFINISHED_CHAT_DAYS = 7;
const USED_CODE_DAYS = 1;

// Contact details and leftovers only. Reports, photos, tickets and the audit log
// stay: they're the evidence, and how long to keep them is the building's call
// (plan A-07), not something to delete on a timer.
export async function purgeExpiredData(db: Db, now: Date = new Date()) {
  const contactCutoff = new Date(
    now.getTime() - REPORTER_CONTACT_DAYS * DAY_MS,
  );
  const closedLongAgo = db
    .select({ id: tickets.id })
    .from(tickets)
    .where(
      and(
        inArray(tickets.status, ["verified_closed", "cancelled"]),
        lt(tickets.updatedAt, contactCutoff),
      ),
    );

  return db.transaction(async function run(tx) {
    const emails = await tx
      .update(reports)
      .set({ reporterEmail: null })
      .where(
        and(
          isNotNull(reports.reporterEmail),
          inArray(reports.canonicalTicketId, closedLongAgo),
        ),
      )
      .returning({ id: reports.id });

    const followers = await tx
      .delete(telegramReportSubscriptions)
      .where(
        inArray(
          telegramReportSubscriptions.reportId,
          tx
            .select({ id: reports.id })
            .from(reports)
            .where(inArray(reports.canonicalTicketId, closedLongAgo)),
        ),
      )
      .returning({ id: telegramReportSubscriptions.id });

    const codes = await tx
      .delete(telegramLinkCodes)
      .where(
        lt(
          telegramLinkCodes.expiresAt,
          new Date(now.getTime() - USED_CODE_DAYS * DAY_MS),
        ),
      )
      .returning({ codeHash: telegramLinkCodes.codeHash });

    const chats = await tx
      .delete(telegramConversations)
      .where(
        lt(
          telegramConversations.updatedAt,
          new Date(now.getTime() - UNFINISHED_CHAT_DAYS * DAY_MS),
        ),
      )
      .returning({ chatId: telegramConversations.chatId });

    const limits = await tx
      .delete(rateLimits)
      .where(lt(rateLimits.expire, sql`${now.getTime()}`))
      .returning({ key: rateLimits.key });

    return {
      reporterEmails: emails.length,
      telegramFollowers: followers.length,
      linkCodes: codes.length,
      unfinishedChats: chats.length,
      rateLimits: limits.length,
    };
  });
}
