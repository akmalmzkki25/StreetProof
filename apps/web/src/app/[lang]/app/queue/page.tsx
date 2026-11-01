import { getDb, listIntakeSites, listQueue } from "@streetproof/db";
import {
  isOverdue,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@streetproof/domain";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Link } from "@/components/locale-link";
import { Suspense } from "react";

import { KpiCards } from "@/components/kpi-cards";
import { PageHeader } from "@/components/page-header";
import { QueueFilters } from "@/features/tickets/components/queue-filters";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Operator queue" };

type SearchParams = Record<string, string | string[] | undefined>;

// Anything not on the list, like "any" or a hand-edited URL, means no filter.
function oneOf<T extends string>(value: unknown, allowed: readonly T[]) {
  return allowed.find((item) => item === value) ?? null;
}

function readFilters(params: SearchParams) {
  return {
    search: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "",
    status: oneOf<TicketStatus>(params.status, TICKET_STATUSES),
    category: oneOf<string>(params.category, TICKET_CATEGORIES),
    priority: oneOf<TicketPriority>(params.priority, TICKET_PRIORITIES),
  };
}

export default function QueuePage({ searchParams }: PageProps<"/[lang]/app/queue">) {
  return (
    <>
      <PageHeader title="Operator queue" />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-64 sm:m-6" />}>
          <Queue filters={searchParams.then(readFilters)} />
        </Suspense>
      </main>
    </>
  );
}

async function Queue({
  filters,
}: {
  filters: Promise<ReturnType<typeof readFilters>>;
}) {
  const member = await requireRole("operator");
  const { t } = await getI18n();
  const { search, status, category, priority } = await filters;
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

  const now = new Date();

  return (
    <>
      <KpiCards
        items={[
          { label: "Tickets in view", value: items.length },
          {
            label: "Awaiting triage",
            value: items.filter((item) => item.status === "submitted").length,
          },
          {
            label: "Overdue",
            value: items.filter((item) => isOverdue(item, now)).length,
          },
          {
            label: "Urgent",
            value: items.filter((item) => item.priority === "urgent").length,
          },
        ]}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <QueueFilters
          search={search}
          status={status}
          category={category}
          priority={priority}
        />
        {intakeSites.length > 0 ? (
          <p className="type-caption text-muted-foreground">
            {t("Report forms:")}{" "}
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
      </div>
      <TicketTable
        items={items}
        emptyTitle={isFiltered ? "No matching tickets" : "No reports yet"}
        emptyMessage={
          isFiltered
            ? "Try fewer filters or different words."
            : "New reports appear here as soon as they're sent."
        }
      />
    </>
  );
}
