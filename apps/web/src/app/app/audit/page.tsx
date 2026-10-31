import { getDb, listAuditLog } from "@streetproof/db";
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

import { auditLabel } from "@/features/members/labels";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Audit log" };

export default function AuditPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="type-headline">Audit log</h1>
        <p className="type-caption text-muted-foreground">
          The latest 200 sign-ins, account changes and ticket views. Changes to
          a ticket itself are in that ticket&apos;s history.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <AuditEntries />
      </Suspense>
    </main>
  );
}

async function AuditEntries() {
  const member = await requireRole("tenant_admin");
  const entries = await listAuditLog(getDb(), member.tenantId);

  if (entries.length === 0) {
    return <p className="text-muted-foreground">Nothing recorded yet.</p>;
  }

  return (
    <div className="rounded-4xl bg-card p-2 shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Who</TableHead>
            <TableHead>What</TableHead>
            <TableHead className="hidden sm:table-cell">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.actorName ?? "Removed account"}</TableCell>
              <TableCell className="whitespace-normal">
                {entry.targetType === "ticket" && entry.targetId ? (
                  <Link
                    href={`/app/tickets/${entry.targetId}`}
                    className="text-brand-text underline underline-offset-4"
                  >
                    {auditLabel(entry.action)}
                  </Link>
                ) : (
                  auditLabel(entry.action)
                )}
                <p className="font-mono text-xs text-muted-foreground sm:hidden">
                  {formatDateTime(entry.createdAt)}
                </p>
              </TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                {formatDateTime(entry.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
