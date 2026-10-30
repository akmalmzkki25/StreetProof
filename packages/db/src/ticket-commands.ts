import {
  checkTransition,
  type Requirement,
  type Role,
  type TicketStatus,
  type TransitionRejection,
} from "@streetproof/domain";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import type { Db, Transaction } from "./client";
import {
  assignments,
  memberships,
  outbox,
  ticketEvents,
  tickets,
} from "./schema";

type Ticket = typeof tickets.$inferSelect;
type TicketChanges = Partial<
  Pick<
    Ticket,
    "summary" | "category" | "priority" | "locationId" | "currentAssigneeId"
  >
>;

export type TransitionCommand = {
  tenantId: string;
  ticketId: string;
  actor: { userId: string; roles: readonly Role[] };
  to: TicketStatus;
  expectedRevision: number;
  provided: readonly Requirement[];
  payload?: Record<string, unknown>;
  // Runs inside the transaction after the guard passes, with the ticket row
  // locked. Use it for side rows (assignments, completions) and field changes.
  apply?: (tx: Transaction, ticket: Ticket) => Promise<TicketChanges | void>;
};

export type TransitionOutcome =
  | { ok: true; ticket: Ticket }
  | {
      ok: false;
      rejection:
        | TransitionRejection
        | { code: "not_found" }
        | { code: "technician_not_eligible" };
    };

export async function nextEventSeq(tx: Transaction, ticketId: string) {
  const [row] = await tx
    .select({ next: sql<number>`coalesce(max(${ticketEvents.seq}), 0) + 1` })
    .from(ticketEvents)
    .where(eq(ticketEvents.ticketId, ticketId));
  return Number(row?.next ?? 1);
}

// Lock the ticket, re-check the guard against the locked row, apply the change,
// then write the event and outbox row in the same transaction. Two commands
// racing on one revision serialize on the lock; the second sees a new revision
// and is rejected as stale.
export async function transitionTicket(
  db: Db,
  command: TransitionCommand,
): Promise<TransitionOutcome> {
  return db.transaction(async function run(tx) {
    const [ticket] = await tx
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.tenantId, command.tenantId),
          eq(tickets.id, command.ticketId),
        ),
      )
      .for("update");

    if (!ticket) return { ok: false, rejection: { code: "not_found" } };

    const check = checkTransition({
      ticket: {
        status: ticket.status,
        revision: ticket.revision,
        currentAssigneeId: ticket.currentAssigneeId,
      },
      actor: command.actor,
      to: command.to,
      expectedRevision: command.expectedRevision,
      provided: new Set(command.provided),
    });
    if (!check.ok) return check;

    const changes = (await command.apply?.(tx, ticket)) ?? {};

    const [updated] = await tx
      .update(tickets)
      .set({ ...changes, status: command.to, revision: check.nextRevision })
      .where(eq(tickets.id, ticket.id))
      .returning();
    if (!updated) throw new Error(`Ticket ${ticket.id} vanished while locked.`);

    const seq = await nextEventSeq(tx, ticket.id);
    const payload = { ...command.payload, revision: check.nextRevision };

    await tx.insert(ticketEvents).values({
      tenantId: ticket.tenantId,
      ticketId: ticket.id,
      seq,
      type: "status_changed",
      actorId: command.actor.userId,
      fromStatus: ticket.status,
      toStatus: command.to,
      payload,
    });

    await tx.insert(outbox).values({
      tenantId: ticket.tenantId,
      topic: "ticket.status_changed",
      payload: {
        ticketId: ticket.id,
        from: ticket.status,
        to: command.to,
        seq,
        ...payload,
      },
    });

    return { ok: true, ticket: updated };
  });
}

type WorkCommand = {
  tenantId: string;
  ticketId: string;
  actor: TransitionCommand["actor"];
  expectedRevision: number;
};

export function triageTicket(
  db: Db,
  command: WorkCommand & {
    summary: string;
    category: string;
    priority: NonNullable<Ticket["priority"]>;
    locationId: string | null;
  },
) {
  return transitionTicket(db, {
    tenantId: command.tenantId,
    ticketId: command.ticketId,
    actor: command.actor,
    to: "triaged",
    expectedRevision: command.expectedRevision,
    provided: ["triage_fields"],
    payload: { category: command.category, priority: command.priority },
    apply: async function reviewedFields() {
      return {
        summary: command.summary,
        category: command.category,
        priority: command.priority,
        locationId: command.locationId,
      };
    },
  });
}

export async function assignTicket(
  db: Db,
  command: WorkCommand & { siteId: string; technicianId: string },
): Promise<TransitionOutcome> {
  const [eligible] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.tenantId, command.tenantId),
        eq(memberships.userId, command.technicianId),
        eq(memberships.role, "technician"),
        eq(memberships.active, true),
        or(eq(memberships.siteId, command.siteId), isNull(memberships.siteId)),
      ),
    );
  if (!eligible) {
    return { ok: false, rejection: { code: "technician_not_eligible" } };
  }

  return transitionTicket(db, {
    tenantId: command.tenantId,
    ticketId: command.ticketId,
    actor: command.actor,
    to: "assigned",
    expectedRevision: command.expectedRevision,
    provided: ["assignee"],
    payload: { technicianId: command.technicianId },
    apply: async function replaceAssignment(tx, ticket) {
      await tx
        .update(assignments)
        .set({ endedAt: new Date() })
        .where(
          and(eq(assignments.ticketId, ticket.id), isNull(assignments.endedAt)),
        );
      await tx.insert(assignments).values({
        tenantId: ticket.tenantId,
        ticketId: ticket.id,
        technicianId: command.technicianId,
        assignedBy: command.actor.userId,
      });
      return { currentAssigneeId: command.technicianId };
    },
  });
}
