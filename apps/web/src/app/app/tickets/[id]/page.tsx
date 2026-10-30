import {
  getDb,
  getTicketDetail,
  listLinkCandidates,
  listSiteLocations,
  listTechnicians,
  type TicketDetail,
} from "@streetproof/db";
import {
  availableTransitions,
  canBeLinkedAsDuplicate,
  canManageDuplicates,
  canViewTicket,
} from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import {
  AiDraftPanel,
  readDraft,
} from "@/features/tickets/components/ai-draft-panel";
import {
  LinkDuplicateForm,
  UnlinkDuplicateForm,
} from "@/features/tickets/components/duplicate-forms";
import {
  AssignForm,
  CancelForm,
  CompletionForm,
  DecisionForm,
  ProgressButton,
  ReopenForm,
  TriageForm,
  WaitForm,
} from "@/features/tickets/components/ticket-forms";
import {
  categoryLabel,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/features/tickets/labels";
import { formatDateTime } from "@/lib/format";
import { requireMember, type Member } from "@/lib/member";
import { getStorage } from "@/lib/storage";

export const metadata: Metadata = { title: "Ticket" };

export default function TicketPage({ params }: PageProps<"/app/tickets/[id]">) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-4 py-12 md:px-8">
      <Link
        href="/app"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Workspace
      </Link>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Ticket idPromise={params.then((value) => value.id)} />
      </Suspense>
    </main>
  );
}

async function Ticket({ idPromise }: { idPromise: Promise<string> }) {
  const member = await requireMember();
  const id = z.uuid().safeParse(await idPromise);
  if (!id.success) notFound();

  const ticket = await getTicketDetail(
    getDb(),
    { tenantId: member.tenantId, siteIds: member.siteIds },
    id.data,
  );
  if (!ticket) notFound();
  if (!canViewTicket(ticket, { userId: member.userId, roles: member.roles })) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge
          variant={ticket.status === "submitted" ? "brand" : "outline"}
          className="self-start"
        >
          {STATUS_LABELS[ticket.status]}
        </Badge>
        <h1 className="text-2xl">
          {ticket.summary ?? ticket.reports[0]?.description ?? "Ticket"}
        </h1>
      </header>

      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <Attempts ticket={ticket} />
          <Reports ticket={ticket} />
          <LinkedReports ticket={ticket} member={member} />
          {member.roles.includes("operator") &&
          (!ticket.duplicateOf || readDraft(ticket)) ? (
            <AiDraftPanel ticket={ticket} />
          ) : null}
          <Timeline ticket={ticket} />
        </div>
        <aside className="flex flex-col gap-6">
          <DuplicateOf ticket={ticket} member={member} />
          <Reviewed ticket={ticket} />
          {ticket.duplicateOf ? null : (
            <NextStep ticket={ticket} member={member} />
          )}
          <LinkAsDuplicate ticket={ticket} member={member} />
        </aside>
      </div>
    </div>
  );
}

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
            className="aspect-square w-full rounded-lg border border-border object-cover"
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

function Attempts({ ticket }: { ticket: TicketDetail }) {
  if (ticket.attempts.length === 0) return null;

  return (
    <section aria-labelledby="attempts" className="flex flex-col gap-4">
      <h2 id="attempts" className="text-sm text-muted-foreground">
        Completion proof
      </h2>
      {ticket.attempts.map((attempt) => (
        <article
          key={attempt.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        >
          <Badge
            variant={attempt.status === "rejected" ? "destructive" : "outline"}
            className="self-start"
          >
            {ATTEMPT_LABELS[attempt.status]}
          </Badge>
          <p className="whitespace-pre-wrap">{attempt.note}</p>
          <p className="text-sm text-muted-foreground">
            {attempt.submitterName} · {formatDateTime(attempt.submittedAt)}
          </p>
          <PhotoGrid photos={attempt.photos} label="Proof photo" />
          {attempt.decisionReason ? (
            <p className="text-sm">
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

function Reports({ ticket }: { ticket: TicketDetail }) {
  return (
    <section aria-labelledby="reports" className="flex flex-col gap-4">
      <h2 id="reports" className="text-sm text-muted-foreground">
        Reporter-provided
      </h2>
      {ticket.reports.map((report) => (
        <article
          key={report.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        >
          <p className="whitespace-pre-wrap">{report.description}</p>
          <p className="text-sm text-muted-foreground">
            {report.locationName ?? report.locationText} ·{" "}
            {formatDateTime(report.createdAt)}
          </p>
          <PhotoGrid photos={report.photos} label="Report photo" />
        </article>
      ))}
    </section>
  );
}

function LinkedReports({
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
      <h2 id="linked" className="text-sm text-muted-foreground">
        Linked reports
      </h2>
      {ticket.linkedDuplicates.map((link) =>
        link.reports.map((report) => (
          <article
            key={report.id}
            className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card"
          >
            <p className="whitespace-pre-wrap">{report.description}</p>
            <p className="text-sm text-muted-foreground">
              {report.locationName ?? report.locationText} ·{" "}
              {formatDateTime(report.createdAt)}
            </p>
            <PhotoGrid photos={report.photos} label="Linked report photo" />
            <p className="text-sm">
              <span className="text-muted-foreground">Linked because: </span>
              {link.reason}
            </p>
            {canOpenSource ? (
              <Link
                href={`/app/tickets/${link.ticketId}`}
                className="self-start text-sm text-brand-text underline underline-offset-4"
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

function DuplicateOf({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (!ticket.duplicateOf) return null;

  return (
    <section
      aria-labelledby="duplicate-of"
      className="flex flex-col gap-4 rounded-4xl bg-card p-6 shadow-card"
    >
      <div className="flex flex-col gap-2">
        <h2 id="duplicate-of" className="text-base">
          Linked as a duplicate
        </h2>
        <p className="text-sm text-muted-foreground">
          The repair is tracked on the other ticket. This report&apos;s reporter
          follows that ticket&apos;s progress.
        </p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
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
    </section>
  );
}

async function LinkAsDuplicate({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (
    ticket.duplicateOf ||
    ticket.linkedDuplicates.length > 0 ||
    !canManageDuplicates(member.roles) ||
    !canBeLinkedAsDuplicate(ticket)
  ) {
    return null;
  }

  const candidates = await listLinkCandidates(
    getDb(),
    { tenantId: member.tenantId, siteIds: member.siteIds },
    { id: ticket.id, siteId: ticket.siteId },
  );
  if (candidates.length === 0) return null;

  // The model's pick starts the form when it's still a valid target. A person
  // still has to submit it.
  const suggestion = readDraft(ticket)?.duplicateCandidates.find((candidate) =>
    candidates.some((item) => item.id === candidate.ticketId),
  );

  return (
    <section
      aria-labelledby="link-duplicate"
      className="flex flex-col gap-4 rounded-4xl bg-card p-6 shadow-card"
    >
      <h2 id="link-duplicate" className="text-base">
        Same problem as another ticket?
      </h2>
      <LinkDuplicateForm
        key={suggestion ? "with-suggestion" : "manual"}
        ticketId={ticket.id}
        revision={ticket.revision}
        candidates={candidates.map((item) => ({
          value: item.id,
          // Location first, so a narrow picker clips the title, not the place.
          label: item.location
            ? `${item.location} · ${item.title.slice(0, 70)}`
            : item.title.slice(0, 70),
        }))}
        defaultTargetId={suggestion?.ticketId ?? null}
        defaultReason={(suggestion?.reason ?? "").slice(0, 500)}
      />
    </section>
  );
}

function Reviewed({ ticket }: { ticket: TicketDetail }) {
  if (!ticket.category) return null;
  return (
    <section
      aria-labelledby="reviewed"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
    >
      <h2 id="reviewed" className="text-sm text-muted-foreground">
        Operator-reviewed
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
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
    </section>
  );
}

async function NextStep({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  const allowed = availableTransitions(
    {
      status: ticket.status,
      revision: ticket.revision,
      currentAssigneeId: ticket.currentAssigneeId,
    },
    { userId: member.userId, roles: member.roles },
  ).map((rule) => rule.to);
  const db = getDb();
  const ref = { ticketId: ticket.id, revision: ticket.revision };

  const draft = readDraft(ticket);
  const canTriage = allowed.includes("triaged");
  const canAssign = allowed.includes("assigned");
  const canCancel = allowed.includes("cancelled");
  const canAccept = allowed.includes("accepted");
  const canWork = allowed.includes("in_progress");
  const canWait = allowed.includes("waiting_for_parts");
  const canComplete = allowed.includes("completion_submitted");
  const canDecide = allowed.includes("verified_closed");
  const canReopen = allowed.includes("reopened");

  if (allowed.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No action is needed from you right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {canTriage ? (
        <section
          aria-labelledby="triage"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <h2 id="triage" className="text-base">
            Confirm triage
          </h2>
          <TriageForm
            // Remounts once a draft arrives, so the operator starts from it.
            key={draft ? "with-draft" : "manual"}
            {...ref}
            defaultSummary={(
              draft?.summary ??
              ticket.reports[0]?.description ??
              ""
            ).slice(0, 200)}
            defaultCategory={
              draft && draft.categoryCandidate !== "unknown"
                ? draft.categoryCandidate
                : null
            }
            defaultPriority={
              draft && draft.priorityCandidate !== "unknown"
                ? draft.priorityCandidate
                : "normal"
            }
            locations={await listSiteLocations(
              db,
              member.tenantId,
              ticket.siteId,
            )}
            defaultLocationId={ticket.locationId}
          />
        </section>
      ) : null}
      {canAssign ? (
        <section
          aria-labelledby="assign"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <h2 id="assign" className="text-base">
            Assign the work
          </h2>
          <AssignForm
            {...ref}
            technicians={await listTechnicians(
              db,
              member.tenantId,
              ticket.siteId,
            )}
          />
        </section>
      ) : null}
      {canCancel && ticket.linkedDuplicates.length === 0 ? (
        <CancelForm {...ref} />
      ) : null}
      {canCancel && ticket.linkedDuplicates.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          To cancel this ticket, first remove the links from the reports that
          point to it.
        </p>
      ) : null}
      {canAccept ? (
        <ProgressButton {...ref} to="accepted" label="Accept work" />
      ) : null}
      {canWork ? (
        <ProgressButton
          {...ref}
          to="in_progress"
          label={ticket.status === "accepted" ? "Start work" : "Resume work"}
        />
      ) : null}
      {canComplete ? (
        <section
          aria-labelledby="complete"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <h2 id="complete" className="text-base">
            Submit completion
          </h2>
          <CompletionForm {...ref} />
        </section>
      ) : null}
      {canWait ? (
        <section
          aria-labelledby="wait"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <h2 id="wait" className="text-base">
            Can&apos;t continue yet?
          </h2>
          <WaitForm {...ref} />
        </section>
      ) : null}
      {canDecide ? (
        <section
          aria-labelledby="decide"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <h2 id="decide" className="text-base">
            Review the proof
          </h2>
          <DecisionForm {...ref} />
        </section>
      ) : null}
      {canReopen ? (
        <section
          aria-labelledby="reopen"
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <h2 id="reopen" className="text-base">
            Reopen
          </h2>
          <ReopenForm {...ref} />
        </section>
      ) : null}
    </div>
  );
}

function eventLabel(event: TicketDetail["events"][number]) {
  if (event.type === "ai_draft_ready") return "AI suggestion ready";
  if (event.type === "duplicate_unlinked") return "Duplicate link removed";
  if (event.type === "duplicate_linked") {
    return event.payload.role === "target"
      ? "Duplicate report linked"
      : "Linked as a duplicate";
  }
  return event.toStatus ? STATUS_LABELS[event.toStatus] : event.type;
}

function Timeline({ ticket }: { ticket: TicketDetail }) {
  return (
    <section aria-labelledby="timeline" className="flex flex-col gap-4">
      <h2 id="timeline" className="text-sm text-muted-foreground">
        History
      </h2>
      <ol className="flex flex-col gap-3">
        {ticket.events.map((event) => (
          <li key={event.id} className="text-sm">
            <span>{eventLabel(event)}</span>
            <span className="text-muted-foreground">
              {" "}
              ·{" "}
              {event.type === "ai_draft_ready"
                ? "Worker"
                : (event.actorName ?? "Reporter")}{" "}
              · {formatDateTime(event.createdAt)}
            </span>
            {typeof event.payload.reason === "string" ? (
              <p className="mt-0.5 text-muted-foreground">
                {event.payload.reason}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
