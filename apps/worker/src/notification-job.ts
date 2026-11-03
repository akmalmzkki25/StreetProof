import {
  completeOutboxJob,
  failOutboxJob,
  listNoticeRecipients,
  recordNoticeSent,
  retryOutboxJob,
  type Db,
  type OutboxJob,
} from "@streetproof/db";
import { statusNoticeMail, type SendMail } from "@streetproof/db/mail";
import type { SendTelegram } from "@streetproof/db/telegram-send";
import {
  reporterNotice,
  type ReporterNotice,
  type TicketStatus,
} from "@streetproof/domain";

import {
  backoffMs,
  MAX_ATTEMPTS,
  WORKER_ERROR,
  type JobOutcome,
} from "./draft-job";
import { sendTelegramNotices } from "./telegram-notices";

export const NOTIFICATION_TOPIC = "ticket.status_changed";

type Deps = {
  db: Db;
  sendMail: SendMail | null;
  sendTelegram?: SendTelegram | null;
  appUrl: string;
};

// One at a time, so a failure part way retries only those not yet told.
async function sendEmailNotices(
  db: Db,
  sendMail: SendMail,
  appUrl: string,
  notice: ReporterNotice,
  event: { ticketId: string; seq: number },
) {
  const recipients = await listNoticeRecipients(db, event.ticketId, event.seq);
  for (const recipient of recipients) {
    await sendMail(
      statusNoticeMail({
        to: recipient.email,
        reference: recipient.reference,
        notice,
        appUrl,
      }),
    );
    await recordNoticeSent(db, {
      tenantId: recipient.tenantId,
      reportId: recipient.reportId,
      eventSeq: event.seq,
    });
  }
}

export async function runNotificationJob(
  deps: Deps,
  job: OutboxJob,
): Promise<JobOutcome> {
  const { db, sendMail, sendTelegram, appUrl } = deps;
  const from = job.payload.from as TicketStatus;
  const to = job.payload.to as TicketStatus;
  const notice = reporterNotice(from, to);
  const emailsNotice = notice !== null && sendMail !== null;

  if (!emailsNotice && !sendTelegram) {
    await completeOutboxJob(db, job.id);
    return "skipped_manual";
  }

  const event = {
    ticketId: String(job.payload.ticketId),
    seq: Number(job.payload.seq),
    from,
    to,
    revision: Number(job.payload.revision),
    reason: typeof job.payload.reason === "string" ? job.payload.reason : null,
  };

  // Side by side, so a mail outage can't hold up Telegram, or the other way round.
  const results = await Promise.allSettled([
    emailsNotice ? sendEmailNotices(db, sendMail, appUrl, notice, event) : null,
    sendTelegram
      ? sendTelegramNotices({ db, sendTelegram, appUrl }, event)
      : null,
  ]);
  const failure = results.find((result) => result.status === "rejected");
  if (failure) throw failure.reason;

  await completeOutboxJob(db, job.id);
  return "succeeded";
}

// A mail or Telegram outage only delays a notice, and never touches the ticket.
export async function handleUnexpectedNotificationFailure(
  db: Db,
  job: OutboxJob,
): Promise<JobOutcome> {
  if (job.attempts < MAX_ATTEMPTS) {
    await retryOutboxJob(
      db,
      job.id,
      new Date(Date.now() + backoffMs(job.attempts)),
      WORKER_ERROR,
    );
    return "retrying";
  }
  await failOutboxJob(db, job.id, WORKER_ERROR);
  return "failed_terminal";
}
