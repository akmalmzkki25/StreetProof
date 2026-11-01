import type { Role, TicketStatus } from "./ticket-status";

export const DASHBOARD_WINDOW_DAYS = 30;
// A ticket or closure only counts toward a 14-day rate once it has been observed
// for 14 full days. Until then it is pending, never a failure.
export const OBSERVATION_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_OLDEST_ROWS = 5;
const MAX_LOCATION_ROWS = 5;

export type WorkStage =
  "triage" | "assignment" | "repair" | "blocked" | "verification";

export const WORK_STAGES: readonly WorkStage[] = [
  "triage",
  "assignment",
  "repair",
  "blocked",
  "verification",
];

type OpenStatus = Exclude<TicketStatus, "verified_closed" | "cancelled">;

const STAGE_BY_STATUS: Record<OpenStatus, WorkStage> = {
  submitted: "triage",
  needs_clarification: "triage",
  triaged: "assignment",
  reopened: "assignment",
  assigned: "repair",
  accepted: "repair",
  in_progress: "repair",
  rejected_with_reason: "repair",
  waiting_for_parts: "blocked",
  waiting_for_access: "blocked",
  completion_submitted: "verification",
};

function isOpen(status: TicketStatus): status is OpenStatus {
  return status !== "verified_closed" && status !== "cancelled";
}

export const AGE_BUCKETS = [
  { id: "under_1_day", maxDays: 1 },
  { id: "1_to_3_days", maxDays: 3 },
  { id: "3_to_7_days", maxDays: 7 },
  { id: "over_7_days", maxDays: Number.POSITIVE_INFINITY },
] as const;

export type DashboardTicket = {
  id: string;
  status: TicketStatus;
  title: string;
  location: string | null;
  category: string | null;
  assigneeName: string | null;
  isDuplicate: boolean;
  createdAt: Date;
};

export type DashboardEvent = {
  ticketId: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  createdAt: Date;
};

export type DashboardAttempt = {
  ticketId: string;
  hasException: boolean;
  submittedAt: Date;
};

export type DraftOutcome = "ready" | "pending" | "failed" | "not_needed";

// Null means a report has no draft row yet: its job hasn't been picked up.
export function draftOutcome(state: string | null): DraftOutcome {
  switch (state) {
    case "succeeded":
      return "ready";
    case "failed_terminal":
      return "failed";
    case "skipped_manual":
    case "cancelled":
      return "not_needed";
    default:
      return "pending";
  }
}

export type Duration = {
  count: number;
  medianMs: number | null;
  minMs: number | null;
  maxMs: number | null;
};

function summarize(durations: readonly number[]): Duration {
  const sorted = [...durations].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1
      ? (sorted[middle] ?? null)
      : sorted.length === 0
        ? null
        : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  return {
    count: sorted.length,
    medianMs: median,
    minMs: sorted[0] ?? null,
    maxMs: sorted.at(-1) ?? null,
  };
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

// The calendar day in WIB, the timezone every date in the app is shown in.
function wibDay(date: Date) {
  return new Date(date.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

function countBy<T>(items: readonly T[], keyOf: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.key.localeCompare(right.key),
    );
}

export function canViewDashboard(roles: readonly Role[]) {
  return roles.some((role) => role !== "technician");
}

// Everything comes from tickets and their events, the same records the queue and
// the ticket history read. A linked duplicate is a report, not a second piece of
// work, so it counts once in reports and never in work figures.
export function computeDashboard(input: {
  tickets: readonly DashboardTicket[];
  events: readonly DashboardEvent[];
  attempts: readonly DashboardAttempt[];
  drafts: readonly DraftOutcome[];
  now: Date;
}) {
  const { tickets, events, attempts, drafts, now } = input;
  const nowMs = now.getTime();
  const windowStart = nowMs - DASHBOARD_WINDOW_DAYS * DAY_MS;
  const observed = OBSERVATION_DAYS * DAY_MS;

  const eventsOf = new Map<string, DashboardEvent[]>();
  for (const event of events) {
    eventsOf.set(event.ticketId, [
      ...(eventsOf.get(event.ticketId) ?? []),
      event,
    ]);
  }
  const eventsFor = (ticketId: string) =>
    [...(eventsOf.get(ticketId) ?? [])].sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
    );

  const inWindow = (date: Date) => date.getTime() >= windowStart;
  const work = tickets.filter((ticket) => !ticket.isDuplicate);
  const ageOf = (ticket: DashboardTicket) => nowMs - ticket.createdAt.getTime();

  const open = work
    .flatMap((ticket) =>
      isOpen(ticket.status)
        ? [
            {
              ...ticket,
              stage: STAGE_BY_STATUS[ticket.status],
              ageMs: ageOf(ticket),
            },
          ]
        : [],
    )
    .sort((left, right) => right.ageMs - left.ageMs);

  const stages = WORK_STAGES.map(function stageRow(stage) {
    const inStage = open.filter((ticket) => ticket.stage === stage);
    return {
      stage,
      count: inStage.length,
      oldestAgeMs: inStage[0]?.ageMs ?? null,
    };
  });

  const ageBuckets = AGE_BUCKETS.map(function bucketRow(bucket, index) {
    const lower = index === 0 ? 0 : (AGE_BUCKETS[index - 1]?.maxDays ?? 0);
    return {
      bucket: bucket.id,
      count: open.filter(
        (ticket) =>
          ticket.ageMs >= lower * DAY_MS &&
          ticket.ageMs < bucket.maxDays * DAY_MS,
      ).length,
    };
  });

  const workload = [
    ...new Set(open.flatMap((ticket) => ticket.assigneeName ?? [])),
  ]
    .map(function personRow(name) {
      const held = open.filter((ticket) => ticket.assigneeName === name);
      return {
        name,
        count: held.length,
        oldestAgeMs: held[0]?.ageMs ?? 0,
      };
    })
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name),
    );

  const reports = tickets.filter((ticket) => inWindow(ticket.createdAt));
  const cohort = work.filter((ticket) => inWindow(ticket.createdAt));
  const validCohort = cohort.filter((ticket) => ticket.status !== "cancelled");

  const locationCounts = countBy(
    reports,
    (ticket) => ticket.location ?? "Location not set",
  );

  const triageTimes = cohort.flatMap(function triageTime(ticket) {
    const triaged = eventsFor(ticket.id).find(
      (event) => event.toStatus === "triaged",
    );
    return triaged
      ? [triaged.createdAt.getTime() - ticket.createdAt.getTime()]
      : [];
  });

  const closures = work.flatMap(function closureOf(ticket) {
    return eventsFor(ticket.id)
      .filter((event) => event.toStatus === "verified_closed")
      .map((event) => ({ ticket, closedAt: event.createdAt.getTime() }));
  });
  const closedNow = work.flatMap(function latestClosure(ticket) {
    if (ticket.status !== "verified_closed") return [];
    const closedAt = eventsFor(ticket.id)
      .filter((event) => event.toStatus === "verified_closed")
      .at(-1)?.createdAt;
    return closedAt && inWindow(closedAt)
      ? [closedAt.getTime() - ticket.createdAt.getTime()]
      : [];
  });

  const matured = validCohort.filter((ticket) => ageOf(ticket) >= observed);
  const verifiedInTime = matured.filter((ticket) =>
    closures.some(
      (closure) =>
        closure.ticket.id === ticket.id &&
        closure.closedAt - ticket.createdAt.getTime() <= observed,
    ),
  );

  const closuresInWindow = closures.filter(
    (closure) => closure.closedAt >= windowStart,
  );
  const maturedClosures = closuresInWindow.filter(
    (closure) => nowMs - closure.closedAt >= observed,
  );
  const reopenedInTime = maturedClosures.filter((closure) =>
    eventsFor(closure.ticket.id).some(
      (event) =>
        event.toStatus === "reopened" &&
        event.createdAt.getTime() >= closure.closedAt &&
        event.createdAt.getTime() - closure.closedAt <= observed,
    ),
  );

  const decisions = work.flatMap((ticket) =>
    eventsFor(ticket.id).filter(
      (event) =>
        event.fromStatus === "completion_submitted" &&
        inWindow(event.createdAt),
    ),
  );

  return {
    open: open.length,
    stages,
    ageBuckets,
    oldest: open.slice(0, MAX_OLDEST_ROWS),
    workload,
    period: {
      reports: reports.length,
      duplicates: reports.filter((ticket) => ticket.isDuplicate).length,
      cancelled: cohort.length - validCohort.length,
      byCategory: countBy(
        validCohort.filter((ticket) => ticket.category !== null),
        (ticket) => ticket.category ?? "",
      ),
      notCategorized: validCohort.filter((ticket) => ticket.category === null)
        .length,
      byLocation: locationCounts.slice(0, MAX_LOCATION_ROWS),
      otherLocations: locationCounts
        .slice(MAX_LOCATION_ROWS)
        .reduce((total, row) => total + row.count, 0),
    },
    timeToTriage: {
      ...summarize(triageTimes),
      untriaged: validCohort.filter(
        (ticket) =>
          !eventsFor(ticket.id).some((event) => event.toStatus === "triaged"),
      ).length,
    },
    timeToClose: { ...summarize(closedNow), stillOpen: open.length },
    verifiedResolution: {
      numerator: verifiedInTime.length,
      denominator: matured.length,
      pending: validCohort.length - matured.length,
    },
    reopenRate: {
      numerator: reopenedInTime.length,
      denominator: maturedClosures.length,
      pending: closuresInWindow.length - maturedClosures.length,
    },
    proof: {
      accepted: decisions.filter(
        (event) => event.toStatus === "verified_closed",
      ).length,
      rejected: decisions.filter(
        (event) => event.toStatus === "rejected_with_reason",
      ).length,
      waiting: open.filter((ticket) => ticket.stage === "verification").length,
      exceptions: attempts.filter(
        (attempt) => attempt.hasException && inWindow(attempt.submittedAt),
      ).length,
    },
    daily: dailySeries(work, events, nowMs, inWindow),
    drafts: {
      ready: drafts.filter((draft) => draft === "ready").length,
      pending: drafts.filter((draft) => draft === "pending").length,
      failed: drafts.filter((draft) => draft === "failed").length,
      notNeeded: drafts.filter((draft) => draft === "not_needed").length,
    },
  };
}

// New work and verified closes for each day of the window, today last. Days
// with nothing stay in as zeros so the chart's axis is even.
function dailySeries(
  work: readonly DashboardTicket[],
  events: readonly DashboardEvent[],
  nowMs: number,
  inWindow: (date: Date) => boolean,
) {
  const opened = new Map(
    countBy(
      work.filter((ticket) => inWindow(ticket.createdAt)),
      (ticket) => wibDay(ticket.createdAt),
    ).map((row) => [row.key, row.count]),
  );
  const verified = new Map(
    countBy(
      events.filter(
        (event) =>
          event.toStatus === "verified_closed" && inWindow(event.createdAt),
      ),
      (event) => wibDay(event.createdAt),
    ).map((row) => [row.key, row.count]),
  );
  return Array.from({ length: DASHBOARD_WINDOW_DAYS }, (_, index) => {
    const daysBack = DASHBOARD_WINDOW_DAYS - 1 - index;
    const day = wibDay(new Date(nowMs - daysBack * DAY_MS));
    return {
      day,
      opened: opened.get(day) ?? 0,
      verified: verified.get(day) ?? 0,
    };
  });
}

export type Dashboard = ReturnType<typeof computeDashboard>;
