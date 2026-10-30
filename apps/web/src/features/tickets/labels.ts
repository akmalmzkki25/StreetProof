import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@streetproof/domain";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  submitted: "New report",
  needs_clarification: "Needs clarification",
  triaged: "Ready to assign",
  assigned: "Assigned",
  accepted: "Accepted",
  in_progress: "In progress",
  waiting_for_parts: "Waiting for parts",
  waiting_for_access: "Waiting for access",
  completion_submitted: "Awaiting verification",
  verified_closed: "Verified closed",
  rejected_with_reason: "Proof rejected",
  reopened: "Reopened",
  cancelled: "Cancelled",
};

// design.md: brand is good status, destructive is urgency, the rest stay quiet.
export function statusBadgeVariant(status: TicketStatus) {
  if (status === "verified_closed") return "brand" as const;
  if (status === "rejected_with_reason" || status === "reopened") {
    return "destructive" as const;
  }
  return "outline" as const;
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "Air conditioning",
  building_fabric: "Walls, floors and ceilings",
  other: "Other",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function categoryLabel(category: string | null) {
  if (!category) return null;
  return CATEGORY_LABELS[category as TicketCategory] ?? category;
}
