import { getDb, listIntakeSites, listQueue } from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@streetproof/ui/components/table";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { categoryLabel, STATUS_LABELS } from "@/features/tickets/labels";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Operator queue" };

export default function QueuePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-4 py-12 md:px-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/app"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Workspace
        </Link>
        <h1 className="text-2xl">Operator queue</h1>
      </div>
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
        <p className="text-sm text-muted-foreground">
          Report forms:{" "}
          {intakeSites.map((site) => (
            <Link
              key={site.id}
              href={`/report/${site.intakeCode}`}
              className="text-foreground underline underline-offset-4"
            >
              {site.name}
            </Link>
          ))}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          No reports yet. New reports appear here as soon as they&apos;re sent.
        </p>
      ) : (
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
                </TableCell>
                <TableCell>{item.location ?? "Not set"}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === "submitted" ? "brand" : "outline"}
                  >
                    {STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {categoryLabel(item.category) ?? "Not set"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
