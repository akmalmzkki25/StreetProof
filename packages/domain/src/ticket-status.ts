export const TICKET_STATUSES = [
  "submitted",
  "needs_clarification",
  "triaged",
  "assigned",
  "accepted",
  "in_progress",
  "waiting_for_parts",
  "waiting_for_access",
  "completion_submitted",
  "verified_closed",
  "rejected_with_reason",
  "reopened",
  "cancelled",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const ROLES = [
  "operator",
  "technician",
  "supervisor",
  "tenant_admin",
] as const;

export type Role = (typeof ROLES)[number];

export type Requirement =
  "reason" | "assignee" | "triage_fields" | "ready_evidence" | "next_review_at";

export type TransitionRule = {
  from: TicketStatus;
  to: TicketStatus;
  actor: Role;
  mustBeCurrentAssignee: boolean;
  requires: readonly Requirement[];
};

// Mirrors the guard table in plan/en/04-technical/state-machine-and-permissions.md.
export const TRANSITIONS: readonly TransitionRule[] = [
  {
    from: "submitted",
    to: "needs_clarification",
    actor: "operator",
    mustBeCurrentAssignee: false,
    requires: ["reason"],
  },
  {
    from: "needs_clarification",
    to: "submitted",
    actor: "operator",
    mustBeCurrentAssignee: false,
    requires: [],
  },
  {
    from: "submitted",
    to: "triaged",
    actor: "operator",
    mustBeCurrentAssignee: false,
    requires: ["triage_fields"],
  },
  {
    from: "triaged",
    to: "assigned",
    actor: "operator",
    mustBeCurrentAssignee: false,
    requires: ["assignee"],
  },
  {
    from: "triaged",
    to: "cancelled",
    actor: "operator",
    mustBeCurrentAssignee: false,
    requires: ["reason"],
  },
  {
    from: "assigned",
    to: "accepted",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: [],
  },
  {
    from: "accepted",
    to: "in_progress",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: [],
  },
  {
    from: "in_progress",
    to: "waiting_for_parts",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: ["reason", "next_review_at"],
  },
  {
    from: "in_progress",
    to: "waiting_for_access",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: ["reason", "next_review_at"],
  },
  {
    from: "waiting_for_parts",
    to: "in_progress",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: [],
  },
  {
    from: "waiting_for_access",
    to: "in_progress",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: [],
  },
  {
    from: "in_progress",
    to: "completion_submitted",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: ["ready_evidence"],
  },
  {
    from: "completion_submitted",
    to: "verified_closed",
    actor: "supervisor",
    mustBeCurrentAssignee: false,
    requires: ["reason"],
  },
  {
    from: "completion_submitted",
    to: "rejected_with_reason",
    actor: "supervisor",
    mustBeCurrentAssignee: false,
    requires: ["reason"],
  },
  {
    from: "rejected_with_reason",
    to: "in_progress",
    actor: "technician",
    mustBeCurrentAssignee: true,
    requires: [],
  },
  {
    from: "verified_closed",
    to: "reopened",
    actor: "supervisor",
    mustBeCurrentAssignee: false,
    requires: ["reason"],
  },
  {
    from: "reopened",
    to: "assigned",
    actor: "operator",
    mustBeCurrentAssignee: false,
    requires: ["assignee"],
  },
  {
    from: "reopened",
    to: "in_progress",
    actor: "supervisor",
    mustBeCurrentAssignee: false,
    requires: [],
  },
];
