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

import { AGE_LABELS, STAGE_LABELS } from "../labels";

const PERIOD = `Last ${DASHBOARD_WINDOW_DAYS} days`;

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

export function StagePanel({ dashboard }: { dashboard: Dashboard }) {
  const max = Math.max(...dashboard.stages.map((row) => row.count));

  return (
    <Panel id="stages" title="Where open work sits" className="lg:col-span-2">
      <p className="flex items-baseline gap-2">
        <span className="type-headline tabular-nums">{dashboard.open}</span>
        <span className="text-muted-foreground">
          {dashboard.open === 1 ? "open ticket" : "open tickets"}
        </span>
      </p>
      <ul className="flex flex-1 flex-col justify-between gap-3">
        {dashboard.stages.map((row) => (
          <li key={row.stage} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className="min-w-0">
                {STAGE_LABELS[row.stage].title}
                <span className="type-caption text-muted-foreground">
                  {" "}
                  · {STAGE_LABELS[row.stage].owner}
                  {row.oldestAgeMs === null
                    ? ""
                    : ` · oldest ${formatDuration(row.oldestAgeMs)}`}
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

export function AgePanel({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Panel id="age" title="Age of open work" note="Since the report">
      <CountList
        rows={dashboard.ageBuckets.map((row) => ({
          key: row.bucket,
          label: AGE_LABELS[row.bucket],
          count: row.count,
        }))}
        emptyMessage="No open tickets."
      />
    </Panel>
  );
}

export function OldestPanel({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Panel id="oldest" title="Oldest open tickets" className="lg:col-span-2">
      {dashboard.oldest.length === 0 ? (
        <p className="type-caption text-muted-foreground">No open tickets.</p>
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
                      STAGE_LABELS[ticket.stage].title,
                      ticket.assigneeName,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatDuration(ticket.ageMs)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

export function WorkloadPanel({ dashboard }: { dashboard: Dashboard }) {
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
        emptyMessage="No technician holds open work."
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

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function rangeOf(duration: { minMs: number | null; maxMs: number | null }) {
  if (duration.minMs === null || duration.maxMs === null) return "";
  return `, range ${formatDuration(duration.minMs)} to ${formatDuration(duration.maxMs)}`;
}

// A rate with a full window is shown as "x of y", never a bare percentage, and
// what is still inside the window stays pending rather than joining either side.
function rateDetail(
  rate: { denominator: number; pending: number },
  noun: string,
) {
  const counted =
    rate.denominator === 0
      ? `No ${noun} has had ${OBSERVATION_DAYS} full days yet.`
      : `${plural(rate.denominator, noun)} observed for ${OBSERVATION_DAYS} full days.`;
  return `${counted} ${rate.pending} still within ${OBSERVATION_DAYS} days.`;
}

export function OutcomeStrip({ dashboard }: { dashboard: Dashboard }) {
  const { timeToTriage, timeToClose, verifiedResolution, reopenRate } =
    dashboard;

  return (
    <section
      aria-label={`Outcomes, ${PERIOD.toLowerCase()}`}
      className="grid gap-px overflow-hidden rounded-4xl bg-border shadow-card sm:grid-cols-2 lg:grid-cols-4"
    >
      <Outcome
        label="Time to triage"
        value={
          timeToTriage.medianMs === null
            ? null
            : formatDuration(timeToTriage.medianMs)
        }
        detail={
          timeToTriage.count === 0
            ? `Nothing triaged yet. ${timeToTriage.untriaged} waiting.`
            : `Median of ${timeToTriage.count}${rangeOf(timeToTriage)}. ${timeToTriage.untriaged} not triaged.`
        }
      />
      <Outcome
        label="Time to verified close"
        value={
          timeToClose.medianMs === null
            ? null
            : formatDuration(timeToClose.medianMs)
        }
        detail={
          timeToClose.count === 0
            ? `Nothing closed yet. ${timeToClose.stillOpen} open.`
            : `Median of ${timeToClose.count}${rangeOf(timeToClose)}. ${timeToClose.stillOpen} still open.`
        }
      />
      <Outcome
        label={`Verified within ${OBSERVATION_DAYS} days`}
        value={
          verifiedResolution.denominator === 0
            ? null
            : `${verifiedResolution.numerator} of ${verifiedResolution.denominator}`
        }
        detail={rateDetail(verifiedResolution, "ticket")}
      />
      <Outcome
        label={`Reopened within ${OBSERVATION_DAYS} days`}
        value={
          reopenRate.denominator === 0
            ? null
            : `${reopenRate.numerator} of ${reopenRate.denominator}`
        }
        detail={rateDetail(reopenRate, "closure")}
      />
    </section>
  );
}

export function CategoryPanel({ dashboard }: { dashboard: Dashboard }) {
  const { byCategory, notCategorized } = dashboard.period;
  const rows = [
    ...byCategory.map((row) => ({
      key: row.key,
      label: categoryLabel(row.key) ?? row.key,
      count: row.count,
    })),
    ...(notCategorized > 0
      ? [{ key: "none", label: "Not triaged yet", count: notCategorized }]
      : []),
  ];

  return (
    <Panel id="categories" title="Tickets by category" note={PERIOD}>
      <CountList rows={rows} emptyMessage="No tickets in this period." />
    </Panel>
  );
}

export function LocationPanel({ dashboard }: { dashboard: Dashboard }) {
  const { byLocation, otherLocations } = dashboard.period;
  const rows = [
    ...byLocation.map((row) => ({
      key: row.key,
      label: row.key,
      count: row.count,
    })),
    ...(otherLocations > 0
      ? [{ key: "others", label: "Other places", count: otherLocations }]
      : []),
  ];

  return (
    <Panel id="locations" title="Reports by location" note={PERIOD}>
      <CountList rows={rows} emptyMessage="No reports in this period." />
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

export function ProofPanel({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Panel id="proof" title="Completion proof" note={PERIOD}>
      <FactRows
        rows={[
          { label: "Verified", value: dashboard.proof.accepted },
          { label: "Rejected", value: dashboard.proof.rejected },
          { label: "Waiting for a decision", value: dashboard.proof.waiting },
          { label: "With an exception", value: dashboard.proof.exceptions },
        ]}
      />
    </Panel>
  );
}

export function DraftPanel({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Panel id="drafts" title="AI suggestions" note={PERIOD} className="flex-1">
      <FactRows
        rows={[
          { label: "Ready", value: dashboard.drafts.ready },
          { label: "Still being prepared", value: dashboard.drafts.pending },
          { label: "Failed, triage by hand", value: dashboard.drafts.failed },
          { label: "Not needed", value: dashboard.drafts.notNeeded },
        ]}
      />
    </Panel>
  );
}
