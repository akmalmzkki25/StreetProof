import {
  canVerifyAttempt,
  checklistResults,
  completionProofProblem,
  type Requirement,
} from "@streetproof/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import type { Db } from "./client";
import type { ReportPhoto } from "./reports";
import {
  assignments,
  completionSubmissions,
  tickets,
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

// Photos are stored before this runs. Without the category's checklist and a
// photo, or a reason for a supervisor to decide on, the domain guard rejects the
// transition. A failed upload never reaches here, so it can't count as proof.
export async function submitCompletion(
  db: Db,
  command: WorkCommand & {
    note: string;
    photos: readonly ReportPhoto[];
    checkedItemIds: readonly string[];
    exceptionReason: string | null;
  },
) {
  const [ticket] = await db
    .select({ category: tickets.category })
    .from(tickets)
    .where(
      and(
        eq(tickets.tenantId, command.tenantId),
        eq(tickets.id, command.ticketId),
      ),
    );
  const category = ticket?.category ?? null;
  const exceptionReason = command.exceptionReason?.trim() || null;
  const provided: Requirement[] = completionProofProblem({
    category,
    checkedIds: command.checkedItemIds,
    photoCount: command.photos.length,
    exceptionReason,
  })
    ? []
    : ["completion_proof"];

  return transitionTicket(db, {
    tenantId: command.tenantId,
    ticketId: command.ticketId,
    actor: command.actor,
    expectedRevision: command.expectedRevision,
    to: "completion_submitted",
    provided,
    payload: { hasProofException: exceptionReason !== null },
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
          checklist: checklistResults(category, command.checkedItemIds),
          exceptionReason,
          submittedBy: command.actor.userId,
        })
        .returning({ id: completionSubmissions.id });
      if (!attempt) throw new Error("Completion insert returned nothing.");

      if (command.photos.length === 0) return;
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

export async function decideCompletion(
  db: Db,
  command: WorkCommand & { decision: "accepted" | "rejected"; reason: string },
) {
  const [proof] = await db
    .select({ photoCount: count(uploads.id) })
    .from(completionSubmissions)
    .leftJoin(
      uploads,
      and(
        eq(uploads.completionId, completionSubmissions.id),
        eq(uploads.state, "ready"),
      ),
    )
    .where(
      and(
        eq(completionSubmissions.ticketId, command.ticketId),
        eq(completionSubmissions.status, "pending"),
      ),
    );
  const provided: Requirement[] = [
    ...(command.reason.trim() ? (["reason"] as const) : []),
    ...(canVerifyAttempt({ photoCount: proof?.photoCount ?? 0 })
      ? (["ready_evidence"] as const)
      : []),
  ];

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
