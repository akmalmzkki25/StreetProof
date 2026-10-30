import type { QueueItem } from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";
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

import { categoryLabel, STATUS_LABELS } from "../labels";

export function TicketTable({
  items,
  emptyMessage,
}: {
  items: QueueItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-80 truncate">
              <Link
                href={`/app/tickets/${item.id}`}
                className="underline-offset-4 hover:underline"
              >
                {item.title}
              </Link>
              {item.linkedCount > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {item.linkedCount === 1
                    ? "1 linked report"
                    : `${item.linkedCount} linked reports`}
                </p>
              ) : null}
              {item.hasUnreviewedAnswer ? (
                <p className="text-xs text-brand-text">Reporter answered</p>
              ) : null}
            </TableCell>
            <TableCell>{item.location ?? "Not set"}</TableCell>
            <TableCell>
              <Badge
                variant={item.status === "submitted" ? "brand" : "outline"}
              >
                {STATUS_LABELS[item.status]}
              </Badge>
            </TableCell>
            <TableCell>{categoryLabel(item.category) ?? "Not set"}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(item.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
