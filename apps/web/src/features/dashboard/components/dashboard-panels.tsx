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
import type { Translate } from "@/lib/i18n/translate";

import {
  ageInsight,
  categoryInsight,
  draftInsight,
  flowInsight,
  locationInsight,
  phaseInsight,
  proofInsight,
  stageInsight,
  trendInsight,
  workloadInsight,
} from "../insights";
import { PHASE_LABELS, STAGE_COLORS, STAGE_LABELS } from "../labels";
import { AgeDots } from "./age-dots";
import { SegmentedBar } from "./segmented-bar";
import { Sparkline, TrendChart } from "./trend-chart";

// A dashboard card: a header row with the title, an optional one-line insight,
// then the body.
async function Card({
  id,
  title,
  note,
  insight,
  className,
  bodyClassName,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  insight?: string | null;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const { t } = await getI18n();
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex min-w-0 flex-col rounded-4xl bg-card shadow-card",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-4 border-b px-4 py-3">
        <h2 id={id} className="text-[13px] font-medium">
          {t(title)}
        </h2>
        {note ? (
          <p className="text-xs text-muted-foreground">{t(note)}</p>
        ) : null}
      </div>
      <div className={cn("flex flex-1 flex-col gap-4 p-4", bodyClassName)}>
        {insight ? <p className="text-[13px]">{insight}</p> : null}
        {children}
      </div>
    </section>
  );
}

// The bar is the true share of the largest row. A zero draws nothing.
function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div
      className="h-1.5 rounded-full bg-muted-foreground/15"
      aria-hidden="true"
    >
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
  rows: { key: string; label: string; count: number; detail?: string }[];
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
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{row.label}</span>
            {row.detail ? (
              <span className="truncate text-xs text-muted-foreground">
                {row.detail}
              </span>
            ) : null}
          </span>
          <Bar value={row.count} max={max} />
          <span className="w-8 text-right tabular-nums">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

// A split bar, then one row per part with its swatch.
function SplitRows({
  rows,
}: {
  rows: { label: string; value: number; color: string }[];
}) {
  return (
    <>
      <SegmentedBar
        segments={rows.map((row) => ({
          value: row.value,
          className: row.color,
        }))}
      />
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[13px]">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span
                className={cn("size-2 shrink-0 rounded-[2px]", row.color)}
                aria-hidden="true"
              />
              {row.label}
            </dt>
            <dd className="text-right tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function periodNote(t: Translate) {
  return t("Last {days} days", { days: DASHBOARD_WINDOW_DAYS });
}

function sentences(...parts: (string | null)[]) {
  return parts.filter(Boolean).join(" ");
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
      {series ? (
        <Sparkline values={series} color={seriesColor ?? "var(--chart-2)"} />
      ) : null}
    </div>
  );
}

export async function MetricTiles({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const { timeToTriage, timeToClose, verifiedResolution, reopenRate, daily } =
    dashboard;
  const opened = daily.map((point) => point.opened);
  const verified = daily.map((point) => point.verified);
  const sum = (values: number[]) =>
    values.reduce((total, value) => total + value, 0);
  const oldest = dashboard.oldest[0];
  const slowest = (maxMs: number | null) =>
    maxMs === null ? "" : formatDuration(maxMs, locale);

  return (
    <section
      aria-label={t("Outcomes, last {days} days", {
        days: DASHBOARD_WINDOW_DAYS,
      })}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
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
        label={t("Typical time to triage")}
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
            : t("{count} triaged, slowest {slowest}. {waiting} waiting.", {
                count: timeToTriage.count,
                slowest: slowest(timeToTriage.maxMs),
                waiting: timeToTriage.untriaged,
              })
        }
      />
      <Metric
        label={t("Typical time to verified close")}
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
            : t("{count} closed, slowest {slowest}. {open} still open.", {
                count: timeToClose.count,
                slowest: slowest(timeToClose.maxMs),
                open: timeToClose.stillOpen,
              })
        }
      />
      <Metric
        label={t("Verified within {days} days", { days: OBSERVATION_DAYS })}
        value={
          verifiedResolution.denominator === 0
            ? null
            : t("{numerator} of {denominator}", {
                numerator: verifiedResolution.numerator,
                denominator: verifiedResolution.denominator,
              })
        }
        detail={sentences(
          verifiedResolution.denominator === 0
            ? t("No ticket has had {days} full days yet.", {
                days: OBSERVATION_DAYS,
              })
            : null,
          verifiedResolution.pending > 0
            ? t("{count} still within {days} days.", {
                count: verifiedResolution.pending,
                days: OBSERVATION_DAYS,
              })
            : null,
          reopenRate.denominator > 0
            ? t("{reopened} of {closures} closures reopened.", {
                reopened: reopenRate.numerator,
                closures: reopenRate.denominator,
              })
            : null,
        )}
      />
    </section>
  );
}

// Open work by stage: one bar split by share, then a column per stage.
export async function StageStrip({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const stageOf = (stage: (typeof WORK_STAGES)[number]) =>
    dashboard.stages.find((row) => row.stage === stage);

  return (
    <Card
      id="stages"
      title="Open work by stage"
      note={
        dashboard.open === 1
          ? t("1 open ticket")
          : t("{count} open tickets", { count: dashboard.open })
      }
      insight={stageInsight(dashboard, t)}
    >
      <SegmentedBar
        segments={WORK_STAGES.map((stage) => ({
          value: stageOf(stage)?.count ?? 0,
          className: STAGE_COLORS[stage],
        }))}
      />
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 xl:grid-cols-5">
        {WORK_STAGES.map((stage) => {
          const row = stageOf(stage);
          return (
            <div key={stage} className="flex min-w-0 flex-col gap-1">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-[2px]",
                    STAGE_COLORS[stage],
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{t(STAGE_LABELS[stage].title)}</span>
              </dt>
              <dd className="flex flex-col">
                <span className="flex items-baseline gap-2">
                  <span className="text-xl font-medium tabular-nums">
                    {row?.count ?? 0}
                  </span>
                  {row?.oldestAgeMs == null ? null : (
                    <span className="text-xs text-muted-foreground">
                      {t("oldest {age}", {
                        age: formatDuration(row.oldestAgeMs, locale),
                      })}
                    </span>
                  )}
                </span>
                <span className="text-xs text-faint-foreground">
                  {t(STAGE_LABELS[stage].owner)}
                </span>
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
  const verified = dashboard.daily.reduce(
    (sum, point) => sum + point.verified,
    0,
  );
  return (
    <Card
      id="trend"
      title="New work and verified closes"
      note={periodNote(t)}
      insight={
        sentences(flowInsight(dashboard, t), trendInsight(dashboard, t)) || null
      }
      className="xl:col-span-2"
    >
      <ul className="flex flex-wrap gap-4 text-xs">
        <li className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full bg-muted-foreground"
            aria-hidden="true"
          />
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
        <p className="type-caption p-2 text-muted-foreground">
          {t("No open tickets.")}
        </p>
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
                    {ticket.location ?? t("Location not set")}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="tabular-nums">
                    {formatDuration(ticket.ageMs, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(STAGE_LABELS[ticket.stage].title)}
                  </span>
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
  const stagesPresent = WORK_STAGES.filter((stage) =>
    dashboard.openWork.some((ticket) => ticket.stage === stage),
  );
  return (
    <Card
      id="age"
      title="How long open work has waited"
      note="Since the report"
      insight={ageInsight(dashboard, t)}
    >
      {dashboard.open === 0 ? (
        <p className="type-caption text-muted-foreground">
          {t("No open tickets.")}
        </p>
      ) : (
        <>
          <AgeDots
            tickets={dashboard.openWork}
            label={t("Open tickets by days waited")}
            axis={{
              start: t("Today"),
              week: t("7 days"),
              end: t("14 days or more"),
            }}
          />
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {stagesPresent.map((stage) => (
              <li key={stage} className="flex items-center gap-1.5">
                <span
                  className={cn("size-2 rounded-full", STAGE_COLORS[stage])}
                  aria-hidden="true"
                />
                {t(STAGE_LABELS[stage].title)}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

// Where a closed ticket's time went: the median of each phase, side by side.
export async function PhasePanel({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  const colors = {
    triage: STAGE_COLORS.triage,
    assignment: STAGE_COLORS.assignment,
    repair: STAGE_COLORS.repair,
    verification: STAGE_COLORS.verification,
  };
  const hasData = dashboard.phases.some((row) => row.medianMs !== null);
  return (
    <Card
      id="phases"
      title="Where the time goes"
      note={t("Closed in the last {days} days", {
        days: DASHBOARD_WINDOW_DAYS,
      })}
      insight={phaseInsight(dashboard, t, locale)}
    >
      {hasData ? (
        <>
          <SegmentedBar
            className="h-3"
            segments={dashboard.phases.map((row) => ({
              value: row.medianMs ?? 0,
              className: colors[row.phase],
            }))}
          />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {dashboard.phases.map((row) => (
              <div key={row.phase} className="flex min-w-0 flex-col gap-1">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-[2px]",
                      colors[row.phase],
                    )}
                    aria-hidden="true"
                  />
                  {t(PHASE_LABELS[row.phase])}
                </dt>
                <dd
                  className={cn(
                    "text-xl font-medium tabular-nums",
                    row.medianMs === null && "text-muted-foreground",
                  )}
                >
                  {row.medianMs === null
                    ? "?"
                    : formatDuration(row.medianMs, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="type-caption text-muted-foreground">
          {t("Nothing has closed in this period yet.")}
        </p>
      )}
    </Card>
  );
}

export async function WorkloadPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t, locale } = await getI18n();
  return (
    <Card
      id="workload"
      title="Technician workload"
      note="Open tickets"
      insight={workloadInsight(dashboard, t)}
    >
      <CountList
        rows={dashboard.workload.map((row) => ({
          key: row.name,
          label: row.name,
          count: row.count,
          detail: t("oldest {age}", {
            age: formatDuration(row.oldestAgeMs, locale),
          }),
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
    <Card
      id="categories"
      title="Tickets by category"
      note={periodNote(t)}
      insight={categoryInsight(dashboard, t)}
    >
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
    <Card
      id="locations"
      title="Reports by location"
      note={periodNote(t)}
      insight={locationInsight(dashboard, t)}
    >
      <CountList rows={rows} emptyMessage={t("No reports in this period.")} />
    </Card>
  );
}

export async function ProofPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Card
      id="proof"
      title="Completion checks"
      note={periodNote(t)}
      insight={proofInsight(dashboard, t)}
    >
      <SplitRows
        rows={[
          {
            label: t("Verified"),
            value: dashboard.proof.accepted,
            color: "bg-chart-4",
          },
          {
            label: t("Rejected"),
            value: dashboard.proof.rejected,
            color: "bg-destructive",
          },
          {
            label: t("Waiting for a decision"),
            value: dashboard.proof.waiting,
            color: "bg-chart-3",
          },
          {
            label: t("Submitted with an exception"),
            value: dashboard.proof.exceptions,
            color: "bg-chart-2",
          },
        ]}
      />
    </Card>
  );
}

export async function DraftPanel({ dashboard }: { dashboard: Dashboard }) {
  const { t } = await getI18n();
  return (
    <Card
      id="drafts"
      title="AI drafts"
      note={periodNote(t)}
      insight={draftInsight(dashboard, t)}
    >
      <SplitRows
        rows={[
          {
            label: t("Ready"),
            value: dashboard.drafts.ready,
            color: "bg-chart-4",
          },
          {
            label: t("In progress"),
            value: dashboard.drafts.pending,
            color: "bg-chart-3",
          },
          {
            label: t("Failed, needs manual triage"),
            value: dashboard.drafts.failed,
            color: "bg-destructive",
          },
          {
            label: t("Not needed"),
            value: dashboard.drafts.notNeeded,
            color: "bg-muted-foreground/40",
          },
        ]}
      />
    </Card>
  );
}
