import type { TicketDetail } from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";
import { parseIntakeDraft, type IntakeDraft } from "@streetproof/contracts";
import Link from "next/link";

import { categoryLabel, PRIORITY_LABELS } from "../labels";
import { DraftRefresher } from "./draft-refresher";
import { RetryDraftButton } from "./retry-draft-button";

const PENDING_STATES = ["queued", "running", "failed_retryable"];

export function readDraft(ticket: TicketDetail): IntakeDraft | null {
  if (ticket.aiDraft?.state !== "succeeded") return null;
  const parsed = parseIntakeDraft(ticket.aiDraft.draft);
  return parsed.success ? parsed.data : null;
}

function Notice({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="ai-draft"
      className="flex flex-col gap-2 rounded-4xl bg-card p-6 shadow-card"
    >
      <h2 id="ai-draft" className="type-title">
        AI suggestion
      </h2>
      <p className="text-muted-foreground">{children}</p>
      {action}
    </section>
  );
}

function FactList({
  title,
  items,
}: {
  title: string;
  items: { key: string; text: string; detail?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="type-caption text-muted-foreground">{title}</h3>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.key}>
            {item.text}
            {item.detail ? (
              <span className="text-muted-foreground"> · {item.detail}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AiDraftPanel({ ticket }: { ticket: TicketDetail }) {
  const isAwaitingTriage = ticket.status === "submitted";
  const state = ticket.aiDraft?.state ?? "queued";

  if (PENDING_STATES.includes(state)) {
    if (!isAwaitingTriage) return null;
    return (
      <>
        <DraftRefresher />
        <Notice>
          Preparing a suggestion. You don&apos;t have to wait: you can triage
          this report by hand now.
        </Notice>
      </>
    );
  }

  const draft = readDraft(ticket);
  if (!draft) {
    if (!isAwaitingTriage) return null;
    if (state === "failed_terminal") {
      return (
        <Notice action={<RetryDraftButton ticketId={ticket.id} />}>
          The suggestion couldn&apos;t be prepared. You can try again, or triage
          this report by hand.
        </Notice>
      );
    }
    return (
      <Notice>
        No suggestion is available for this report. Please triage it by hand.
      </Notice>
    );
  }

  return (
    <section
      aria-labelledby="ai-draft"
      className="flex flex-col gap-4 rounded-4xl bg-card p-6 shadow-card"
    >
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="self-start">
          Not verified
        </Badge>
        <h2 id="ai-draft" className="type-caption text-muted-foreground">
          AI suggestion from {ticket.aiDraft?.model}. Check it against the
          report and photos.
        </h2>
      </div>

      <p>{draft.summary}</p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-muted-foreground">Category</dt>
        <dd>
          {draft.categoryCandidate === "unknown"
            ? "Unknown"
            : categoryLabel(draft.categoryCandidate)}
        </dd>
        <dt className="text-muted-foreground">Priority</dt>
        <dd>
          {draft.priorityCandidate === "unknown"
            ? "Unknown"
            : PRIORITY_LABELS[draft.priorityCandidate]}
        </dd>
        <dt className="text-muted-foreground">Why</dt>
        <dd>{draft.priorityRationale}</dd>
      </dl>

      <FactList
        title="Visible in the photos"
        items={draft.visibleFacts.map((fact) => ({
          key: fact.text,
          text: fact.text,
          detail: fact.evidenceRefs.join(", "),
        }))}
      />
      <FactList
        title="Said by the reporter"
        items={draft.userContext.map((item) => ({
          key: item.text,
          text: item.text,
        }))}
      />
      <FactList
        title="Inferred, not confirmed"
        items={draft.inferences.map((inference) => ({
          key: inference.text,
          text: inference.text,
          detail: `${inference.uncertainty} uncertainty`,
        }))}
      />
      <FactList
        title="Missing information"
        items={draft.missing_fields.map((field) => ({
          key: field,
          text: field,
        }))}
      />
      <FactList
        title="Limits of this suggestion"
        items={draft.limitations.map((limitation) => ({
          key: limitation,
          text: limitation,
        }))}
      />

      {draft.duplicateCandidates.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h3 className="type-caption text-muted-foreground">
            Possible duplicates
          </h3>
          <ul className="flex flex-col gap-1.5">
            {draft.duplicateCandidates.map((candidate) => (
              <li key={candidate.ticketId}>
                <Link
                  href={`/app/tickets/${candidate.ticketId}`}
                  className="text-brand-text underline underline-offset-4"
                >
                  Open ticket
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  · {candidate.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
