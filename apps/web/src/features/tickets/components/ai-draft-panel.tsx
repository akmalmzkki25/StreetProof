import type { TicketDetail } from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";
import { parseIntakeDraft, type IntakeDraft } from "@streetproof/contracts";
import { Link } from "@/components/locale-link";

import { getI18n } from "@/lib/i18n/server";

import { categoryLabel, PRIORITY_LABELS } from "../labels";
import { AiRefresher } from "./ai-refresher";
import { DamageFigure } from "./damage-figure";
import { RetryDraftButton } from "./retry-draft-button";

const PENDING_STATES = ["queued", "running", "failed_retryable"];

export function readDraft(ticket: TicketDetail): IntakeDraft | null {
  if (ticket.aiDraft?.state !== "succeeded") return null;
  const parsed = parseIntakeDraft(ticket.aiDraft.draft);
  return parsed.success ? parsed.data : null;
}

async function Notice({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const { t } = await getI18n();
  return (
    <section
      aria-labelledby="ai-draft"
      className="flex flex-col gap-2 rounded-4xl bg-card p-6 shadow-card"
    >
      <h2 id="ai-draft" className="type-title">
        {t("AI suggestion")}
      </h2>
      <p className="text-muted-foreground">{children}</p>
      {action}
    </section>
  );
}

export async function FactList({
  title,
  items,
}: {
  title: string;
  items: { key: string; text: string; detail?: string }[];
}) {
  if (items.length === 0) return null;
  const { t } = await getI18n();
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="type-caption text-muted-foreground">{t(title)}</h3>
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

export async function AiDraftPanel({ ticket }: { ticket: TicketDetail }) {
  const isAwaitingTriage = ticket.status === "submitted";
  const state = ticket.aiDraft?.state ?? "queued";
  const { t } = await getI18n();

  if (PENDING_STATES.includes(state)) {
    if (!isAwaitingTriage) return null;
    return (
      <>
        <AiRefresher />
        <Notice>
          {t(
            "Preparing a suggestion. You don't have to wait: you can triage this report by hand now.",
          )}
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
          {t(
            "The suggestion couldn't be prepared. You can try again, or triage this report by hand.",
          )}
        </Notice>
      );
    }
    return (
      <Notice>
        {t(
          "No suggestion is available for this report. Please triage it by hand.",
        )}
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
          {t("Not verified")}
        </Badge>
        <h2 id="ai-draft" className="type-caption text-muted-foreground">
          {t(
            "AI suggestion from {model}. Check it against the report and photos.",
            { model: ticket.aiDraft?.model ?? "" },
          )}
        </h2>
      </div>

      <p>{draft.summary}</p>
      <DamageFigure regions={ticket.damageRegions} />

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-muted-foreground">{t("Category")}</dt>
        <dd>
          {draft.categoryCandidate === "unknown"
            ? t("Unknown")
            : t(categoryLabel(draft.categoryCandidate) ?? "")}
        </dd>
        <dt className="text-muted-foreground">{t("Priority")}</dt>
        <dd>
          {draft.priorityCandidate === "unknown"
            ? t("Unknown")
            : t(PRIORITY_LABELS[draft.priorityCandidate])}
        </dd>
        <dt className="text-muted-foreground">{t("Why")}</dt>
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
          detail: t(`${inference.uncertainty} uncertainty`),
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
            {t("Possible duplicates")}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {draft.duplicateCandidates.map((candidate) => (
              <li key={candidate.ticketId}>
                <Link
                  href={`/app/tickets/${candidate.ticketId}`}
                  className="text-brand-text underline underline-offset-4"
                >
                  {t("Open ticket")}
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
