import type { Requirement } from "@streetproof/domain";
import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "./client";
import type { ReportPhoto } from "./reports";
import {
  assignments,
  completionSubmissions,
  uploads,
  verifications,
} from "./schema";
import { transitionTicket, type TransitionCommand } from "./ticket-commands";

type WorkCommand = Pick<
  TransitionCommand,
  "tenantId" | "ticketId" | "actor" | "expectedRevision"
>;

export function acceptWork(db: Db, command: WorkCommand) {
  return transitionTicket(db, {
    ...command,
    to: "accepted",
    provided: [],
    apply: async function markAccepted(tx, ticket) {
      await tx
        .update(assignments)
        .set({ acceptedAt: new Date() })
        .where(
          and(eq(assignments.ticketId, ticket.id), isNull(assignments.endedAt)),
        );
    },
  });
}

// Photos are stored before this runs. Without at least one, the domain guard
// rejects the transition, so completion can't exist without proof.
export function submitCompletion(
  db: Db,
  command: WorkCommand & { note: string; photos: readonly ReportPhoto[] },
) {
  const provided: Requirement[] =
    command.photos.length > 0 ? ["ready_evidence"] : [];

  return transitionTicket(db, {
    tenantId: command.tenantId,
    ticketId: command.ticketId,
    actor: command.actor,
    expectedRevision: command.expectedRevision,
    to: "completion_submitted",
    provided,
    apply: async function recordAttempt(tx, ticket) {
      const [assignment] = await tx
        .select({ id: assignments.id })
        .from(assignments)
        .where(
          and(eq(assignments.ticketId, ticket.id), isNull(assignments.endedAt)),
        );
      if (!assignment) {
        throw new Error(`Ticket ${ticket.id} has no active assignment.`);
      }

      const [attempt] = await tx
        .insert(completionSubmissions)
        .values({
          tenantId: ticket.tenantId,
          ticketId: ticket.id,
          assignmentId: assignment.id,
          note: command.note,
          submittedBy: command.actor.userId,
        })
        .returning({ id: completionSubmissions.id });
      if (!attempt) throw new Error("Completion insert returned nothing.");

      await tx.insert(uploads).values(
        command.photos.map((photo) => ({
          tenantId: ticket.tenantId,
          objectKey: photo.objectKey,
          contentType: photo.contentType,
          bytes: photo.bytes,
          sha256: photo.sha256,
          purpose: "completion_proof" as const,
          state: "ready" as const,
          completionId: attempt.id,
          uploadedBy: command.actor.userId,
        })),
      );
    },
  });
}

export function decideCompletion(
  db: Db,
  command: WorkCommand & { decision: "accepted" | "rejected"; reason: string },
) {
  const provided: Requirement[] = command.reason.trim() ? ["reason"] : [];

  return transitionTicket(db, {
    tenantId: command.tenantId,
    ticketId: command.ticketId,
    actor: command.actor,
    expectedRevision: command.expectedRevision,
    to:
      command.decision === "accepted"
        ? "verified_closed"
        : "rejected_with_reason",
    provided,
    payload: { decision: command.decision, reason: command.reason },
    apply: async function recordDecision(tx, ticket) {
      const [attempt] = await tx
        .update(completionSubmissions)
        .set({ status: command.decision })
        .where(
          and(
            eq(completionSubmissions.ticketId, ticket.id),
            eq(completionSubmissions.status, "pending"),
          ),
        )
        .returning({ id: completionSubmissions.id });
      if (!attempt) {
        throw new Error(`Ticket ${ticket.id} has no pending completion.`);
      }

      await tx.insert(verifications).values({
        tenantId: ticket.tenantId,
        completionId: attempt.id,
        decision: command.decision,
        reason: command.reason,
        verifierId: command.actor.userId,
      });
    },
  });
}
