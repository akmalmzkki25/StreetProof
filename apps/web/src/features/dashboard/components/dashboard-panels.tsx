import {
  DASHBOARD_WINDOW_DAYS,
  OBSERVATION_DAYS,
  type Dashboard,
} from "@streetproof/domain";
import { cn } from "@streetproof/ui/lib/utils";
import Link from "next/link";

import { Panel } from "@/components/panel";
import { categoryLabel } from "@/features/tickets/labels";
import { formatDuration } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import type { Locale, Translate } from "@/lib/i18n/translate";

import { AGE_LABELS, STAGE_LABELS } from "../labels";

// The bar is the true share of the largest row. A zero draws nothing.
function Bar({
  value,
  max,
  isMainSeries = false,
}: {
  value: number;
  max: number;
  isMainSeries?: boolean;
}) {
  return (
    <div className="h-1.5" aria-hidden="true">
      {value > 0 ? (
        <div
          className={cn(
            "h-full rounded-full",
            isMainSeries ? "bg-brand" : "bg-muted-foreground/50",
          )}
          style={{ width: `${(value / Math.max(max, 1)) * 100}%` }}
        />
      ) : null}
    </div>
  );
}

function CountList({
  rows,
  emptyMessage,
}: {
  rows: { key: string; label: string; count: number }[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <p className="type-caption text-muted-foreground">{emptyMessage}</p>;
  }
  const max = Math.max(...rows.map((row) => row.count));
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 truncate">{row.label}</span>
            <span className="tabular-nums">{row.count}</span>
          </div>
          <Bar value={row.count} max={max} />
        </li>
      ))}
    </ul>
  );
}

function periodNote(t: Translate) {
  return t("Last {days} days", { days: DASHBOARD_WINDOW_DAYS });
}

export async function StagePanel({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const max = Math.max(...dashboard.stages.map((row) => row.count));

  return (
    <Panel id="stages" title="Where open work sits" className="lg:col-span-2">
      <p className="flex items-baseline gap-2">
        <span className="type-headline tabular-nums">{dashboard.open}</span>
        <span className="text-muted-foreground">
          {dashboard.open === 1 ? t("open ticket") : t("open tickets")}
        </span>
      </p>
      <ul className="flex flex-1 flex-col justify-between gap-3">
        {dashboard.stages.map((row) => (
          <li key={row.stage} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className="min-w-0">
                {t(STAGE_LABELS[row.stage].title)}
                <span className="type-caption text-muted-foreground">
                  {" "}
                  · {t(STAGE_LABELS[row.stage].owner)}
                  {row.oldestAgeMs === null
                    ? ""
                    : ` · ${t("oldest {age}", { age: formatDuration(row.oldestAgeMs, locale) })}`}
                </span>
              </span>
              <span className="tabular-nums">{row.count}</span>
            </div>
            <Bar value={row.count} max={max} isMainSeries />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export async function AgePanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Panel id="age" title="Age of open work" note="Since the report">
      <CountList
        rows={dashboard.ageBuckets.map((row) => ({
          key: row.bucket,
          label: t(AGE_LABELS[row.bucket]),
          count: row.count,
        }))}
        emptyMessage={t("No open tickets.")}
      />
    </Panel>
  );
}

export async function OldestPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  return (
    <Panel id="oldest" title="Oldest open tickets" className="lg:col-span-2">
      {dashboard.oldest.length === 0 ? (
        <p className="type-caption text-muted-foreground">
          {t("No open tickets.")}
        </p>
      ) : (
        <ol className="-mx-3 flex flex-col">
          {dashboard.oldest.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/app/tickets/${ticket.id}`}
                className="flex items-baseline justify-between gap-4 rounded-2xl px-3 py-2 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{ticket.title}</span>
                  <span className="type-caption truncate text-muted-foreground">
                    {[
                      ticket.location,
                      t(STAGE_LABELS[ticket.stage].title),
                      ticket.assigneeName,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatDuration(ticket.ageMs, locale)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

export async function WorkloadPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Panel
      id="workload"
      title="Technician workload"
      note="Open tickets"
      className="flex-1"
    >
      <CountList
        rows={dashboard.workload.map((row) => ({
          key: row.name,
          label: row.name,
          count: row.count,
        }))}
        emptyMessage={t("No technician holds open work.")}
      />
    </Panel>
  );
}

function Outcome({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | null;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-card p-6">
      <h3 className="type-caption text-muted-foreground">{label}</h3>
      <p
        className={cn(
          "type-title tabular-nums",
          !value && "text-muted-foreground",
        )}
      >
        {value ?? "-"}
      </p>
      <p className="type-caption text-muted-foreground">{detail}</p>
    </div>
  );
}

function rangeOf(
  duration: { minMs: number | null; maxMs: number | null },
  t: Translate,
  locale: Locale,
) {
  if (duration.minMs === null || duration.maxMs === null) return "";
  return t(", range {low} to {high}", {
    low: formatDuration(duration.minMs, locale),
    high: formatDuration(duration.maxMs, locale),
  });
}

// A rate with a full window is shown as "x of y", never a bare percentage, and
// what is still inside the window stays pending rather than joining either side.
function rateDetail(
  rate: { denominator: number; pending: number },
  noun: "ticket" | "closure",
  t: Translate,
) {
  const params = { days: OBSERVATION_DAYS, count: rate.denominator };
  const isOne = rate.denominator === 1;
  const observed =
    noun === "ticket"
      ? isOne
        ? "1 ticket observed for {days} full days."
        : "{count} tickets observed for {days} full days."
      : isOne
        ? "1 closure observed for {days} full days."
        : "{count} closures observed for {days} full days.";
  const counted =
    rate.denominator === 0
      ? t(
          noun === "ticket"
            ? "No ticket has had {days} full days yet."
            : "No closure has had {days} full days yet.",
          params,
        )
      : t(observed, params);
  const pending = t("{count} still within {days} days.", {
    count: rate.pending,
    days: OBSERVATION_DAYS,
  });
  return `${counted} ${pending}`;
}

export async function OutcomeStrip({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const { timeToTriage, timeToClose, verifiedResolution, reopenRate } =
    dashboard;
  const ofTotal = (numerator: number, denominator: number) =>
    t("{numerator} of {denominator}", { numerator, denominator });

  return (
    <section
      aria-label={t("Outcomes, last {days} days", {
        days: DASHBOARD_WINDOW_DAYS,
      })}
      className="grid gap-px overflow-hidden rounded-4xl bg-border shadow-card sm:grid-cols-2 lg:grid-cols-4"
    >
      <Outcome
        label={t("Time to triage")}
        value={
          timeToTriage.medianMs === null
            ? null
            : formatDuration(timeToTriage.medianMs, locale)
        }
        detail={
          timeToTriage.count === 0
            ? t("Nothing triaged yet. {count} waiting.", {
                count: timeToTriage.untriaged,
              })
            : t("Median of {count}{range}. {waiting} not triaged.", {
                count: timeToTriage.count,
                range: rangeOf(timeToTriage, t, locale),
                waiting: timeToTriage.untriaged,
              })
        }
      />
      <Outcome
        label={t("Time to verified close")}
        value={
          timeToClose.medianMs === null
            ? null
            : formatDuration(timeToClose.medianMs, locale)
        }
        detail={
          timeToClose.count === 0
            ? t("Nothing closed yet. {count} open.", {
                count: timeToClose.stillOpen,
              })
            : t("Median of {count}{range}. {open} still open.", {
                count: timeToClose.count,
                range: rangeOf(timeToClose, t, locale),
                open: timeToClose.stillOpen,
              })
        }
      />
      <Outcome
        label={t("Verified within {days} days", { days: OBSERVATION_DAYS })}
        value={
          verifiedResolution.denominator === 0
            ? null
            : ofTotal(
                verifiedResolution.numerator,
                verifiedResolution.denominator,
              )
        }
        detail={rateDetail(verifiedResolution, "ticket", t)}
      />
      <Outcome
        label={t("Reopened within {days} days", { days: OBSERVATION_DAYS })}
        value={
          reopenRate.denominator === 0
            ? null
            : ofTotal(reopenRate.numerator, reopenRate.denominator)
        }
        detail={rateDetail(reopenRate, "closure", t)}
      />
    </section>
  );
}

export async function CategoryPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  const { byCategory, notCategorized } = dashboard.period;
  const rows = [
    ...byCategory.map((row) => ({
      key: row.key,
      label: t(categoryLabel(row.key) ?? row.key),
      count: row.count,
    })),
    ...(notCategorized > 0
      ? [{ key: "none", label: t("Not triaged yet"), count: notCategorized }]
      : []),
  ];

  return (
    <Panel id="categories" title="Tickets by category" note={periodNote(t)}>
      <CountList rows={rows} emptyMessage={t("No tickets in this period.")} />
    </Panel>
  );
}

export async function LocationPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  const { byLocation, otherLocations } = dashboard.period;
  const rows = [
    ...byLocation.map((row) => ({
      key: row.key,
      label: row.key,
      count: row.count,
    })),
    ...(otherLocations > 0
      ? [{ key: "others", label: t("Other places"), count: otherLocations }]
      : []),
  ];

  return (
    <Panel id="locations" title="Reports by location" note={periodNote(t)}>
      <CountList rows={rows} emptyMessage={t("No reports in this period.")} />
    </Panel>
  );
}

function FactRows({ rows }: { rows: { label: string; value: number }[] }) {
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-right tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export async function ProofPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Panel id="proof" title="Completion proof" note={periodNote(t)}>
      <FactRows
        rows={[
          { label: t("Verified"), value: dashboard.proof.accepted },
          { label: t("Rejected"), value: dashboard.proof.rejected },
          {
            label: t("Waiting for a decision"),
            value: dashboard.proof.waiting,
          },
          { label: t("With an exception"), value: dashboard.proof.exceptions },
        ]}
      />
    </Panel>
  );
}

export async function DraftPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Panel
      id="drafts"
      title="AI suggestions"
      note={periodNote(t)}
      className="flex-1"
    >
      <FactRows
        rows={[
          { label: t("Ready"), value: dashboard.drafts.ready },
          { label: t("Still being prepared"), value: dashboard.drafts.pending },
          {
            label: t("Failed, triage by hand"),
            value: dashboard.drafts.failed,
          },
          { label: t("Not needed"), value: dashboard.drafts.notNeeded },
        ]}
      />
    </Panel>
  );
}
