import {
  TRANSITIONS,
  type Requirement,
  type Role,
  type TicketStatus,
  type TransitionRule,
} from "./ticket-status";

export type TransitionRequest = {
  ticket: {
    status: TicketStatus;
    revision: number;
    currentAssigneeId: string | null;
  };
  actor: { userId: string; roles: readonly Role[] };
  to: TicketStatus;
  expectedRevision: number;
  provided: ReadonlySet<Requirement>;
};

export type TransitionRejection =
  | { code: "stale_revision"; currentRevision: number }
  | { code: "invalid_transition" }
  | { code: "forbidden_role"; requiredRole: Role }
  | { code: "not_current_assignee" }
  | { code: "missing_requirements"; missing: Requirement[] };

export type TransitionResult =
  | { ok: true; rule: TransitionRule; nextRevision: number }
  | { ok: false; rejection: TransitionRejection };

export function findRule(
  from: TicketStatus,
  to: TicketStatus,
): TransitionRule | undefined {
  return TRANSITIONS.find((rule) => rule.from === from && rule.to === to);
}

export function checkTransition(request: TransitionRequest): TransitionResult {
  const { ticket, actor, to, expectedRevision, provided } = request;

  if (expectedRevision !== ticket.revision) {
    return {
      ok: false,
      rejection: { code: "stale_revision", currentRevision: ticket.revision },
    };
  }

  const rule = findRule(ticket.status, to);
  if (!rule) {
    return { ok: false, rejection: { code: "invalid_transition" } };
  }

  if (!actor.roles.includes(rule.actor)) {
    return {
      ok: false,
      rejection: { code: "forbidden_role", requiredRole: rule.actor },
    };
  }

  if (rule.mustBeCurrentAssignee && ticket.currentAssigneeId !== actor.userId) {
    return { ok: false, rejection: { code: "not_current_assignee" } };
  }

  const missing = rule.requires.filter(
    (requirement) => !provided.has(requirement),
  );
  if (missing.length > 0) {
    return { ok: false, rejection: { code: "missing_requirements", missing } };
  }

  return { ok: true, rule, nextRevision: ticket.revision + 1 };
}

// Within a member's site scope: technicians see only work assigned to them.
export function canViewTicket(
  ticket: Pick<TransitionRequest["ticket"], "currentAssigneeId">,
  actor: TransitionRequest["actor"],
) {
  const seesAllSiteWork = actor.roles.some((role) => role !== "technician");
  return seesAllSiteWork || ticket.currentAssigneeId === actor.userId;
}

export function availableTransitions(
  ticket: TransitionRequest["ticket"],
  actor: TransitionRequest["actor"],
): TransitionRule[] {
  return TRANSITIONS.filter(function isAllowed(rule) {
    if (rule.from !== ticket.status) return false;
    if (!actor.roles.includes(rule.actor)) return false;
    if (rule.mustBeCurrentAssignee && ticket.currentAssigneeId !== actor.userId)
      return false;
    return true;
  });
}
