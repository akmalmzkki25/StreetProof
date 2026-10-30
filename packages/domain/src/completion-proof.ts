import { TICKET_CATEGORIES, type TicketCategory } from "./ticket-status";

export type ChecklistItem = { id: string; label: string };
export type ChecklistResult = ChecklistItem & { checked: boolean };

// Static, approved lists. What a technician confirmed, not a safety certificate.
const COMPLETION_CHECKLISTS: Record<TicketCategory, readonly ChecklistItem[]> =
  {
    plumbing: [
      {
        id: "leak_stopped",
        label: "The leak has stopped with the water running",
      },
      { id: "area_dry", label: "The area is dry and clean" },
      { id: "no_new_damage", label: "I found no new damage nearby" },
    ],
    electrical: [
      { id: "tested_working", label: "It works when tested" },
      {
        id: "no_exposed_parts",
        label: "No wiring or live parts are left exposed",
      },
      { id: "covers_back", label: "Covers and panels are back in place" },
    ],
    hvac: [
      { id: "tested_running", label: "The unit runs when tested" },
      { id: "no_dripping", label: "Nothing is dripping from the unit" },
      { id: "covers_back", label: "Filters and covers are back in place" },
    ],
    building_fabric: [
      {
        id: "surface_repaired",
        label: "The damaged surface is repaired or replaced",
      },
      { id: "secure", label: "The repair is secure and nothing is loose" },
      { id: "area_clean", label: "The work area is clean" },
    ],
    other: [
      { id: "problem_fixed", label: "The reported problem is fixed" },
      { id: "area_clean", label: "The work area is clean" },
    ],
  };

function isTicketCategory(category: string): category is TicketCategory {
  return (TICKET_CATEGORIES as readonly string[]).includes(category);
}

export function checklistFor(
  category: string | null,
): readonly ChecklistItem[] {
  return COMPLETION_CHECKLISTS[
    category && isTicketCategory(category) ? category : "other"
  ];
}

// Labels are copied onto the attempt, so a later list change can't rewrite what
// a technician confirmed. Unknown IDs from a form are ignored.
export function checklistResults(
  category: string | null,
  checkedIds: readonly string[],
): ChecklistResult[] {
  return checklistFor(category).map((item) => ({
    ...item,
    checked: checkedIds.includes(item.id),
  }));
}

export type CompletionProofProblem = "unconfirmed_checks" | "missing_photo";

// A reason lets an attempt reach a supervisor without the full proof. It never
// makes that attempt verifiable: see canVerifyAttempt.
export function completionProofProblem(input: {
  category: string | null;
  checkedIds: readonly string[];
  photoCount: number;
  exceptionReason: string | null;
}): CompletionProofProblem | null {
  if (input.exceptionReason?.trim()) return null;
  const allConfirmed = checklistResults(input.category, input.checkedIds).every(
    (item) => item.checked,
  );
  if (!allConfirmed) return "unconfirmed_checks";
  return input.photoCount > 0 ? null : "missing_photo";
}

export function canVerifyAttempt(attempt: { photoCount: number }) {
  return attempt.photoCount > 0;
}
