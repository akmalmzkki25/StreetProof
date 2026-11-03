import {
  errorFields,
  getDb,
  getTicketDetail,
  logEvent,
  recordAudit,
} from "@streetproof/db";
import { canViewTicket } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import { getI18n } from "@/lib/i18n/server";
import { requireMember } from "@/lib/member";

import { STATUS_LABELS, statusBadgeVariant } from "../labels";
import { AiDraftPanel, readDraft } from "./ai-draft-panel";
import { ClarificationList } from "./clarification-list";
import { LinkAsDuplicate, NextStep } from "./next-step";
import {
  Attempts,
  DuplicateOf,
  Facts,
  InternalNotes,
  LinkedReports,
  Reports,
  Timeline,
  Where,
} from "./ticket-sections";

// One ticket, for the full page and the drawer: a single column that fits either.
export async function TicketDetail({
  idPromise,
}: {
  idPromise: Promise<string>;
}) {
  const member = await requireMember();
  const id = z.uuid().safeParse(await idPromise);
  if (!id.success) notFound();

  const ticket = await getTicketDetail(
    getDb(),
    { tenantId: member.tenantId, siteIds: member.siteIds },
    id.data,
  );
  if (!ticket) notFound();
  if (!canViewTicket(ticket, { userId: member.userId, roles: member.roles })) {
    notFound();
  }

  const { t } = await getI18n();

  // After the response, so a page view never waits on or fails because of its log.
  after(async function logView() {
    try {
      await recordAudit(getDb(), {
        tenantId: member.tenantId,
        actorId: member.userId,
        action: "ticket.viewed",
        targetType: "ticket",
        targetId: ticket.id,
      });
    } catch (error) {
      logEvent("error", "Audit entry failed", errorFields(error));
    }
  });

  return (
    <div className="@container flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Badge
          variant={statusBadgeVariant(ticket.status)}
          className="self-start"
        >
          {t(STATUS_LABELS[ticket.status])}
        </Badge>
        <h2 className="text-3xl/[1.15] font-medium tracking-[-0.022em] text-balance">
          {ticket.summary ?? ticket.reports[0]?.description ?? t("Ticket")}
        </h2>
      </header>

      <DuplicateOf ticket={ticket} member={member} />
      {ticket.duplicateOf ? null : <NextStep ticket={ticket} member={member} />}
      <LinkAsDuplicate ticket={ticket} member={member} />
      <Facts ticket={ticket} />
      <Attempts ticket={ticket} member={member} />
      <Reports ticket={ticket} member={member} />
      <ClarificationList ticket={ticket} />
      <LinkedReports ticket={ticket} member={member} />
      <Where ticket={ticket} />
      {member.roles.includes("operator") &&
      (!ticket.duplicateOf || readDraft(ticket)) ? (
        <AiDraftPanel ticket={ticket} />
      ) : null}
      <InternalNotes ticket={ticket} />
      <Timeline ticket={ticket} />
    </div>
  );
}
