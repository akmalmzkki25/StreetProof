import { getDb, listIntakeSites, listQueue } from "@streetproof/db";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@streetproof/domain";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { QueueFilters } from "@/features/tickets/components/queue-filters";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Operator queue" };

type SearchParams = Record<string, string | string[] | undefined>;

// Anything not on the list, like "any" or a hand-edited URL, means no filter.
function oneOf<T extends string>(value: unknown, allowed: readonly T[]) {
  return allowed.find((item) => item === value) ?? null;
}

export default function QueuePage({ searchParams }: PageProps<"/app/queue">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <h1 className="type-headline">Operator queue</h1>
      <Suspense fallback={<Skeleton className="h-64" />}>
        <Queue searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Queue({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const member = await requireRole("operator");
  const params = await searchParams;
  const search =
    typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status = oneOf<TicketStatus>(params.status, TICKET_STATUSES);
  const category = oneOf<string>(params.category, TICKET_CATEGORIES);
  const priority = oneOf<TicketPriority>(params.priority, TICKET_PRIORITIES);
  const isFiltered = Boolean(search || status || category || priority);

  const db = getDb();
  const scope = { tenantId: member.tenantId, siteIds: member.siteIds };
  const [items, intakeSites] = await Promise.all([
    listQueue(db, scope, {
      ...(search ? { search } : {}),
      ...(status ? { statuses: [status] } : {}),
      ...(category ? { category } : {}),
      ...(priority ? { priority } : {}),
    }),
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
      <QueueFilters
        // Remounts on navigation, so the fields match the URL after Clear.
        key={`${search}|${status}|${category}|${priority}`}
        search={search}
        status={status}
        category={category}
        priority={priority}
      />
      <TicketTable
        items={items}
        emptyTitle={isFiltered ? "No matching tickets" : "No reports yet"}
        emptyMessage={
          isFiltered
            ? "Try fewer filters or different words."
            : "New reports appear here as soon as they're sent."
        }
      />
    </div>
  );
}
