import { DASHBOARD_WINDOW_DAYS, type Dashboard } from "@streetproof/domain";

import { categoryLabel } from "@/features/tickets/labels";
import { formatDuration } from "@/lib/format";
import type { Locale, Translate } from "@/lib/i18n/translate";

import { PHASE_LABELS, STAGE_LABELS } from "./labels";

// Below this many items a share or a change is noise, so the card stays quiet.
const MIN_SAMPLE = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function percent(part: number, whole: number) {
  return Math.round((part / whole) * 100);
}

export function flowInsight(dashboard: Dashboard, t: Translate) {
  const opened = sum(dashboard.daily.map((point) => point.opened));
  const verified = sum(dashboard.daily.map((point) => point.verified));
  if (opened === 0 && verified === 0) return null;
  const params = { opened, verified, days: DASHBOARD_WINDOW_DAYS };
  if (opened > verified) {
    return t(
      "In the last {days} days, {opened} opened and {verified} were verified. New work is outpacing closes.",
      params,
    );
  }
  if (verified > opened) {
    return t(
      "In the last {days} days, {opened} opened and {verified} were verified. Closes are outpacing new work.",
      params,
    );
  }
  return t(
    "In the last {days} days, {opened} opened and {verified} were verified. New work and closes are level.",
    params,
  );
}

// The second half of the window against the first.
export function trendInsight(dashboard: Dashboard, t: Translate) {
  const half = DASHBOARD_WINDOW_DAYS / 2;
  const opened = dashboard.daily.map((point) => point.opened);
  const before = sum(opened.slice(0, -half));
  const recent = sum(opened.slice(-half));
  if (before < 3 || before + recent < MIN_SAMPLE) return null;
  const change = percent(recent - before, before);
  if (Math.abs(change) < 10) {
    return t("New tickets are steady against the {days} days before.", {
      days: half,
    });
  }
  return t(
    change > 0
      ? "New tickets are up {percent}% on the {days} days before."
      : "New tickets are down {percent}% on the {days} days before.",
    { percent: Math.abs(change), days: half },
  );
}

export function stageInsight(dashboard: Dashboard, t: Translate) {
  if (dashboard.open < 4) return null;
  const biggest = dashboard.stages.reduce((top, row) =>
    row.count > top.count ? row : top,
  );
  if (percent(biggest.count, dashboard.open) < 40) return null;
  return t(
    "The biggest stage is {stage}, with {count} of {total} open tickets.",
    {
      stage: t(STAGE_LABELS[biggest.stage].title).toLowerCase(),
      count: biggest.count,
      total: dashboard.open,
    },
  );
}

export function ageInsight(dashboard: Dashboard, t: Translate) {
  if (dashboard.open === 0) return null;
  const overAWeek = dashboard.openWork.filter(
    (ticket) => ticket.ageMs >= 7 * DAY_MS,
  ).length;
  if (overAWeek === 0) return t("Nothing open is older than 7 days.");
  return t("Over 7 days old: {count} of {total} open tickets.", {
    count: overAWeek,
    total: dashboard.open,
  });
}

export function phaseInsight(
  dashboard: Dashboard,
  t: Translate,
  locale: Locale,
) {
  const timed = dashboard.phases.flatMap((row) =>
    row.medianMs === null ? [] : [{ phase: row.phase, medianMs: row.medianMs }],
  );
  const longest = timed.reduce<(typeof timed)[number] | null>(
    (top, row) => (top === null || row.medianMs > top.medianMs ? row : top),
    null,
  );
  if (timed.length < 2 || !longest) return null;
  return t("{phase} takes longest, typically {duration}.", {
    phase: t(PHASE_LABELS[longest.phase]),
    duration: formatDuration(longest.medianMs, locale),
  });
}

export function workloadInsight(dashboard: Dashboard, t: Translate) {
  const [top] = dashboard.workload;
  const assigned = sum(dashboard.workload.map((row) => row.count));
  if (!top || dashboard.workload.length < 2 || assigned < 4) return null;
  if (percent(top.count, assigned) < 50) return null;
  return t("{name} holds {count} of {total} assigned tickets.", {
    name: top.name,
    count: top.count,
    total: assigned,
  });
}

export function categoryInsight(dashboard: Dashboard, t: Translate) {
  const { byCategory, notCategorized } = dashboard.period;
  const [top] = byCategory;
  const total = sum(byCategory.map((row) => row.count)) + notCategorized;
  if (!top || total < MIN_SAMPLE || percent(top.count, total) < 30) return null;
  return t("{category} makes up {percent}% of tickets in this period.", {
    category: t(categoryLabel(top.key) ?? top.key),
    percent: percent(top.count, total),
  });
}

export function locationInsight(dashboard: Dashboard, t: Translate) {
  const [top] = dashboard.period.byLocation;
  const total = dashboard.period.reports;
  if (!top || total < MIN_SAMPLE || percent(top.count, total) < 30) return null;
  return t("{count} of {total} reports came from {place}.", {
    count: top.count,
    total,
    place: top.key,
  });
}

export function proofInsight(dashboard: Dashboard, t: Translate) {
  const { accepted, rejected, waiting } = dashboard.proof;
  const decided = accepted + rejected;
  if (decided >= 4 && percent(rejected, decided) >= 25) {
    return t("{rejected} of {decided} completions were sent back.", {
      rejected,
      decided,
    });
  }
  if (waiting > 0) {
    return t("Waiting for a supervisor decision: {count}.", { count: waiting });
  }
  return null;
}

export function draftInsight(dashboard: Dashboard, t: Translate) {
  const { failed, pending } = dashboard.drafts;
  if (failed > 0) {
    return t("Failed drafts that need manual triage: {count}.", {
      count: failed,
    });
  }
  if (pending > 0)
    return t("Drafts still in progress: {count}.", { count: pending });
  return null;
}
