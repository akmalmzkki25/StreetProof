import { getDb, listQueue, recordAudit } from "@streetproof/db";
import { asSiteTimeZone, isOverdue, timeZoneLabel } from "@streetproof/domain";
import { stringify } from "csv-stringify/sync";
import { formatInTimeZone } from "date-fns-tz";
import { cookies } from "next/headers";
import { connection, type NextRequest } from "next/server";

import {
  categoryLabel,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/features/tickets/labels";
import {
  readQueueFilters,
  toQueueFilter,
} from "@/features/tickets/queue-params";
import { chooseLocale, LOCALE_COOKIE, translate } from "@/lib/i18n/translate";
import { getCurrentMember } from "@/lib/member";

const EXPORT_LIMIT = 5000;
// Excel reads a file without this as the local code page and breaks accents.
const UTF8_BOM = "﻿";

// A cell starting with one of these runs as a formula in a spreadsheet, so report
// text like "=HYPERLINK(...)" is kept as text.
function asText(value: string | null | undefined) {
  const text = value ?? "";
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function localTime(date: Date | null, timeZone: string) {
  if (!date) return "";
  const zone = asSiteTimeZone(timeZone);
  return `${formatInTimeZone(date, zone, "yyyy-MM-dd HH:mm")} ${timeZoneLabel(zone)}`;
}

// The queue as a spreadsheet, with the filters on screen. Staff who see the
// queue may take it away, and each download is audited.
export async function GET(request: NextRequest) {
  await connection();
  const member = await getCurrentMember();
  const canExport = member?.roles.some(
    (role) => role === "operator" || role === "supervisor",
  );
  if (!member || !canExport) {
    return new Response("Not found", { status: 404 });
  }

  const locale = chooseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = (text: string) => translate(locale, text);
  const filters = readQueueFilters(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const db = getDb();
  const items = await listQueue(
    db,
    { tenantId: member.tenantId, siteIds: member.siteIds },
    { ...toQueueFilter(filters), limit: EXPORT_LIMIT },
  );
  const now = new Date();

  const csv = stringify(
    items.map((item) => [
      item.id,
      asText(item.title),
      t(STATUS_LABELS[item.status]),
      t(categoryLabel(item.category) ?? "Not set"),
      item.priority ? t(PRIORITY_LABELS[item.priority]) : "",
      asText(item.siteName),
      asText(item.location),
      asText(item.teamName),
      asText(item.assigneeName),
      localTime(item.createdAt, item.timeZone),
      localTime(item.updatedAt, item.timeZone),
      localTime(item.dueAt, item.timeZone),
      isOverdue(item, now) ? t("Yes") : "",
      item.reportCount,
    ]),
    {
      header: true,
      columns: [
        t("Ticket ID"),
        t("Title"),
        t("Status"),
        t("Category"),
        t("Priority"),
        t("Site"),
        t("Location"),
        t("Team"),
        t("Assignee"),
        t("Sent"),
        t("Last update"),
        t("Due"),
        t("Overdue"),
        t("Reports"),
      ],
    },
  );

  await recordAudit(db, {
    tenantId: member.tenantId,
    actorId: member.userId,
    action: "tickets.exported",
    metadata: { rows: items.length, ...filters },
  });

  const day = formatInTimeZone(now, "Asia/Jakarta", "yyyy-MM-dd");
  return new Response(`${UTF8_BOM}${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="streetproof-tickets-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
