import { getDb, listIntakeSites, listQueue } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { TicketTable } from "@/features/tickets/components/ticket-table";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Operator queue" };

export default function QueuePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <h1 className="type-headline">Operator queue</h1>
      <Suspense fallback={<Skeleton className="h-64" />}>
        <Queue />
      </Suspense>
    </main>
  );
}

async function Queue() {
  const member = await requireRole("operator");
  const db = getDb();
  const scope = { tenantId: member.tenantId, siteIds: member.siteIds };
  const [items, intakeSites] = await Promise.all([
    listQueue(db, scope),
    listIntakeSites(db, scope),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {intakeSites.length > 0 ? (
        <p className="type-caption text-muted-foreground">
          Report forms:{" "}
          {intakeSites.map((site) => (
            <Link
              key={site.id}
              href={`/report/${site.intakeCode}`}
              className="text-brand-text underline underline-offset-4"
            >
              {site.name}
            </Link>
          ))}
        </p>
      ) : null}
      <TicketTable
        items={items}
        emptyTitle="No reports yet"
        emptyMessage="New reports appear here as soon as they're sent."
      />
    </div>
  );
}
