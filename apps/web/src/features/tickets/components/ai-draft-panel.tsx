import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { TicketDetail } from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";
import { cn } from "@streetproof/ui/lib/utils";
import { parseIntakeDraft, type IntakeDraft } from "@streetproof/contracts";
import { Link } from "@/components/locale-link";

import { getI18n } from "@/lib/i18n/server";

import { categoryLabel, PRIORITY_LABELS } from "../labels";
import "./ai-panel.css";
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

function Candidate({
  label,
  value,
  unknown,
}: {
  label: string;
  value: string | null;
  unknown: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="type-caption text-muted-foreground">{label}</dt>
      <dd className={value ? "font-medium" : "text-muted-foreground"}>
        {value ?? unknown}
      </dd>
    </div>
  );
}

export async function FactList({
  title,
  items,
  isQuiet = false,
  className,
}: {
  title: string;
  items: { key: string; text: string; detail?: string }[];
  isQuiet?: boolean;
  className?: string;
}) {
  if (items.length === 0) return null;
  const { t } = await getI18n();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h3 className="type-caption font-medium">{t(title)}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.key}
            className={cn(
              "border-l-2 pl-3",
              isQuiet && "text-muted-foreground",
            )}
          >
            {item.text}
            {item.detail ? (
              <span className="type-caption block text-muted-foreground">
                {item.detail}
              </span>
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
    <div className="ai-halo relative isolate">
      <div
        aria-hidden="true"
        className="absolute -inset-2 -z-10 rounded-[2.5rem] bg-(image:--ai-gradient) opacity-15 blur-2xl contrast-more:hidden dark:opacity-25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-4xl bg-(image:--ai-gradient) opacity-50"
      />
      <section
        aria-labelledby="ai-draft"
        className="relative m-px flex flex-col gap-6 rounded-[11px] bg-card p-6"
      >
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h2 id="ai-draft" className="type-title">
              {t("AI suggestion")}
            </h2>
            <Badge variant="outline">{t("Not verified")}</Badge>
          </div>
          <p className="type-caption text-muted-foreground">
            {t(
              "AI suggestion from {model}. Check it against the report and photos.",
              { model: ticket.aiDraft?.model ?? "" },
            )}
          </p>
        </header>

        <p className="type-lead max-w-3xl font-medium">{draft.summary}</p>
        <DamageFigure regions={ticket.damageRegions} />

        <div className="flex flex-col gap-4 rounded-2xl bg-surface-raised p-4 shadow-inset">
          <dl className="grid grid-cols-2 gap-4">
            <Candidate
              label={t("Category")}
              value={
                draft.categoryCandidate === "unknown"
                  ? null
                  : t(categoryLabel(draft.categoryCandidate) ?? "")
              }
              unknown={t("Unknown")}
            />
            <Candidate
              label={t("Priority")}
              value={
                draft.priorityCandidate === "unknown"
                  ? null
                  : t(PRIORITY_LABELS[draft.priorityCandidate])
              }
              unknown={t("Unknown")}
            />
          </dl>
          <p className="type-caption border-t pt-3 text-muted-foreground">
            <span className="font-medium text-foreground">{t("Why")}</span>{" "}
            {draft.priorityRationale}
          </p>
        </div>

        {draft.duplicateCandidates.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="type-caption font-medium">
              {t("Possible duplicates")}
            </h3>
            <ul className="flex flex-col gap-2">
              {draft.duplicateCandidates.map((candidate) => (
                <li key={candidate.ticketId} className="border-l-2 pl-3">
                  <Link
                    href={`/app/tickets/${candidate.ticketId}`}
                    className="text-brand-text underline underline-offset-4"
                  >
                    {t("Open ticket")}
                  </Link>
                  <span className="block text-muted-foreground">
                    {candidate.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <details
          open={ticket.status === "submitted"}
          className="group ai-evidence"
        >
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-brand-text underline underline-offset-4">
            <span className="group-open:hidden">{t("Show the evidence")}</span>
            <span className="hidden group-open:inline">
              {t("Hide the evidence")}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-4 transition-transform duration-200 ease-out group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="grid gap-x-8 gap-y-5 pt-5 @2xl:grid-cols-2">
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
              isQuiet
              items={draft.inferences.map((inference) => ({
                key: inference.text,
                text: inference.text,
                detail: t(`${inference.uncertainty} uncertainty`),
              }))}
            />
            <FactList
              title="Missing information"
              isQuiet
              items={draft.missing_fields.map((field) => ({
                key: field,
                text: field,
              }))}
            />
            <FactList
              title="Limits of this suggestion"
              isQuiet
              className="@2xl:col-span-2"
              items={draft.limitations.map((limitation) => ({
                key: limitation,
                text: limitation,
              }))}
            />
          </div>
        </details>
      </section>
    </div>
  );
}
