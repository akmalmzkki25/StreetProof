"use server";

import {
  acceptWork,
  assignTicket,
  decideCompletion,
  getDb,
  getTicketDetail,
  submitCompletion,
  transitionTicket,
  triageTicket,
  type ReportPhoto,
  type TransitionOutcome,
} from "@streetproof/db";
import {
  canViewTicket,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
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
    default:
      return "This action isn't allowed for the ticket right now.";
  }
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
  });
  if (!fields.success) {
    return { error: fields.error.issues[0]?.message ?? "Check the form." };
  }
  const { ticketId, expectedRevision, note } = fields.data;

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

  const read = await readPhotos(formData);
  if (!read.ok) return { error: read.error };

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
