import { describe, expect, it } from "vitest";

import {
  canViewDashboard,
  computeDashboard,
  draftOutcome,
  type DashboardEvent,
  type DashboardTicket,
} from "./dashboard";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date("2026-10-30T12:00:00Z");

function daysAgo(days: number) {
  return new Date(now.getTime() - days * DAY);
}

function ticket(
  id: string,
  overrides: Partial<DashboardTicket> = {},
): DashboardTicket {
  return {
    id,
    status: "submitted",
    title: `Ticket ${id}`,
    location: "Lobby",
    category: null,
    assigneeName: null,
    isDuplicate: false,
    createdAt: daysAgo(1),
    ...overrides,
  };
}

function event(
  ticketId: string,
  toStatus: DashboardEvent["toStatus"],
  createdAt: Date,
  fromStatus: DashboardEvent["fromStatus"] = null,
): DashboardEvent {
  return { ticketId, toStatus, fromStatus, createdAt };
}

function compute(
  tickets: DashboardTicket[],
  events: DashboardEvent[] = [],
  drafts: Parameters<typeof computeDashboard>[0]["drafts"] = [],
  attempts: Parameters<typeof computeDashboard>[0]["attempts"] = [],
) {
  return computeDashboard({ tickets, events, attempts, drafts, now });
}

describe("backlog", () => {
  it("sorts open work into stages and leaves closed work out", () => {
    const result = compute([
      ticket("a", { status: "submitted", createdAt: daysAgo(5) }),
      ticket("b", { status: "needs_clarification", createdAt: daysAgo(2) }),
      ticket("c", { status: "waiting_for_parts", assigneeName: "Budi" }),
      ticket("d", { status: "verified_closed" }),
      ticket("e", { status: "cancelled" }),
    ]);

    expect(result.open).toBe(3);
    expect(result.stages).toEqual([
      { stage: "triage", count: 2, oldestAgeMs: 5 * DAY },
      { stage: "assignment", count: 0, oldestAgeMs: null },
      { stage: "repair", count: 0, oldestAgeMs: null },
      { stage: "blocked", count: 1, oldestAgeMs: DAY },
      { stage: "verification", count: 0, oldestAgeMs: null },
    ]);
  });

  it("counts a linked duplicate as a report, not as work", () => {
    const result = compute([ticket("a"), ticket("b", { isDuplicate: true })]);

    expect(result.open).toBe(1);
    expect(result.period.reports).toBe(2);
    expect(result.period.duplicates).toBe(1);
    expect(result.oldest.map((item) => item.id)).toEqual(["a"]);
  });

  it("buckets age with every open ticket in exactly one bucket", () => {
    const result = compute([
      ticket("a", { createdAt: daysAgo(0.5) }),
      ticket("b", { createdAt: daysAgo(1) }),
      ticket("c", { createdAt: daysAgo(3) }),
      ticket("d", { createdAt: daysAgo(7) }),
      ticket("e", { createdAt: daysAgo(60) }),
    ]);

    expect(result.ageBuckets).toEqual([
      { bucket: "under_1_day", count: 1 },
      { bucket: "1_to_3_days", count: 1 },
      { bucket: "3_to_7_days", count: 1 },
      { bucket: "over_7_days", count: 2 },
    ]);
    expect(result.ageBuckets.reduce((total, row) => total + row.count, 0)).toBe(
      result.open,
    );
  });

  it("shows only the oldest five, and workload per technician", () => {
    const result = compute([
      ...["a", "b", "c", "d", "e", "f"].map((id, index) =>
        ticket(id, {
          status: "in_progress",
          assigneeName: index < 4 ? "Budi" : "Rina",
          createdAt: daysAgo(index + 1),
        }),
      ),
    ]);

    expect(result.oldest.map((item) => item.id)).toEqual([
      "f",
      "e",
      "d",
      "c",
      "b",
    ]);
    expect(result.workload).toEqual([
      { name: "Budi", count: 4, oldestAgeMs: 4 * DAY },
      { name: "Rina", count: 2, oldestAgeMs: 6 * DAY },
    ]);
  });
});

describe("rates that need a full observation window", () => {
  it("keeps young tickets pending instead of counting them as failures", () => {
    const result = compute(
      [
        ticket("young", { createdAt: daysAgo(3) }),
        ticket("closed-late", {
          status: "verified_closed",
          createdAt: daysAgo(25),
        }),
        ticket("closed-on-time", {
          status: "verified_closed",
          createdAt: daysAgo(20),
        }),
        ticket("still-open", { status: "in_progress", createdAt: daysAgo(15) }),
      ],
      [
        event("closed-late", "verified_closed", daysAgo(5)),
        event("closed-on-time", "verified_closed", daysAgo(15)),
      ],
    );

    expect(result.verifiedResolution).toEqual({
      numerator: 1,
      denominator: 3,
      pending: 1,
    });
  });

  it("leaves cancelled tickets and duplicates out of the denominator", () => {
    const result = compute([
      ticket("a", { status: "cancelled", createdAt: daysAgo(20) }),
      ticket("b", { isDuplicate: true, createdAt: daysAgo(20) }),
    ]);

    expect(result.verifiedResolution).toEqual({
      numerator: 0,
      denominator: 0,
      pending: 0,
    });
    expect(result.period.cancelled).toBe(1);
  });

  it("counts a reopen only against closures observed for 14 days", () => {
    const result = compute(
      [
        ticket("kept", { status: "verified_closed", createdAt: daysAgo(29) }),
        ticket("reopened", { status: "reopened", createdAt: daysAgo(29) }),
        ticket("reopened-late", { status: "reopened", createdAt: daysAgo(29) }),
        ticket("recent", { status: "verified_closed", createdAt: daysAgo(5) }),
      ],
      [
        event("kept", "verified_closed", daysAgo(20)),
        event("reopened", "verified_closed", daysAgo(20)),
        event("reopened", "reopened", daysAgo(10)),
        event("reopened-late", "verified_closed", daysAgo(28)),
        event("reopened-late", "reopened", daysAgo(1)),
        event("recent", "verified_closed", daysAgo(2)),
      ],
    );

    expect(result.reopenRate).toEqual({
      numerator: 1,
      denominator: 3,
      pending: 1,
    });
  });
});

describe("elapsed times", () => {
  it("reports the median and range of triage time, with untriaged beside it", () => {
    const created = daysAgo(2);
    const after = (hours: number) => new Date(created.getTime() + hours * HOUR);
    const result = compute(
      [
        ticket("a", { status: "triaged", createdAt: created }),
        ticket("b", { status: "triaged", createdAt: created }),
        ticket("c", { status: "triaged", createdAt: created }),
        ticket("d", { createdAt: created }),
      ],
      [
        event("a", "triaged", after(1)),
        event("b", "triaged", after(2)),
        event("c", "triaged", after(9)),
      ],
    );

    expect(result.timeToTriage).toEqual({
      count: 3,
      medianMs: 2 * HOUR,
      minMs: HOUR,
      maxMs: 9 * HOUR,
      untriaged: 1,
    });
  });

  it("gives no time to close before anything has closed", () => {
    const result = compute([ticket("a")]);

    expect(result.timeToClose).toEqual({
      count: 0,
      medianMs: null,
      minMs: null,
      maxMs: null,
      stillOpen: 1,
    });
  });

  it("measures closure from the report to the latest verified close", () => {
    const result = compute(
      [ticket("a", { status: "verified_closed", createdAt: daysAgo(10) })],
      [
        event("a", "verified_closed", daysAgo(8)),
        event("a", "reopened", daysAgo(7)),
        event("a", "verified_closed", daysAgo(4)),
      ],
    );

    expect(result.timeToClose.medianMs).toBe(6 * DAY);
  });
});

describe("period figures", () => {
  it("leaves tickets older than the window out of volume", () => {
    const result = compute([
      ticket("old", { status: "verified_closed", createdAt: daysAgo(40) }),
      ticket("new", { category: "plumbing" }),
      ticket("uncategorized"),
    ]);

    expect(result.period.reports).toBe(2);
    expect(result.period.byCategory).toEqual([{ key: "plumbing", count: 1 }]);
    expect(result.period.notCategorized).toBe(1);
  });

  it("folds locations past the fifth into a remainder that still adds up", () => {
    const places = ["A", "B", "C", "D", "E", "F", "G"];
    const result = compute(
      places.map((location) => ticket(location, { location })),
    );

    expect(result.period.byLocation).toHaveLength(5);
    expect(result.period.otherLocations).toBe(2);
  });

  it("counts proof decisions inside the window, with what's still waiting", () => {
    const result = compute(
      [
        ticket("a", { status: "verified_closed", createdAt: daysAgo(20) }),
        ticket("b", { status: "completion_submitted" }),
        ticket("c", { status: "rejected_with_reason" }),
        ticket("d", { status: "verified_closed", createdAt: daysAgo(90) }),
      ],
      [
        event("a", "verified_closed", daysAgo(3), "completion_submitted"),
        event("c", "rejected_with_reason", daysAgo(1), "completion_submitted"),
        event("d", "verified_closed", daysAgo(80), "completion_submitted"),
      ],
    );

    expect(result.proof).toEqual({
      accepted: 1,
      rejected: 1,
      waiting: 1,
      exceptions: 0,
    });
  });

  it("keeps proof exceptions visible, inside the window only", () => {
    const result = compute(
      [ticket("a", { status: "completion_submitted" })],
      [],
      [],
      [
        { ticketId: "a", hasException: true, submittedAt: daysAgo(1) },
        { ticketId: "a", hasException: false, submittedAt: daysAgo(2) },
        { ticketId: "a", hasException: true, submittedAt: daysAgo(60) },
      ],
    );

    expect(result.proof.exceptions).toBe(1);
  });

  it("sums draft outcomes", () => {
    const result = compute([], [], ["ready", "pending", "pending", "failed"]);

    expect(result.drafts).toEqual({
      ready: 1,
      pending: 2,
      failed: 1,
      notNeeded: 0,
    });
  });
});

describe("draftOutcome", () => {
  it("treats a report with no draft row as still pending", () => {
    expect(draftOutcome(null)).toBe("pending");
    expect(draftOutcome("failed_retryable")).toBe("pending");
    expect(draftOutcome("failed_terminal")).toBe("failed");
    expect(draftOutcome("skipped_manual")).toBe("not_needed");
  });
});

describe("canViewDashboard", () => {
  it("keeps technicians out unless they hold another role", () => {
    expect(canViewDashboard(["technician"])).toBe(false);
    expect(canViewDashboard(["technician", "supervisor"])).toBe(true);
    expect(canViewDashboard(["tenant_admin"])).toBe(true);
  });
});
