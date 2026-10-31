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
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage() {
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="type-headline">{t("Audit log")}</h1>
        <p className="type-caption text-muted-foreground">
          {t(
            "The latest 200 sign-ins, account changes and ticket views. Changes to a ticket itself are in that ticket's history.",
          )}
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
  const { t, locale } = await getI18n();
  const entries = await listAuditLog(getDb(), member.tenantId);

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground">{t("Nothing recorded yet.")}</p>
    );
  }

  return (
    <div className="rounded-4xl bg-card p-2 shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Who")}</TableHead>
            <TableHead>{t("What")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("When")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.actorName ?? t("Removed account")}</TableCell>
              <TableCell className="whitespace-normal">
                {entry.targetType === "ticket" && entry.targetId ? (
                  <Link
                    href={`/app/tickets/${entry.targetId}`}
                    className="text-brand-text underline underline-offset-4"
                  >
                    {t(auditLabel(entry.action))}
                  </Link>
                ) : (
                  t(auditLabel(entry.action))
                )}
                <p className="font-mono text-xs text-muted-foreground sm:hidden">
                  {formatDateTime(entry.createdAt, locale)}
                </p>
              </TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                {formatDateTime(entry.createdAt, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
