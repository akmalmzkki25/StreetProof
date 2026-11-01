import { getDb, listQueue } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "My work" };

export default async function WorkPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageHeader title={t("My work")} />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-64 sm:m-6" />}>
          <AssignedWork />
        </Suspense>
      </main>
    </>
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
