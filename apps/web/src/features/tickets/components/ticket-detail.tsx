import {
  errorFields,
  getDb,
  getTicketDetail,
  logEvent,
  recordAudit,
} from "@streetproof/db";
import { canViewTicket } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import { cn } from "@streetproof/ui/lib/utils";
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
  InternalNotes,
  LinkedReports,
  Reports,
  Reviewed,
  Timeline,
} from "./ticket-sections";

// One ticket, for the full page and the drawer. Its two columns collapse to one
// whenever its container is narrow, so the drawer needs no layout of its own.
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
      <header className="flex flex-col gap-3">
        <Badge
          variant={statusBadgeVariant(ticket.status)}
          className="self-start"
        >
          {t(STATUS_LABELS[ticket.status])}
        </Badge>
        {/* A report's own words can run long, so not a headline size. */}
        <h2 className="type-lead font-medium">
          {ticket.summary ?? ticket.reports[0]?.description ?? t("Ticket")}
        </h2>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 @4xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <Attempts ticket={ticket} member={member} />
          <Reports ticket={ticket} member={member} />
          <ClarificationList ticket={ticket} />
          <LinkedReports ticket={ticket} member={member} />
          {member.roles.includes("operator") &&
          (!ticket.duplicateOf || readDraft(ticket)) ? (
            <AiDraftPanel ticket={ticket} />
          ) : null}
          <Timeline ticket={ticket} />
        </div>
        {/* In the field, a technician's next step comes before the history. */}
        <aside
          className={cn(
            "flex min-w-0 flex-col gap-6",
            member.roles.includes("technician") && "@max-4xl:order-first",
          )}
        >
          <DuplicateOf ticket={ticket} member={member} />
          <Reviewed ticket={ticket} />
          {ticket.duplicateOf ? null : (
            <NextStep ticket={ticket} member={member} />
          )}
          <LinkAsDuplicate ticket={ticket} member={member} />
          <InternalNotes ticket={ticket} />
        </aside>
      </div>
    </div>
  );
}
