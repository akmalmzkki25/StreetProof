import { getDb, getTicketDetail } from "@streetproof/db";
import { canViewTicket } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import { cn } from "@streetproof/ui/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import {
  AiDraftPanel,
  readDraft,
} from "@/features/tickets/components/ai-draft-panel";
import { ClarificationList } from "@/features/tickets/components/clarification-list";
import {
  LinkAsDuplicate,
  NextStep,
} from "@/features/tickets/components/next-step";
import {
  Attempts,
  DuplicateOf,
  LinkedReports,
  Reports,
  Reviewed,
  Timeline,
} from "@/features/tickets/components/ticket-sections";
import { STATUS_LABELS, statusBadgeVariant } from "@/features/tickets/labels";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = { title: "Ticket" };

export default function TicketPage({ params }: PageProps<"/app/tickets/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Ticket idPromise={params.then((value) => value.id)} />
      </Suspense>
    </main>
  );
}

async function Ticket({ idPromise }: { idPromise: Promise<string> }) {
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

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge
          variant={statusBadgeVariant(ticket.status)}
          className="self-start"
        >
          {STATUS_LABELS[ticket.status]}
        </Badge>
        {/* A report's own words can run long, so not a headline size. */}
        <h1 className="type-lead font-medium">
          {ticket.summary ?? ticket.reports[0]?.description ?? "Ticket"}
        </h1>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <Attempts ticket={ticket} />
          <Reports ticket={ticket} />
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
            member.roles.includes("technician") && "max-lg:order-first",
          )}
        >
          <DuplicateOf ticket={ticket} member={member} />
          <Reviewed ticket={ticket} />
          {ticket.duplicateOf ? null : (
            <NextStep ticket={ticket} member={member} />
          )}
          <LinkAsDuplicate ticket={ticket} member={member} />
        </aside>
      </div>
    </div>
  );
}
