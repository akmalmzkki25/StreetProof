import {
  claimDeadlineNotice,
  errorFields,
  listDeadlineAlerts,
  logEvent,
  releaseDeadlineNotice,
  type Db,
  type DeadlineAlert,
} from "@streetproof/db";
import { deadlineMail, type SendMail } from "@streetproof/db/mail";
import type { SendTelegram } from "@streetproof/db/telegram-send";
import { asSiteTimeZone, timeZoneLabel } from "@streetproof/domain";
import { formatInTimeZone } from "date-fns-tz";

export const DEADLINE_SWEEP_MS = 5 * 60 * 1000;

type Deps = {
  db: Db;
  sendMail: SendMail | null;
  sendTelegram: SendTelegram | null;
  appUrl: string;
};

const TELEGRAM_TEXT = {
  due_soon: {
    en: "Due within a day: {due}",
    id: "Tenggat kurang dari sehari: {due}",
  },
  overdue: {
    en: "Past its deadline of {due}",
    id: "Lewat tenggat {due}",
  },
} as const;

function dueText(alert: DeadlineAlert) {
  const zone = asSiteTimeZone(alert.timeZone);
  return `${formatInTimeZone(alert.dueAt, zone, "d MMM yyyy, HH:mm")} ${timeZoneLabel(zone)}`;
}

async function sendAlert(deps: Deps, alert: DeadlineAlert) {
  const due = dueText(alert);
  const ticketUrl = `${deps.appUrl}/app/tickets/${alert.ticketId}`;
  for (const recipient of alert.recipients) {
    if (deps.sendTelegram && recipient.chatId) {
      await deps.sendTelegram({
        chatId: recipient.chatId,
        text: [
          TELEGRAM_TEXT[alert.kind][recipient.locale].replace("{due}", due),
          alert.title,
          alert.location,
          ticketUrl,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }
    if (deps.sendMail) {
      await deps.sendMail(
        deadlineMail({
          to: recipient.email,
          kind: alert.kind,
          title: alert.title,
          location: alert.location,
          due,
          ticketUrl,
        }),
      );
    }
  }
}

// Each reminder is claimed before it's sent, so a second worker skips it, and
// released when sending fails, so the next sweep tries again.
export async function runDeadlineSweep(deps: Deps, now: Date = new Date()) {
  if (!deps.sendMail && !deps.sendTelegram) return 0;
  const alerts = await listDeadlineAlerts(deps.db, now);
  let sent = 0;
  for (const alert of alerts) {
    if (!(await claimDeadlineNotice(deps.db, alert))) continue;
    try {
      await sendAlert(deps, alert);
      sent += 1;
    } catch (error) {
      await releaseDeadlineNotice(deps.db, alert);
      logEvent("error", "Deadline reminder failed", {
        ticketId: alert.ticketId,
        kind: alert.kind,
        ...errorFields(error),
      });
    }
  }
  return sent;
}
