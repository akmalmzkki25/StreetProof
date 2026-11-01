import {
  DASHBOARD_WINDOW_DAYS,
  OBSERVATION_DAYS,
  WORK_STAGES,
  type Dashboard,
} from "@streetproof/domain";
import { cn } from "@streetproof/ui/lib/utils";
import { Link } from "@/components/locale-link";

import { categoryLabel } from "@/features/tickets/labels";
import { formatDuration } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import type { Locale, Translate } from "@/lib/i18n/translate";

import { AGE_LABELS, STAGE_LABELS } from "../labels";
import { Sparkline, TrendChart } from "./trend-chart";

// One color per stage, in the order work flows, shared by the strip's bar and its key.
const STAGE_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-5",
  "bg-chart-4",
] as const;

// A dashboard card: a header row with the title, then the body.
async function Card({
  id,
  title,
  note,
  className,
  bodyClassName,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const { t } = await getI18n();
  return (
    <section
      aria-labelledby={id}
      className={cn("flex min-w-0 flex-col rounded-4xl bg-card shadow-card", className)}
    >
      <div className="flex items-baseline justify-between gap-4 border-b px-4 py-3">
        <h2 id={id} className="text-[13px] font-medium">
          {t(title)}
        </h2>
        {note ? <p className="text-xs text-muted-foreground">{t(note)}</p> : null}
      </div>
      <div className={cn("flex flex-1 flex-col gap-4 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

// The bar is the true share of the largest row. A zero draws nothing.
function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-1.5 rounded-full bg-muted-foreground/15" aria-hidden="true">
      {value > 0 ? (
        <div
          className="h-full rounded-full bg-chart-2"
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
        <li
          key={row.key}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-4 text-[13px]"
        >
          <span className="truncate">{row.label}</span>
          <Bar value={row.count} max={max} />
          <span className="w-8 text-right tabular-nums">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

function FactRows({ rows }: { rows: { label: string; value: number }[] }) {
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[13px]">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-right tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function periodNote(t: Translate) {
  return t("Last {days} days", { days: DASHBOARD_WINDOW_DAYS });
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

function Metric({
  label,
  value,
  detail,
  series,
  seriesColor,
}: {
  label: string;
  value: string | null;
  detail: string;
  series?: number[];
  seriesColor?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-4xl bg-card shadow-card">
      <div className="flex flex-1 flex-col gap-1 px-4 pt-3 pb-3">
        <h3 className="text-xs text-muted-foreground">{label}</h3>
        <div className="flex items-baseline justify-start gap-2">
          <p
            className={cn(
              "text-2xl font-medium tracking-tight tabular-nums",
              !value && "text-muted-foreground",
            )}
          >
            {value ?? "?"}
          </p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      {series ? <Sparkline values={series} color={seriesColor ?? "var(--chart-2)"} /> : null}
    </div>
  );
}

export async function MetricTiles({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const { timeToTriage, timeToClose, verifiedResolution, reopenRate, daily } = dashboard;
  const opened = daily.map((point) => point.opened);
  const verified = daily.map((point) => point.verified);
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  const ofTotal = (numerator: number, denominator: number) =>
    t("{numerator} of {denominator}", { numerator, denominator });
  const oldest = dashboard.oldest[0];

  return (
    <section
      aria-label={t("Outcomes, last {days} days", {
        days: DASHBOARD_WINDOW_DAYS,
      })}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7"
    >
      <Metric
        label={t("Open tickets")}
        value={String(dashboard.open)}
        detail={
          oldest
            ? t("oldest {age}", { age: formatDuration(oldest.ageMs, locale) })
            : t("No open tickets.")
        }
      />
      <Metric
        label={t("New tickets")}
        value={String(sum(opened))}
        detail={periodNote(t)}
        series={opened}
        seriesColor="var(--chart-2)"
      />
      <Metric
        label={t("Verified closes")}
        value={String(sum(verified))}
        detail={periodNote(t)}
        series={verified}
        seriesColor="var(--chart-1)"
      />
      <Metric
        label={t("Time to triage")}
        value={
          timeToTriage.medianMs === null ? null : formatDuration(timeToTriage.medianMs, locale)
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
      <Metric
        label={t("Time to verified close")}
        value={timeToClose.medianMs === null ? null : formatDuration(timeToClose.medianMs, locale)}
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
      <Metric
        label={t("Verified within {days} days", { days: OBSERVATION_DAYS })}
        value={
          verifiedResolution.denominator === 0
            ? null
            : ofTotal(verifiedResolution.numerator, verifiedResolution.denominator)
        }
        detail={rateDetail(verifiedResolution, "ticket", t)}
      />
      <Metric
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

// Open work by stage: one bar split by share, then a column per stage.
export async function StageStrip({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const total = Math.max(dashboard.open, 1);
  const stageOf = (stage: (typeof WORK_STAGES)[number]) =>
    dashboard.stages.find((row) => row.stage === stage);

  return (
    <Card
      id="stages"
      title="Where open work sits"
      note={
        dashboard.open === 1
          ? t("1 open ticket")
          : t("{count} open tickets", { count: dashboard.open })
      }
    >
      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted-foreground/15"
        aria-hidden="true"
      >
        {WORK_STAGES.map((stage, index) => {
          const count = stageOf(stage)?.count ?? 0;
          return count > 0 ? (
            <div
              key={stage}
              className={STAGE_COLORS[index]}
              style={{ width: `${(count / total) * 100}%` }}
            />
          ) : null;
        })}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 xl:grid-cols-5">
        {WORK_STAGES.map((stage, index) => {
          const row = stageOf(stage);
          return (
            <div key={stage} className="flex min-w-0 flex-col gap-1">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn("size-2 shrink-0 rounded-[2px]", STAGE_COLORS[index])}
                  aria-hidden="true"
                />
                <span className="truncate">
                  {t(STAGE_LABELS[stage].title)} · {t(STAGE_LABELS[stage].owner)}
                </span>
              </dt>
              <dd className="flex items-baseline gap-2">
                <span className="text-xl font-medium tabular-nums">{row?.count ?? 0}</span>
                {row?.oldestAgeMs == null ? null : (
                  <span className="text-xs text-muted-foreground">
                    {t("oldest {age}", {
                      age: formatDuration(row.oldestAgeMs, locale),
                    })}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}

export async function TrendPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const opened = dashboard.daily.reduce((sum, point) => sum + point.opened, 0);
  const verified = dashboard.daily.reduce((sum, point) => sum + point.verified, 0);
  return (
    <Card
      id="trend"
      title="New work and verified closes"
      note={periodNote(t)}
      className="xl:col-span-2"
    >
      <ul className="flex flex-wrap gap-4 text-xs">
        <li className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground" aria-hidden="true" />
          {t("New tickets")}
          <span className="font-medium tabular-nums">{opened}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-chart-1" aria-hidden="true" />
          {t("Verified closes")}
          <span className="font-medium tabular-nums">{verified}</span>
        </li>
      </ul>
      <TrendChart
        points={dashboard.daily}
        locale={locale}
        openedLabel={t("New tickets")}
        verifiedLabel={t("Verified closes")}
      />
    </Card>
  );
}

export async function OldestPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  return (
    <Card id="oldest" title="Oldest open tickets" bodyClassName="p-2">
      {dashboard.oldest.length === 0 ? (
        <p className="type-caption p-2 text-muted-foreground">{t("No open tickets.")}</p>
      ) : (
        <ol className="flex flex-col">
          {dashboard.oldest.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/app/tickets/${ticket.id}`}
                className="flex items-baseline justify-between gap-4 rounded-2xl px-2 py-2 text-[13px] transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{ticket.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {[ticket.location, t(STAGE_LABELS[ticket.stage].title), ticket.assigneeName]
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
    </Card>
  );
}

export async function AgePanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Card id="age" title="Age of open work" note="Since the report">
      <CountList
        rows={dashboard.ageBuckets.map((row) => ({
          key: row.bucket,
          label: t(AGE_LABELS[row.bucket]),
          count: row.count,
        }))}
        emptyMessage={t("No open tickets.")}
      />
    </Card>
  );
}

export async function WorkloadPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Card id="workload" title="Technician workload" note="Open tickets">
      <CountList
        rows={dashboard.workload.map((row) => ({
          key: row.name,
          label: row.name,
          count: row.count,
        }))}
        emptyMessage={t("No technician holds open work.")}
      />
    </Card>
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
    <Card id="categories" title="Tickets by category" note={periodNote(t)}>
      <CountList rows={rows} emptyMessage={t("No tickets in this period.")} />
    </Card>
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
    <Card id="locations" title="Reports by location" note={periodNote(t)}>
      <CountList rows={rows} emptyMessage={t("No reports in this period.")} />
    </Card>
  );
}

export async function ProofPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Card id="proof" title="Completion proof" note={periodNote(t)}>
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
    </Card>
  );
}

export async function DraftPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Card id="drafts" title="AI suggestions" note={periodNote(t)}>
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
    </Card>
  );
}
