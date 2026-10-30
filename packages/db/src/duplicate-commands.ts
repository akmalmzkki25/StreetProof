import {
  canManageDuplicates,
  duplicateLinkProblem,
  type DuplicateLinkProblem,
  type Role,
} from "@streetproof/domain";
import { and, eq } from "drizzle-orm";
import type { Db, Transaction } from "./client";
import { duplicateLinks, outbox, ticketEvents, tickets } from "./schema";
import { nextEventSeq } from "./ticket-commands";

export type DuplicateOutcome =
  | { ok: true }
  | {
      ok: false;
      rejection:
        | { code: "not_found" }
        | { code: "forbidden_role" }
        | { code: "missing_reason" }
        | { code: "stale_revision"; currentRevision: number }
        | { code: "link_problem"; problem: DuplicateLinkProblem };
    };

type DuplicateCommand = {
  tenantId: string;
  sourceTicketId: string;
  actor: { userId: string; roles: readonly Role[] };
  expectedRevision: number;
  reason: string;
};

type Ticket = typeof tickets.$inferSelect;

// Always in ID order, so two commands touching the same pair can't deadlock.
async function lockPair(
  tx: Transaction,
  tenantId: string,
  sourceId: string,
  targetId: string,
) {
  const locked = new Map<string, Ticket>();
  for (const id of [sourceId, targetId].sort()) {
    const [ticket] = await tx
      .select()
      .from(tickets)
      .where(and(eq(tickets.tenantId, tenantId), eq(tickets.id, id)))
      .for("update");
    if (ticket) locked.set(id, ticket);
  }
  return { source: locked.get(sourceId), target: locked.get(targetId) };
}

async function linkFlags(tx: Transaction, ticketId: string) {
  const [outgoing] = await tx
    .select({ id: duplicateLinks.id })
    .from(duplicateLinks)
    .where(
      and(
        eq(duplicateLinks.sourceTicketId, ticketId),
        eq(duplicateLinks.active, true),
      ),
    );
  const [incoming] = await tx
    .select({ id: duplicateLinks.id })
    .from(duplicateLinks)
    .where(
      and(
        eq(duplicateLinks.targetTicketId, ticketId),
        eq(duplicateLinks.active, true),
      ),
    );
  return { isDuplicate: Boolean(outgoing), hasDuplicates: Boolean(incoming) };
}

// Only the source's revision moves: its allowed actions change. The target's
// work is untouched, so people working on it keep a valid revision.
async function recordChange(
  tx: Transaction,
  command: DuplicateCommand,
  source: Ticket,
  target: Ticket,
  type: "duplicate_linked" | "duplicate_unlinked",
) {
  const revision = source.revision + 1;
  await tx.update(tickets).set({ revision }).where(eq(tickets.id, source.id));

  for (const [ticket, otherTicketId, role] of [
    [source, target.id, "source"],
    [target, source.id, "target"],
  ] as const) {
    await tx.insert(ticketEvents).values({
      tenantId: ticket.tenantId,
      ticketId: ticket.id,
      seq: await nextEventSeq(tx, ticket.id),
      type,
      actorId: command.actor.userId,
      payload: { otherTicketId, role, reason: command.reason },
    });
  }

  await tx.insert(outbox).values({
    tenantId: source.tenantId,
    topic: `ticket.${type}`,
    payload: {
      ticketId: source.id,
      targetTicketId: target.id,
      revision,
      reason: command.reason,
    },
  });
}

function commonRejection(
  command: DuplicateCommand,
  source: Ticket,
): DuplicateOutcome | null {
  if (!canManageDuplicates(command.actor.roles)) {
    return { ok: false, rejection: { code: "forbidden_role" } };
  }
  if (command.expectedRevision !== source.revision) {
    return {
      ok: false,
      rejection: { code: "stale_revision", currentRevision: source.revision },
    };
  }
  if (!command.reason.trim()) {
    return { ok: false, rejection: { code: "missing_reason" } };
  }
  return null;
}

// A link is a relationship. Reports, proof and the source ticket all stay, and
// unlinking restores the source exactly as it was.
export async function linkDuplicate(
  db: Db,
  command: DuplicateCommand & { targetTicketId: string },
): Promise<DuplicateOutcome> {
  return db.transaction(async function run(tx) {
    const { source, target } = await lockPair(
      tx,
      command.tenantId,
      command.sourceTicketId,
      command.targetTicketId,
    );
    if (!source || !target) {
      return { ok: false, rejection: { code: "not_found" } };
    }

    const rejected = commonRejection(command, source);
    if (rejected) return rejected;

    const problem = duplicateLinkProblem(
      { ...source, ...(await linkFlags(tx, source.id)) },
      { ...target, ...(await linkFlags(tx, target.id)) },
    );
    if (problem) {
      return { ok: false, rejection: { code: "link_problem", problem } };
    }

    await tx.insert(duplicateLinks).values({
      tenantId: command.tenantId,
      sourceTicketId: source.id,
      targetTicketId: target.id,
      reason: command.reason,
      actorId: command.actor.userId,
    });
    await recordChange(tx, command, source, target, "duplicate_linked");
    return { ok: true };
  });
}

export async function unlinkDuplicate(
  db: Db,
  command: DuplicateCommand,
): Promise<DuplicateOutcome> {
  return db.transaction(async function run(tx) {
    const [link] = await tx
      .select()
      .from(duplicateLinks)
      .where(
        and(
          eq(duplicateLinks.tenantId, command.tenantId),
          eq(duplicateLinks.sourceTicketId, command.sourceTicketId),
          eq(duplicateLinks.active, true),
        ),
      );
    if (!link) return { ok: false, rejection: { code: "not_found" } };

    const { source, target } = await lockPair(
      tx,
      command.tenantId,
      link.sourceTicketId,
      link.targetTicketId,
    );
    if (!source || !target) {
      return { ok: false, rejection: { code: "not_found" } };
    }

    const rejected = commonRejection(command, source);
    if (rejected) return rejected;

    const unlinked = await tx
      .update(duplicateLinks)
      .set({ active: false })
      .where(
        and(eq(duplicateLinks.id, link.id), eq(duplicateLinks.active, true)),
      )
      .returning({ id: duplicateLinks.id });
    if (unlinked.length === 0) {
      return { ok: false, rejection: { code: "not_found" } };
    }

    await recordChange(tx, command, source, target, "duplicate_unlinked");
    return { ok: true };
  });
}
