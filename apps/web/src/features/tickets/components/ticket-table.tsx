"use client";

import { TaskDaily01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { QueueItem } from "@streetproof/db";
import { isOverdue, TICKET_STATUSES } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@streetproof/ui/components/empty";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import { Link, useLocalePath } from "@/components/locale-link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  DataTable,
  dataTableFeatures,
  initialPagination,
  type DataTableFeatures,
} from "@/components/data-table";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";

import { categoryLabel, STATUS_LABELS, statusBadgeVariant } from "../labels";

const column = createColumnHelper<DataTableFeatures, QueueItem>();

// Narrow screens keep the report and its status; the rest folds into the report cell.
const COLUMN_CLASSES: Record<string, string> = {
  report: "min-w-48 whitespace-normal",
  location: "hidden sm:table-cell",
  category: "hidden md:table-cell",
  createdAt: "hidden md:table-cell",
};

function ticketHref(item: QueueItem) {
  return `/app/tickets/${item.id}`;
}

export function TicketTable({
  items,
  emptyTitle,
  emptyMessage,
}: {
  items: QueueItem[];
  emptyTitle: string;
  emptyMessage: string;
}) {
  const { t, locale } = useI18n();
  const toLocalePath = useLocalePath();
  const router = useRouter();

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("title", {
          id: "report",
          header: t("Report"),
          sortFn: "alphanumeric",
          cell: ({ row }) => <ReportCell item={row.original} />,
        }),
        column.accessor((item) => item.location ?? "", {
          id: "location",
          header: t("Location"),
          sortFn: "alphanumeric",
          cell: ({ row }) => row.original.location ?? t("Not set"),
        }),
        column.accessor((item) => TICKET_STATUSES.indexOf(item.status), {
          id: "status",
          sortFn: "basic",
          header: t("Status"),
          cell: ({ row }) => (
            <Badge variant={statusBadgeVariant(row.original.status)}>
              {t(STATUS_LABELS[row.original.status])}
            </Badge>
          ),
        }),
        column.accessor(
          (item) => t(categoryLabel(item.category) ?? "Not set"),
          { id: "category", header: t("Category"), sortFn: "alphanumeric" },
        ),
        column.accessor("createdAt", {
          header: t("Sent"),
          sortFn: "datetime",
          cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
              {formatDateTime(
                row.original.createdAt,
                locale,
                row.original.timeZone,
              )}
            </span>
          ),
        }),
      ]),
    [t, locale],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: items,
    initialState: { pagination: initialPagination },
  });

  return (
    <DataTable
      table={table}
      columnClasses={COLUMN_CLASSES}
      onRowClick={(item) => router.push(toLocalePath(ticketHref(item)))}
      empty={
        <Empty className="flex-none py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={TaskDaily01Icon} />
            </EmptyMedia>
            <EmptyTitle>{t(emptyTitle)}</EmptyTitle>
            <EmptyDescription>{t(emptyMessage)}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
      footer={
        items.length === 1
          ? t("1 ticket in view")
          : t("{count} tickets in view", { count: items.length })
      }
    />
  );
}

function ReportCell({ item }: { item: QueueItem }) {
  const { t, locale } = useI18n();
  return (
    <>
      <Link
        href={ticketHref(item)}
        className="line-clamp-2 font-medium transition-colors hover:text-brand-text focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        {item.title}
      </Link>
      <p className="text-xs text-muted-foreground sm:hidden">
        {item.location ?? t("Location not set")}
      </p>
      {item.linkedCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          {item.linkedCount === 1
            ? t("1 linked report")
            : t("{count} linked reports", { count: item.linkedCount })}
        </p>
      ) : null}
      {item.hasUnreviewedAnswer ? (
        <p className="text-xs text-brand-text">{t("Reporter answered")}</p>
      ) : null}
      {item.teamName ? (
        <p className="text-xs text-muted-foreground">{item.teamName}</p>
      ) : null}
      {item.dueAt ? (
        isOverdue(item, new Date()) ? (
          <p className="text-xs text-destructive">
            {t("Overdue since {date}", {
              date: formatDateTime(item.dueAt, locale, item.timeZone),
            })}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("Due {date}", {
              date: formatDateTime(item.dueAt, locale, item.timeZone),
            })}
          </p>
        )
      ) : null}
    </>
  );
}
