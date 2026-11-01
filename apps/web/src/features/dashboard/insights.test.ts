import {
  computeDashboard,
  type DashboardEvent,
  type DashboardTicket,
} from "@streetproof/domain";
import { describe, expect, it } from "vitest";

import { translate } from "@/lib/i18n/translate";

import {
  ageInsight,
  categoryInsight,
  flowInsight,
  phaseInsight,
  stageInsight,
  trendInsight,
  workloadInsight,
} from "./insights";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date("2026-10-30T12:00:00Z");

function t(text: string, params?: Record<string, string | number>) {
  return translate("en", text, params);
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
    createdAt: new Date(now.getTime() - DAY),
    ...overrides,
  };
}

function dashboardOf(
  tickets: DashboardTicket[],
  events: DashboardEvent[] = [],
) {
  return computeDashboard({ tickets, events, attempts: [], drafts: [], now });
}

function daysAgo(days: number) {
  return new Date(now.getTime() - days * DAY);
}

describe("flowInsight", () => {
  it("says nothing when nothing moved", () => {
    expect(flowInsight(dashboardOf([]), t)).toBeNull();
  });

  it("says which side is ahead", () => {
    const growing = dashboardOf([ticket("a"), ticket("b")]);
    expect(flowInsight(growing, t)).toContain("New work is outpacing closes.");

    const closing = dashboardOf(
      [ticket("a", { status: "verified_closed", createdAt: daysAgo(40) })],
      [
        {
          ticketId: "a",
          fromStatus: "completion_submitted",
          toStatus: "verified_closed",
          createdAt: daysAgo(2),
        },
      ],
    );
    expect(flowInsight(closing, t)).toContain("Closes are outpacing new work.");
  });
});

describe("trendInsight", () => {
  it("stays quiet on a small sample and reports a real change otherwise", () => {
    expect(trendInsight(dashboardOf([ticket("a"), ticket("b")]), t)).toBeNull();

    const busy = dashboardOf([
      ticket("a", { createdAt: daysAgo(25) }),
      ticket("b", { createdAt: daysAgo(24) }),
      ticket("c", { createdAt: daysAgo(23) }),
      ...["d", "e", "f", "g", "h", "i"].map((id) =>
        ticket(id, { createdAt: daysAgo(2) }),
      ),
    ]);
    expect(trendInsight(busy, t)).toBe(
      "New tickets are up 100% on the 15 days before.",
    );
  });
});

describe("stageInsight", () => {
  it("names the biggest stage only when it holds a real share of enough tickets", () => {
    expect(stageInsight(dashboardOf([ticket("a"), ticket("b")]), t)).toBeNull();

    const stuck = dashboardOf([
      ticket("a", { status: "waiting_for_parts" }),
      ticket("b", { status: "waiting_for_parts" }),
      ticket("c", { status: "waiting_for_access" }),
      ticket("d", { status: "submitted" }),
    ]);
    expect(stageInsight(stuck, t)).toBe(
      "The biggest stage is waiting on parts or access, with 3 of 4 open tickets.",
    );
  });
});

describe("ageInsight", () => {
  it("counts what is over a week old, or says nothing is", () => {
    expect(ageInsight(dashboardOf([ticket("a")]), t)).toBe(
      "Nothing open is older than 7 days.",
    );

    const old = dashboardOf([
      ticket("a", { createdAt: daysAgo(9) }),
      ticket("b"),
    ]);
    expect(ageInsight(old, t)).toBe("Over 7 days old: 1 of 2 open tickets.");
  });
});

describe("workloadInsight", () => {
  it("flags one person holding at least half of the assigned work", () => {
    const lopsided = dashboardOf(
      ["Rina", "Rina", "Rina", "Rina", "Budi"].map((name, index) =>
        ticket(String(index), { status: "in_progress", assigneeName: name }),
      ),
    );
    expect(workloadInsight(lopsided, t)).toBe(
      "Rina holds 4 of 5 assigned tickets.",
    );

    const even = dashboardOf(
      ["Rina", "Rina", "Budi", "Budi", "Sari", "Sari"].map((name, index) =>
        ticket(String(index), { status: "in_progress", assigneeName: name }),
      ),
    );
    expect(workloadInsight(even, t)).toBeNull();
  });
});

describe("categoryInsight", () => {
  it("shows the leading category as a share once there are enough tickets", () => {
    const lighting = dashboardOf([
      ...["a", "b", "c"].map((id) => ticket(id, { category: "electrical" })),
      ticket("d", { category: "plumbing" }),
      ticket("e", { category: "plumbing" }),
    ]);
    expect(categoryInsight(lighting, t)).toBe(
      "Electrical makes up 60% of tickets in this period.",
    );
  });
});

describe("phaseInsight", () => {
  it("names the slowest phase of closed work", () => {
    const created = daysAgo(10);
    const at = (hours: number) => new Date(created.getTime() + hours * HOUR);
    const closed = dashboardOf(
      [ticket("a", { status: "verified_closed", createdAt: created })],
      [
        {
          ticketId: "a",
          fromStatus: null,
          toStatus: "triaged",
          createdAt: at(2),
        },
        {
          ticketId: "a",
          fromStatus: null,
          toStatus: "assigned",
          createdAt: at(5),
        },
        {
          ticketId: "a",
          fromStatus: null,
          toStatus: "completion_submitted",
          createdAt: at(30),
        },
        {
          ticketId: "a",
          fromStatus: null,
          toStatus: "verified_closed",
          createdAt: at(32),
        },
      ],
    );
    expect(phaseInsight(closed, t, "en")).toBe(
      "Repair takes longest, typically 1 d.",
    );
  });
});
