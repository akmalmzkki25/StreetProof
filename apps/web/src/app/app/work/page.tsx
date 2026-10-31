import { getDb, listQueue } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { TicketTable } from "@/features/tickets/components/ticket-table";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "My work" };

export default async function WorkPage() {
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <h1 className="type-headline">{t("My work")}</h1>
      <Suspense fallback={<Skeleton className="h-64" />}>
        <AssignedWork />
      </Suspense>
    </main>
  );
}

async function AssignedWork() {
  const member = await requireRole("technician");
  const items = await listQueue(
    getDb(),
    { tenantId: member.tenantId, siteIds: member.siteIds },
    {
      assigneeId: member.userId,
      statuses: [
        "assigned",
        "accepted",
        "in_progress",
        "waiting_for_parts",
        "waiting_for_access",
        "completion_submitted",
        "rejected_with_reason",
        "reopened",
      ],
    },
  );

  return (
    <TicketTable
      items={items}
      emptyTitle="Nothing assigned to you"
      emptyMessage="Work appears here when an operator assigns it to you."
    />
  );
}
