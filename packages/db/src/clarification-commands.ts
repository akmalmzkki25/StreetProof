import { and, asc, eq, gt, isNull, sql } from "drizzle-orm";
import type { Db } from "./client";
import { hashReporterToken } from "./reporter-token";
import {
  clarifications,
  outbox,
  reporterCredentials,
  reports,
  ticketEvents,
  tickets,
} from "./schema";
import {
  nextEventSeq,
  transitionTicket,
  type TransitionOutcome,
  type WorkCommand,
} from "./ticket-commands";

export function requestClarification(
  db: Db,
  command: WorkCommand & { question: string },
) {
  return transitionTicket(db, {
    tenantId: command.tenantId,
    ticketId: command.ticketId,
    actor: command.actor,
    to: "needs_clarification",
    expectedRevision: command.expectedRevision,
    provided: command.question.trim() ? ["reason"] : [],
    payload: { reason: command.question },
    apply: async function openQuestion(tx, ticket) {
      const [report] = await tx
        .select({ id: reports.id })
        .from(reports)
        .where(eq(reports.canonicalTicketId, ticket.id))
        .orderBy(asc(reports.createdAt))
        .limit(1);
      if (!report) throw new Error(`Ticket ${ticket.id} has no report.`);

      await tx.insert(clarifications).values({
        tenantId: ticket.tenantId,
        ticketId: ticket.id,
        reportId: report.id,
        question: command.question,
        askedBy: command.actor.userId,
      });
    },
  });
}

export type AnswerOutcome =
  { ok: true; ticketId: string } | { ok: false; code: "unavailable" };

// The only write a receipt can make, and only while its own report has this
// question open. It never touches status or revision: an operator reviews first.
// Every failure looks the same, so a caller learns nothing about what exists.
export async function answerClarification(
  db: Db,
  input: { token: string; clarificationId: string; answer: string },
): Promise<AnswerOutcome> {
  return db.transaction(async function run(tx) {
    const [credential] = await tx
      .select({
        tenantId: reports.tenantId,
        reportId: reports.id,
        ticketId: reports.canonicalTicketId,
      })
      .from(reporterCredentials)
      .innerJoin(reports, eq(reports.id, reporterCredentials.reportId))
      .where(
        and(
          eq(reporterCredentials.tokenHash, hashReporterToken(input.token)),
          isNull(reporterCredentials.revokedAt),
          gt(reporterCredentials.expiresAt, new Date()),
        ),
      );
    if (!credential) return { ok: false, code: "unavailable" };

    const [ticket] = await tx
      .select({ id: tickets.id, status: tickets.status })
      .from(tickets)
      .where(eq(tickets.id, credential.ticketId))
      .for("update");
    if (ticket?.status !== "needs_clarification") {
      return { ok: false, code: "unavailable" };
    }

    const answered = await tx
      .update(clarifications)
      .set({ answer: input.answer, answeredAt: new Date() })
      .where(
        and(
          eq(clarifications.id, input.clarificationId),
          eq(clarifications.reportId, credential.reportId),
          isNull(clarifications.answer),
          isNull(clarifications.closedAt),
        ),
      )
      .returning({ id: clarifications.id });
    if (answered.length === 0) return { ok: false, code: "unavailable" };

    await tx
      .update(tickets)
      .set({ updatedAt: new Date() })
      .where(eq(tickets.id, ticket.id));
    await tx.insert(ticketEvents).values({
      tenantId: credential.tenantId,
      ticketId: ticket.id,
      seq: await nextEventSeq(tx, ticket.id),
      type: "clarification_answered",
      payload: { clarificationId: input.clarificationId },
    });
    await tx.insert(outbox).values({
      tenantId: credential.tenantId,
      topic: "report.clarified",
      payload: {
        ticketId: ticket.id,
        reportId: credential.reportId,
        clarificationId: input.clarificationId,
      },
    });

    return { ok: true, ticketId: ticket.id };
  });
}

// An answer closes the question and asks for a new draft that includes it. With
// no answer the operator must say why they're going on without one.
export async function resumeAfterClarification(
  db: Db,
  command: WorkCommand & { reason: string | null },
): Promise<TransitionOutcome> {
  const [open] = await db
    .select({ answer: clarifications.answer })
    .from(clarifications)
    .where(
      and(
        eq(clarifications.tenantId, command.tenantId),
        eq(clarifications.ticketId, command.ticketId),
        isNull(clarifications.closedAt),
      ),
    );
  // An answer can only arrive after this read, which never makes the reason wrong.
  if (open && open.answer === null && !command.reason) {
    return {
      ok: false,
      rejection: { code: "missing_requirements", missing: ["reason"] },
    };
  }

  return transitionTicket(db, {
    tenantId: command.tenantId,
    ticketId: command.ticketId,
    actor: command.actor,
    to: "submitted",
    expectedRevision: command.expectedRevision,
    provided: [],
    payload: command.reason ? { reason: command.reason } : {},
    apply: async function closeQuestion(tx, ticket) {
      const [closed] = await tx
        .update(clarifications)
        .set({ closedAt: new Date() })
        .where(
          and(
            eq(clarifications.ticketId, ticket.id),
            isNull(clarifications.closedAt),
          ),
        )
        .returning({
          reportId: clarifications.reportId,
          answer: clarifications.answer,
        });
      if (!closed || closed.answer === null) return;

      const [report] = await tx
        .update(reports)
        .set({ revision: sql`${reports.revision} + 1` })
        .where(eq(reports.id, closed.reportId))
        .returning({ revision: reports.revision });
      await tx.insert(outbox).values({
        tenantId: ticket.tenantId,
        topic: "report.submitted",
        payload: {
          reportId: closed.reportId,
          ticketId: ticket.id,
          inputRevision: report?.revision,
        },
      });
    },
  });
}
