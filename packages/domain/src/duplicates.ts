import type { Role, TicketStatus } from "./ticket-status";

export type DuplicateLinkProblem =
  | "same_ticket"
  | "different_site"
  | "source_has_work"
  | "source_already_linked"
  | "source_has_duplicates"
  | "target_is_duplicate"
  | "target_closed";

type LinkEnd = {
  id: string;
  siteId: string;
  status: TicketStatus;
  currentAssigneeId: string | null;
  // This ticket is already linked as a duplicate of another one.
  isDuplicate: boolean;
  // Other tickets are linked as duplicates of this one.
  hasDuplicates: boolean;
};

const LINKABLE_SOURCE_STATUSES: readonly TicketStatus[] = [
  "submitted",
  "needs_clarification",
  "triaged",
];

const CLOSED_TARGET_STATUSES: readonly TicketStatus[] = [
  "verified_closed",
  "cancelled",
];

export function canManageDuplicates(roles: readonly Role[]) {
  return roles.includes("operator") || roles.includes("supervisor");
}

// Links stay one level deep: a source points at a target that isn't itself a
// duplicate. That rules out cycles and chains, and gives every report one ticket
// to follow. Work already under way is never absorbed silently.
export function duplicateLinkProblem(
  source: LinkEnd,
  target: LinkEnd,
): DuplicateLinkProblem | null {
  if (source.id === target.id) return "same_ticket";
  if (source.siteId !== target.siteId) return "different_site";
  if (source.isDuplicate) return "source_already_linked";
  if (source.hasDuplicates) return "source_has_duplicates";
  if (
    source.currentAssigneeId !== null ||
    !LINKABLE_SOURCE_STATUSES.includes(source.status)
  ) {
    return "source_has_work";
  }
  if (target.isDuplicate) return "target_is_duplicate";
  if (CLOSED_TARGET_STATUSES.includes(target.status)) return "target_closed";
  return null;
}

export function canBeLinkedAsDuplicate(
  ticket: Pick<LinkEnd, "status" | "currentAssigneeId">,
) {
  return (
    ticket.currentAssigneeId === null &&
    LINKABLE_SOURCE_STATUSES.includes(ticket.status)
  );
}
