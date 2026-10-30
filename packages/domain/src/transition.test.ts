import { describe, expect, it } from "vitest";
import {
  TICKET_STATUSES,
  TRANSITIONS,
  type Requirement,
  type Role,
  type TicketStatus,
} from "./ticket-status";
import { availableTransitions, checkTransition } from "./transition";

const technicianId = "tech-1";

function request(options: {
  status: TicketStatus;
  to: TicketStatus;
  roles: Role[];
  userId?: string;
  assigneeId?: string | null;
  revision?: number;
  expectedRevision?: number;
  provided?: Requirement[];
}) {
  const revision = options.revision ?? 3;
  return {
    ticket: {
      status: options.status,
      revision,
      currentAssigneeId: options.assigneeId ?? technicianId,
    },
    actor: { userId: options.userId ?? technicianId, roles: options.roles },
    to: options.to,
    expectedRevision: options.expectedRevision ?? revision,
    provided: new Set(options.provided ?? []),
  };
}

describe("checkTransition", () => {
  it("lets an operator triage a submitted report and bumps the revision", () => {
    const result = checkTransition(
      request({
        status: "submitted",
        to: "triaged",
        roles: ["operator"],
        provided: ["triage_fields"],
      }),
    );

    expect(result).toMatchObject({ ok: true, nextRevision: 4 });
  });

  it("rejects a stale revision before anything else", () => {
    const result = checkTransition(
      request({
        status: "submitted",
        to: "verified_closed",
        roles: [],
        expectedRevision: 2,
      }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: { code: "stale_revision", currentRevision: 3 },
    });
  });

  it("rejects an edge that is not in the state machine", () => {
    const result = checkTransition(
      request({
        status: "submitted",
        to: "verified_closed",
        roles: ["supervisor"],
      }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: { code: "invalid_transition" },
    });
  });

  it("never lets a technician close their own work", () => {
    const result = checkTransition(
      request({
        status: "completion_submitted",
        to: "verified_closed",
        roles: ["technician"],
        provided: ["reason"],
      }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: { code: "forbidden_role", requiredRole: "supervisor" },
    });
  });

  it("only lets the current assignee accept the work", () => {
    const result = checkTransition(
      request({
        status: "assigned",
        to: "accepted",
        roles: ["technician"],
        userId: "tech-2",
      }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: { code: "not_current_assignee" },
    });
  });

  it("requires ready evidence to submit completion", () => {
    const result = checkTransition(
      request({
        status: "in_progress",
        to: "completion_submitted",
        roles: ["technician"],
      }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: { code: "missing_requirements", missing: ["ready_evidence"] },
    });
  });

  it("requires a reason to reject a completion", () => {
    const result = checkTransition(
      request({
        status: "completion_submitted",
        to: "rejected_with_reason",
        roles: ["supervisor"],
      }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: { code: "missing_requirements", missing: ["reason"] },
    });
  });
});

describe("availableTransitions", () => {
  it("offers a supervisor both decisions on a pending completion", () => {
    const targets = availableTransitions(
      {
        status: "completion_submitted",
        revision: 1,
        currentAssigneeId: technicianId,
      },
      { userId: "sup-1", roles: ["supervisor"] },
    ).map((rule) => rule.to);

    expect(targets).toEqual(["verified_closed", "rejected_with_reason"]);
  });

  it("offers nothing to a technician who is not assigned", () => {
    const targets = availableTransitions(
      { status: "assigned", revision: 1, currentAssigneeId: technicianId },
      { userId: "tech-2", roles: ["technician"] },
    );

    expect(targets).toEqual([]);
  });
});

describe("state machine table", () => {
  it("only uses known statuses and has no duplicate edges", () => {
    const edges = TRANSITIONS.map((rule) => `${rule.from}->${rule.to}`);

    expect(new Set(edges).size).toBe(edges.length);
    for (const rule of TRANSITIONS) {
      expect(TICKET_STATUSES).toContain(rule.from);
      expect(TICKET_STATUSES).toContain(rule.to);
    }
  });

  it("reaches verified_closed only from completion_submitted", () => {
    const sources = TRANSITIONS.filter(
      (rule) => rule.to === "verified_closed",
    ).map((rule) => rule.from);

    expect(sources).toEqual(["completion_submitted"]);
  });
});
