import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@streetproof/domain";

type SearchParams = Record<string, string | string[] | undefined>;

// Anything not on the list, like "any" or a hand-edited URL, means no filter.
function oneOf<T extends string>(value: unknown, allowed: readonly T[]) {
  return allowed.find((item) => item === value) ?? null;
}

// The queue's filters from its address, shared by the page and its CSV export
// so a download is exactly the list on screen.
export function readQueueFilters(params: SearchParams) {
  return {
    search: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "",
    status: oneOf<TicketStatus>(params.status, TICKET_STATUSES),
    category: oneOf<string>(params.category, TICKET_CATEGORIES),
    priority: oneOf<TicketPriority>(params.priority, TICKET_PRIORITIES),
  };
}

export type QueueFilters = ReturnType<typeof readQueueFilters>;

export function toQueueFilter(filters: QueueFilters) {
  return {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { statuses: [filters.status] } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
  };
}
