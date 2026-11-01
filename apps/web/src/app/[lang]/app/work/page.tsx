import { getDb, listQueue } from "@streetproof/db";
import { isOverdue } from "@streetproof/domain";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { KpiCards } from "@/components/kpi-cards";
import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "My work" };

export default function WorkPage() {
  return (
    <>
      <PageHeader title="My work" />
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

  const now = new Date();

  return (
    <>
      <KpiCards
        items={[
          { label: "Assigned to you", value: items.length },
          {
            label: "In progress",
            value: items.filter((item) => item.status === "in_progress").length,
          },
          {
            label: "Waiting",
            value: items.filter(
              (item) =>
                item.status === "waiting_for_parts" ||
                item.status === "waiting_for_access",
            ).length,
          },
          {
            label: "Overdue",
            value: items.filter((item) => isOverdue(item, now)).length,
          },
        ]}
      />
      <TicketTable
        items={items}
        emptyTitle="Nothing assigned to you"
        emptyMessage="Work appears here when an operator assigns it to you."
      />
    </>
  );
}
