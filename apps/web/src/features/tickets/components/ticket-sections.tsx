import type { TicketDetail } from "@streetproof/db";
import { canManageDuplicates, isOverdue } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import Link from "next/link";

import { Panel } from "@/components/panel";
import { formatDateTime } from "@/lib/format";
import type { Member } from "@/lib/member";
import { getStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

import { categoryLabel, PRIORITY_LABELS, STATUS_LABELS } from "../labels";
import { UnlinkDuplicateForm } from "./duplicate-forms";
import { NoteForm } from "./note-form";
import { ProofCheckPanel } from "./proof-check-panel";

// Set by the worker rather than a person.
const WORKER_EVENT_TYPES = ["ai_draft_ready", "ai_proof_check_ready"];

type StoredPhoto = { id: string; objectKey: string };

async function PhotoGrid({
  photos,
  label,
  columns = "grid-cols-2 sm:grid-cols-3",
}: {
  photos: StoredPhoto[];
  label: string;
  columns?: string;
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
    <div className={cn("grid gap-3", columns)}>
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

function BeforeAfter({
  before,
  after,
}: {
  before: StoredPhoto[];
  after: StoredPhoto[];
}) {
  // Two columns even on a phone: seeing both at once is the point.
  const columns = "grid-cols-1";
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="type-caption text-muted-foreground">
          Before, from the report
        </h3>
        <PhotoGrid photos={before} label="Before photo" columns={columns} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="type-caption text-muted-foreground">
          After, from the technician
        </h3>
        <PhotoGrid photos={after} label="Proof photo" columns={columns} />
      </div>
    </div>
  );
}

export function Attempts({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (ticket.attempts.length === 0) return null;
  const reportPhotos = ticket.reports.flatMap((report) => report.photos);
  const isSupervisor = member.roles.includes("supervisor");

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
          {attempt.status === "pending" &&
          attempt.photos.length > 0 &&
          reportPhotos.length > 0 ? (
            <BeforeAfter before={reportPhotos} after={attempt.photos} />
          ) : (
            <PhotoGrid photos={attempt.photos} label="Proof photo" />
          )}
          {isSupervisor ? <ProofCheckPanel attempt={attempt} /> : null}
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

export function InternalNotes({ ticket }: { ticket: TicketDetail }) {
  return (
    <Panel id="internal-notes" title="Internal notes">
      <p className="type-caption text-muted-foreground">
        Your team can read these. The reporter never sees them.
      </p>
      {ticket.notes.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {ticket.notes.map((note) => (
            <li key={note.id}>
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="type-caption text-muted-foreground">
                {note.authorName} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      <NoteForm ticketId={ticket.id} />
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
        {ticket.teamName ? (
          <>
            <dt className="text-muted-foreground">Team</dt>
            <dd>{ticket.teamName}</dd>
          </>
        ) : null}
        {ticket.dueAt ? (
          <>
            <dt className="text-muted-foreground">Due by</dt>
            <dd
              className={
                isOverdue(ticket, new Date()) ? "text-destructive" : undefined
              }
            >
              {formatDateTime(ticket.dueAt)}
              {isOverdue(ticket, new Date()) ? " (overdue)" : ""}
            </dd>
          </>
        ) : null}
      </dl>
    </Panel>
  );
}

function eventLabel(event: TicketDetail["events"][number]) {
  if (event.type === "ai_draft_ready") return "AI suggestion ready";
  if (event.type === "ai_draft_retried") return "AI suggestion requested again";
  if (event.type === "ai_proof_check_ready") return "AI comparison ready";
  if (event.type === "note_added") return "Internal note added";
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
              {WORKER_EVENT_TYPES.includes(event.type)
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
