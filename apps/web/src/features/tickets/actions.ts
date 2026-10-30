"use server";

import {
  assignTicket,
  getDb,
  getTicketDetail,
  transitionTicket,
  triageTicket,
  type TransitionOutcome,
} from "@streetproof/db";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@streetproof/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole, type Member } from "@/lib/member";

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

function rejectionMessage(outcome: Extract<TransitionOutcome, { ok: false }>) {
  switch (outcome.rejection.code) {
    case "stale_revision":
      return "Someone else changed this ticket. Reload to see the latest version.";
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
  return { error: null };
}

function actorOf(member: Member) {
  return { userId: member.userId, roles: member.roles };
}

// transitionTicket checks the tenant; this adds the member's site scope.
async function ticketInScope(member: Member, ticketId: string) {
  return getTicketDetail(
    getDb(),
    { tenantId: member.tenantId, siteIds: member.siteIds },
    ticketId,
  );
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
