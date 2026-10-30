import { getDb, listQueue } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { TicketTable } from "@/features/tickets/components/ticket-table";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "My work" };

export default function WorkPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-4 py-12 md:px-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/app"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Workspace
        </Link>
        <h1 className="text-2xl">My work</h1>
      </div>
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
      emptyMessage="No work is assigned to you right now."
    />
  );
}
