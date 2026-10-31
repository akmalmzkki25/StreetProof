import { TaskDaily01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { QueueItem } from "@streetproof/db";
import { isOverdue } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@streetproof/ui/components/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@streetproof/ui/components/table";
import Link from "next/link";

import { formatDateTime } from "@/lib/format";

import { getI18n } from "@/lib/i18n/server";

import { categoryLabel, STATUS_LABELS, statusBadgeVariant } from "../labels";

async function DueDate({ item }: { item: QueueItem & { dueAt: Date | null } }) {
  if (!item.dueAt) return null;
  const { t, locale } = await getI18n();
  const date = formatDateTime(item.dueAt, locale);
  if (!isOverdue(item, new Date())) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("Due {date}", { date })}
      </p>
    );
  }
  return (
    <p className="text-xs text-destructive">
      {t("Overdue since {date}", { date })}
    </p>
  );
}

export async function TicketTable({
  items,
  emptyTitle,
  emptyMessage,
}: {
  items: QueueItem[];
  emptyTitle: string;
  emptyMessage: string;
}) {
  const { t, locale } = await getI18n();
  if (items.length === 0) {
    return (
      <Empty className="flex-none rounded-4xl bg-card shadow-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={TaskDaily01Icon} />
          </EmptyMedia>
          <EmptyTitle>{t(emptyTitle)}</EmptyTitle>
          <EmptyDescription>{t(emptyMessage)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-4xl bg-card p-2 shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Report")}</TableHead>
            <TableHead className="hidden sm:table-cell">
              {t("Location")}
            </TableHead>
            <TableHead>{t("Status")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("Category")}
            </TableHead>
            <TableHead className="hidden md:table-cell">{t("Sent")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="min-w-32 whitespace-normal">
                <Link
                  href={`/app/tickets/${item.id}`}
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
                      : t("{count} linked reports", {
                          count: item.linkedCount,
                        })}
                  </p>
                ) : null}
                {item.hasUnreviewedAnswer ? (
                  <p className="text-xs text-brand-text">
                    {t("Reporter answered")}
                  </p>
                ) : null}
                {item.teamName ? (
                  <p className="text-xs text-muted-foreground">
                    {item.teamName}
                  </p>
                ) : null}
                {item.dueAt ? <DueDate item={item} /> : null}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {item.location ?? t("Not set")}
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(item.status)}>
                  {t(STATUS_LABELS[item.status])}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {t(categoryLabel(item.category) ?? "Not set")}
              </TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                {formatDateTime(item.createdAt, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
