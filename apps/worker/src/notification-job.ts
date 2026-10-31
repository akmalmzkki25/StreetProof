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
import { reporterNotice, type TicketStatus } from "@streetproof/domain";

import {
  backoffMs,
  MAX_ATTEMPTS,
  WORKER_ERROR,
  type JobOutcome,
} from "./draft-job";

export const NOTIFICATION_TOPIC = "ticket.status_changed";

type Deps = { db: Db; sendMail: SendMail | null; appUrl: string };

export async function runNotificationJob(
  deps: Deps,
  job: OutboxJob,
): Promise<JobOutcome> {
  const { db, sendMail, appUrl } = deps;
  const notice = reporterNotice(
    job.payload.from as TicketStatus,
    job.payload.to as TicketStatus,
  );

  if (!notice || !sendMail) {
    await completeOutboxJob(db, job.id);
    return "skipped_manual";
  }

  const eventSeq = Number(job.payload.seq);
  const recipients = await listNoticeRecipients(
    db,
    String(job.payload.ticketId),
    eventSeq,
  );
  // One at a time, so a failure part way retries only those not yet told.
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
      eventSeq,
    });
  }

  await completeOutboxJob(db, job.id);
  return "succeeded";
}

// A mail server outage only delays a notice, and never touches the ticket.
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
