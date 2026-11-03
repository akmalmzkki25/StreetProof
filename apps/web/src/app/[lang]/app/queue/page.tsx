import { getDb, listIntakeSites, listQueue } from "@streetproof/db";
import { isOverdue } from "@streetproof/domain";
import { buttonVariants } from "@streetproof/ui/components/button";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Link } from "@/components/locale-link";
import { Suspense } from "react";

import { KpiCards } from "@/components/kpi-cards";
import { PageHeader } from "@/components/page-header";
import { QueueFilters } from "@/features/tickets/components/queue-filters";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import {
  readQueueFilters,
  toQueueFilter,
  type QueueFilters as Filters,
} from "@/features/tickets/queue-params";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Operator queue" };

export default function QueuePage({
  searchParams,
}: PageProps<"/[lang]/app/queue">) {
  return (
    <>
      <PageHeader title="Operator queue" />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-64 sm:m-6" />}>
          <Queue
            filters={searchParams.then(readQueueFilters)}
            query={searchParams.then(exportQuery)}
          />
        </Suspense>
      </main>
    </>
  );
}

// The same filters, carried to the export, so the file matches the screen.
function exportQuery(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const key of ["q", "status", "category", "priority"]) {
    const value = params[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

async function Queue({
  filters,
  query,
}: {
  filters: Promise<Filters>;
  query: Promise<string>;
}) {
  const member = await requireRole("operator");
  const { t } = await getI18n();
  const current = await filters;
  const { search, status, category, priority } = current;
  const isFiltered = Boolean(search || status || category || priority);

  const db = getDb();
  const scope = { tenantId: member.tenantId, siteIds: member.siteIds };
  const [items, intakeSites] = await Promise.all([
    listQueue(db, scope, toQueueFilter(current)),
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
        <div className="flex flex-wrap items-center gap-3">
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
          {/* A file download, so a plain link rather than client navigation. */}
          <a
            href={`/api/tickets/export${await query}`}
            download
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {t("Export CSV")}
          </a>
        </div>
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
