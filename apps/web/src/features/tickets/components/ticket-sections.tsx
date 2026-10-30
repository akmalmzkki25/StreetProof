import type { TicketDetail } from "@streetproof/db";
import { canManageDuplicates } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import Link from "next/link";

import { Panel } from "@/components/panel";
import { formatDateTime } from "@/lib/format";
import type { Member } from "@/lib/member";
import { getStorage } from "@/lib/storage";

import { categoryLabel, PRIORITY_LABELS, STATUS_LABELS } from "../labels";
import { UnlinkDuplicateForm } from "./duplicate-forms";

type StoredPhoto = { id: string; objectKey: string };

async function PhotoGrid({
  photos,
  label,
}: {
  photos: StoredPhoto[];
  label: string;
}) {
  if (photos.length === 0) return null;

  const storage = getStorage();
  const signed = await Promise.all(
    photos.map(async (photo) => ({
      id: photo.id,
      url: await storage.signedReadUrl(photo.objectKey),
    })),
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {signed.map((photo, index) => (
        <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
          {/* Signed, short-lived URLs from the private bucket. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={`${label} ${index + 1}`}
            loading="lazy"
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </a>
      ))}
    </div>
  );
}

const ATTEMPT_LABELS = {
  pending: "Awaiting verification",
  accepted: "Verified",
  rejected: "Proof rejected",
} as const;

const ATTEMPT_VARIANTS = {
  pending: "outline",
  accepted: "brand",
  rejected: "destructive",
} as const;

export function Attempts({ ticket }: { ticket: TicketDetail }) {
  if (ticket.attempts.length === 0) return null;

  return (
    <section aria-labelledby="attempts" className="flex flex-col gap-4">
      <h2 id="attempts" className="type-title">
        Completion proof
      </h2>
      {ticket.attempts.map((attempt) => (
        <article
          key={attempt.id}
          className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card"
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant={ATTEMPT_VARIANTS[attempt.status]}>
              {ATTEMPT_LABELS[attempt.status]}
            </Badge>
            {attempt.exceptionReason ? (
              <Badge variant="outline">Exception requested</Badge>
            ) : null}
          </div>
          <p className="whitespace-pre-wrap">{attempt.note}</p>
          <p className="type-caption text-muted-foreground">
            {attempt.submitterName} · {formatDateTime(attempt.submittedAt)}
          </p>
          {attempt.exceptionReason ? (
            <p className="whitespace-pre-wrap">
              <span className="text-muted-foreground">
                Why it can&apos;t all be confirmed:{" "}
              </span>
              {attempt.exceptionReason}
            </p>
          ) : null}
          {attempt.checklist.length > 0 ? (
            <ul className="flex flex-col gap-1 type-caption">
              {attempt.checklist.map((item) => (
                <li
                  key={item.id}
                  className={item.checked ? "" : "text-destructive"}
                >
                  {item.checked ? "Confirmed" : "Not confirmed"}: {item.label}
                </li>
              ))}
            </ul>
          ) : null}
          {attempt.photos.length === 0 ? (
            <p className="type-caption text-muted-foreground">
              No photo was added.
            </p>
          ) : null}
          <PhotoGrid photos={attempt.photos} label="Proof photo" />
          {attempt.decisionReason ? (
            <p>
              <span className="text-muted-foreground">
                {attempt.verifierName}:{" "}
              </span>
              {attempt.decisionReason}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export function Reports({ ticket }: { ticket: TicketDetail }) {
  return (
    <section aria-labelledby="reports" className="flex flex-col gap-4">
      <h2 id="reports" className="type-title">
        Reporter-provided
      </h2>
      {ticket.reports.map((report) => (
        <article
          key={report.id}
          className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card"
        >
          <p className="whitespace-pre-wrap">{report.description}</p>
          <p className="type-caption text-muted-foreground">
            {report.locationName ?? report.locationText} ·{" "}
            {formatDateTime(report.createdAt)}
          </p>
          <PhotoGrid photos={report.photos} label="Report photo" />
        </article>
      ))}
    </section>
  );
}

export function LinkedReports({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (ticket.linkedDuplicates.length === 0) return null;
  const canOpenSource = canManageDuplicates(member.roles);

  return (
    <section aria-labelledby="linked" className="flex flex-col gap-4">
      <h2 id="linked" className="type-title">
        Linked reports
      </h2>
      {ticket.linkedDuplicates.map((link) =>
        link.reports.map((report) => (
          <article
            key={report.id}
            className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card"
          >
            <p className="whitespace-pre-wrap">{report.description}</p>
            <p className="type-caption text-muted-foreground">
              {report.locationName ?? report.locationText} ·{" "}
              {formatDateTime(report.createdAt)}
            </p>
            <PhotoGrid photos={report.photos} label="Linked report photo" />
            <p>
              <span className="text-muted-foreground">Linked because: </span>
              {link.reason}
            </p>
            {canOpenSource ? (
              <Link
                href={`/app/tickets/${link.ticketId}`}
                className="self-start text-brand-text underline underline-offset-4"
              >
                Open this report
              </Link>
            ) : null}
          </article>
        )),
      )}
    </section>
  );
}

export function DuplicateOf({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (!ticket.duplicateOf) return null;

  return (
    <Panel id="duplicate-of" title="Linked as a duplicate">
      <p className="text-muted-foreground">
        The repair is tracked on the other ticket. This report&apos;s reporter
        follows that ticket&apos;s progress.
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-muted-foreground">Ticket</dt>
        <dd>
          <Link
            href={`/app/tickets/${ticket.duplicateOf.ticketId}`}
            className="text-brand-text underline underline-offset-4"
          >
            {ticket.duplicateOf.title}
          </Link>
        </dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>{STATUS_LABELS[ticket.duplicateOf.status]}</dd>
        <dt className="text-muted-foreground">Reason</dt>
        <dd>{ticket.duplicateOf.reason}</dd>
      </dl>
      {canManageDuplicates(member.roles) ? (
        <UnlinkDuplicateForm ticketId={ticket.id} revision={ticket.revision} />
      ) : null}
    </Panel>
  );
}

export function Reviewed({ ticket }: { ticket: TicketDetail }) {
  if (!ticket.category) return null;
  return (
    <Panel id="reviewed" title="Operator-reviewed">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-muted-foreground">Category</dt>
        <dd>{categoryLabel(ticket.category)}</dd>
        <dt className="text-muted-foreground">Priority</dt>
        <dd>
          {ticket.priority ? PRIORITY_LABELS[ticket.priority] : "Not set"}
        </dd>
        <dt className="text-muted-foreground">Location</dt>
        <dd>{ticket.locationName ?? "As the reporter described"}</dd>
        {ticket.assigneeName ? (
          <>
            <dt className="text-muted-foreground">Technician</dt>
            <dd>{ticket.assigneeName}</dd>
          </>
        ) : null}
      </dl>
    </Panel>
  );
}

function eventLabel(event: TicketDetail["events"][number]) {
  if (event.type === "ai_draft_ready") return "AI suggestion ready";
  if (event.type === "clarification_answered") return "Reporter answered";
  if (
    event.fromStatus === "needs_clarification" &&
    event.toStatus === "submitted"
  ) {
    return "Back to triage";
  }
  if (event.type === "duplicate_unlinked") return "Duplicate link removed";
  if (event.type === "duplicate_linked") {
    return event.payload.role === "target"
      ? "Duplicate report linked"
      : "Linked as a duplicate";
  }
  return event.toStatus ? STATUS_LABELS[event.toStatus] : event.type;
}

export function Timeline({ ticket }: { ticket: TicketDetail }) {
  return (
    <section aria-labelledby="timeline" className="flex flex-col gap-4">
      <h2 id="timeline" className="type-title">
        History
      </h2>
      <ol className="flex flex-col gap-3">
        {ticket.events.map((event) => (
          <li key={event.id}>
            <span>{eventLabel(event)}</span>
            <span className="type-caption text-muted-foreground">
              {" "}
              ·{" "}
              {event.type === "ai_draft_ready"
                ? "Worker"
                : (event.actorName ?? "Reporter")}{" "}
              · {formatDateTime(event.createdAt)}
            </span>
            {typeof event.payload.reason === "string" ? (
              <p className="mt-0.5 type-caption text-muted-foreground">
                {event.payload.reason}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
