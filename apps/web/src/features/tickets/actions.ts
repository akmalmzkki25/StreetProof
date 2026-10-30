"use server";

import {
  acceptWork,
  assignTicket,
  decideCompletion,
  getDb,
  getTicketDetail,
  linkDuplicate,
  requestClarification,
  resumeAfterClarification,
  submitCompletion,
  transitionTicket,
  triageTicket,
  unlinkDuplicate,
  type DuplicateOutcome,
  type ReportPhoto,
  type TransitionOutcome,
} from "@streetproof/db";
import {
  canViewTicket,
  completionProofProblem,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type DuplicateLinkProblem,
} from "@streetproof/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMember, requireRole, type Member } from "@/lib/member";
import { readPhotos, storePhotos } from "@/lib/photo-upload";

export type TicketActionState = { error: string | null };

const ticketRef = {
  ticketId: z.uuid(),
  expectedRevision: z.coerce.number().int().min(0),
};

const triageFields = z.object({
  ...ticketRef,
  summary: z
    .string()
    .trim()
    .min(5, "Write a short summary.")
    .max(200, "Keep the summary under 200 characters."),
  category: z.enum(TICKET_CATEGORIES, { error: "Choose a category." }),
  priority: z.enum(TICKET_PRIORITIES, { error: "Choose a priority." }),
  locationId: z.uuid().nullable(),
});

const assignFields = z.object({
  ...ticketRef,
  technicianId: z.string().min(1, "Choose a technician."),
});

const cancelFields = z.object({
  ...ticketRef,
  reason: z
    .string()
    .trim()
    .min(5, "Explain why this ticket is being cancelled.")
    .max(500, "Keep the reason under 500 characters."),
});

const reasonField = (prompt: string) =>
  z
    .string()
    .trim()
    .min(5, prompt)
    .max(500, "Keep the reason under 500 characters.");

const progressFields = z.object({
  ...ticketRef,
  to: z.enum(["accepted", "in_progress"]),
});

const waitFields = z.object({
  ...ticketRef,
  to: z.enum(["waiting_for_parts", "waiting_for_access"], {
    error: "Choose what you're waiting for.",
  }),
  reason: reasonField("Explain what's blocking the work."),
  nextReviewAt: z.iso.datetime({ local: true, error: "Choose a review time." }),
});

const completionFields = z.object({
  ...ticketRef,
  note: z
    .string()
    .trim()
    .min(5, "Describe what you did.")
    .max(1000, "Keep the note under 1,000 characters."),
  checkedItemIds: z.array(z.string().max(64)).max(20),
  exceptionReason: z
    .string()
    .trim()
    .max(500, "Keep the reason under 500 characters."),
});

const decisionFields = z.object({
  ...ticketRef,
  decision: z.enum(["accepted", "rejected"]),
  reason: reasonField("Explain your decision."),
});

const reopenFields = z.object({
  ...ticketRef,
  reason: reasonField("Explain why this work is being reopened."),
});

const clarificationFields = z.object({
  ...ticketRef,
  question: z
    .string()
    .trim()
    .min(10, "Write the question the reporter should answer.")
    .max(500, "Keep the question under 500 characters."),
});

const resumeFields = z.object({
  ...ticketRef,
  reason: z.string().trim().max(500, "Keep the reason under 500 characters."),
});

const linkFields = z.object({
  ...ticketRef,
  targetTicketId: z.uuid({ error: "Choose the ticket to link to." }),
  reason: reasonField("Explain why these reports are the same problem."),
});

const unlinkFields = z.object({
  ...ticketRef,
  reason: reasonField("Explain why this link is being removed."),
});

function rejectionMessage(outcome: Extract<TransitionOutcome, { ok: false }>) {
  switch (outcome.rejection.code) {
    case "stale_revision":
      return "Someone else changed this ticket. Reload to see the latest version.";
    case "not_current_assignee":
      return "This work is assigned to someone else.";
    case "technician_not_eligible":
      return "That person can't take work on this site.";
    case "not_found":
      return "This ticket isn't available.";
    case "linked_as_duplicate":
      return "This report is linked as a duplicate. Remove the link to work on it.";
    case "has_linked_duplicates":
      return "Other reports are linked to this ticket. Remove those links before cancelling.";
    default:
      return "This action isn't allowed for the ticket right now.";
  }
}

const LINK_PROBLEM_MESSAGES: Record<DuplicateLinkProblem, string> = {
  same_ticket: "A ticket can't be a duplicate of itself.",
  different_site: "Both tickets must be on the same site.",
  source_has_work:
    "This ticket already has work in progress, so it can't be linked.",
  source_already_linked: "This report is already linked as a duplicate.",
  source_has_duplicates:
    "Other reports are linked to this ticket. Remove those links first.",
  target_is_duplicate:
    "That ticket is itself a duplicate. Link to the ticket it points to.",
  target_closed: "That ticket is closed. Choose one that's still open.",
};

function finishDuplicate(
  outcome: DuplicateOutcome,
  ticketIds: readonly string[],
): TicketActionState {
  if (!outcome.ok) {
    const { rejection } = outcome;
    switch (rejection.code) {
      case "stale_revision":
        return {
          error:
            "Someone else changed this ticket. Reload to see the latest version.",
        };
      case "link_problem":
        return { error: LINK_PROBLEM_MESSAGES[rejection.problem] };
      case "forbidden_role":
        return { error: "Only operators and supervisors can link reports." };
      case "missing_reason":
        return { error: "Explain why these reports are linked." };
      case "not_found":
        return { error: "This ticket isn't available." };
    }
  }
  for (const ticketId of ticketIds) {
    revalidatePath(`/app/tickets/${ticketId}`);
  }
  revalidatePath("/app/queue");
  return { error: null };
}

function finish(
  outcome: TransitionOutcome,
  ticketId: string,
): TicketActionState {
  if (!outcome.ok) return { error: rejectionMessage(outcome) };
  revalidatePath(`/app/tickets/${ticketId}`);
  revalidatePath("/app/queue");
  revalidatePath("/app/work");
  revalidatePath("/app/reviews");
  return { error: null };
}

function actorOf(member: Member) {
  return { userId: member.userId, roles: member.roles };
}

// transitionTicket checks the tenant; this adds the member's site scope and
// keeps technicians to their own assigned work.
async function ticketInScope(member: Member, ticketId: string) {
  const ticket = await getTicketDetail(
    getDb(),
    { tenantId: member.tenantId, siteIds: member.siteIds },
    ticketId,
  );
  if (!ticket || !canViewTicket(ticket, actorOf(member))) return null;
  return ticket;
}

const unavailable: TicketActionState = {
  error: "This ticket isn't available.",
};

export async function triageAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireRole("operator");
  const fields = triageFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    summary: formData.get("summary") ?? "",
    category: formData.get("category"),
    priority: formData.get("priority"),
    locationId: formData.get("locationId") || null,
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const outcome = await triageTicket(getDb(), {
    tenantId: member.tenantId,
    actor: actorOf(member),
    ...fields.data,
  });
  return finish(outcome, fields.data.ticketId);
}

export async function assignAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireRole("operator");
  const fields = assignFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    technicianId: formData.get("technicianId") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const outcome = await assignTicket(getDb(), {
    tenantId: member.tenantId,
    siteId: ticket.siteId,
    actor: actorOf(member),
    ...fields.data,
  });
  return finish(outcome, fields.data.ticketId);
}

export async function cancelAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireRole("operator");
  const fields = cancelFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    reason: formData.get("reason") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const outcome = await transitionTicket(getDb(), {
    tenantId: member.tenantId,
    ticketId: fields.data.ticketId,
    actor: actorOf(member),
    to: "cancelled",
    expectedRevision: fields.data.expectedRevision,
    provided: ["reason"],
    payload: { reason: fields.data.reason },
  });
  return finish(outcome, fields.data.ticketId);
}

export async function progressAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireMember();
  const fields = progressFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    to: formData.get("to"),
  });
  if (!fields.success) return { error: "This action isn't available." };

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const { ticketId, expectedRevision, to } = fields.data;
  const command = {
    tenantId: member.tenantId,
    ticketId,
    actor: actorOf(member),
    expectedRevision,
  };
  const outcome =
    to === "accepted"
      ? await acceptWork(getDb(), command)
      : await transitionTicket(getDb(), { ...command, to, provided: [] });
  return finish(outcome, ticketId);
}

export async function waitAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireMember();
  const fields = waitFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    to: formData.get("to"),
    reason: formData.get("reason") ?? "",
    nextReviewAt: formData.get("nextReviewAt"),
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const { ticketId, expectedRevision, to, reason, nextReviewAt } = fields.data;
  const outcome = await transitionTicket(getDb(), {
    tenantId: member.tenantId,
    ticketId,
    actor: actorOf(member),
    to,
    expectedRevision,
    provided: ["reason", "next_review_at"],
    payload: { reason, nextReviewAt },
  });
  return finish(outcome, ticketId);
}

export async function completionAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireMember();
  const fields = completionFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    note: formData.get("note") ?? "",
    checkedItemIds: formData.getAll("checks"),
    exceptionReason: formData.get("exceptionReason") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }
  const { ticketId, expectedRevision, note, checkedItemIds } = fields.data;
  const exceptionReason = fields.data.exceptionReason || null;

  const ticket = await ticketInScope(member, ticketId);
  if (!ticket) return unavailable;
  // Checked before storing anything, so a refused attempt leaves no objects.
  if (ticket.currentAssigneeId !== member.userId) {
    return { error: "This work is assigned to someone else." };
  }
  if (ticket.revision !== expectedRevision) {
    return {
      error:
        "Someone else changed this ticket. Reload to see the latest version.",
    };
  }

  const read = await readPhotos(formData, {
    optional: exceptionReason !== null,
  });
  if (!read.ok) return { error: read.error };

  const proofProblem = completionProofProblem({
    category: ticket.category,
    checkedIds: checkedItemIds,
    photoCount: read.photos.length,
    exceptionReason,
  });
  if (proofProblem === "unconfirmed_checks") {
    return {
      error:
        "Confirm every check, or explain why you can't so a supervisor can decide.",
    };
  }

  let photos: ReportPhoto[];
  try {
    photos = await storePhotos(
      read.photos,
      `tenants/${member.tenantId}/completions/${ticketId}`,
    );
  } catch (error) {
    console.error("Completion photo upload failed", error);
    return { error: "We couldn't save your photos. Please try again." };
  }

  const outcome = await submitCompletion(getDb(), {
    tenantId: member.tenantId,
    ticketId,
    actor: actorOf(member),
    expectedRevision,
    note,
    photos,
    checkedItemIds,
    exceptionReason,
  });
  return finish(outcome, ticketId);
}

export async function decisionAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireRole("supervisor");
  const fields = decisionFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    decision: formData.get("decision"),
    reason: formData.get("reason") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const outcome = await decideCompletion(getDb(), {
    tenantId: member.tenantId,
    actor: actorOf(member),
    ...fields.data,
  });
  if (!outcome.ok && outcome.rejection.code === "missing_requirements") {
    return {
      error:
        "This attempt has no photo, so it can't be verified. Request corrected proof instead.",
    };
  }
  return finish(outcome, fields.data.ticketId);
}

export async function reopenAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireRole("supervisor");
  const fields = reopenFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    reason: formData.get("reason") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const outcome = await transitionTicket(getDb(), {
    tenantId: member.tenantId,
    ticketId: fields.data.ticketId,
    actor: actorOf(member),
    to: "reopened",
    expectedRevision: fields.data.expectedRevision,
    provided: ["reason"],
    payload: { reason: fields.data.reason },
  });
  return finish(outcome, fields.data.ticketId);
}

export async function linkDuplicateAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireMember();
  const fields = linkFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    targetTicketId: formData.get("targetTicketId"),
    reason: formData.get("reason") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const source = await ticketInScope(member, fields.data.ticketId);
  const target = await ticketInScope(member, fields.data.targetTicketId);
  if (!source || !target) return unavailable;

  const outcome = await linkDuplicate(getDb(), {
    tenantId: member.tenantId,
    sourceTicketId: source.id,
    targetTicketId: target.id,
    actor: actorOf(member),
    expectedRevision: fields.data.expectedRevision,
    reason: fields.data.reason,
  });
  return finishDuplicate(outcome, [source.id, target.id]);
}

export async function unlinkDuplicateAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireMember();
  const fields = unlinkFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    reason: formData.get("reason") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const source = await ticketInScope(member, fields.data.ticketId);
  if (!source?.duplicateOf) return unavailable;

  const outcome = await unlinkDuplicate(getDb(), {
    tenantId: member.tenantId,
    sourceTicketId: source.id,
    actor: actorOf(member),
    expectedRevision: fields.data.expectedRevision,
    reason: fields.data.reason,
  });
  return finishDuplicate(outcome, [source.id, source.duplicateOf.ticketId]);
}

export async function requestClarificationAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireRole("operator");
  const fields = clarificationFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    question: formData.get("question") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const outcome = await requestClarification(getDb(), {
    tenantId: member.tenantId,
    actor: actorOf(member),
    ...fields.data,
  });
  return finish(outcome, fields.data.ticketId);
}

export async function resumeAfterClarificationAction(
  _previous: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const member = await requireRole("operator");
  const fields = resumeFields.safeParse({
    ticketId: formData.get("ticketId"),
    expectedRevision: formData.get("expectedRevision"),
    reason: formData.get("reason") ?? "",
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }

  const ticket = await ticketInScope(member, fields.data.ticketId);
  if (!ticket) return unavailable;

  const outcome = await resumeAfterClarification(getDb(), {
    tenantId: member.tenantId,
    actor: actorOf(member),
    ticketId: fields.data.ticketId,
    expectedRevision: fields.data.expectedRevision,
    reason: fields.data.reason || null,
  });
  if (!outcome.ok && outcome.rejection.code === "missing_requirements") {
    return { error: "Explain why you're continuing without an answer." };
  }
  return finish(outcome, fields.data.ticketId);
}
