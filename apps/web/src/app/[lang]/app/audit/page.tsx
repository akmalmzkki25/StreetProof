import { getDb, listAuditLog } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { KpiCards } from "@/components/kpi-cards";
import { PageHeader } from "@/components/page-header";
import { AuditView } from "@/features/members/components/audit-view";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Audit log" };

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit log" />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-96 sm:m-6" />}>
          <AuditEntries />
        </Suspense>
      </main>
    </>
  );
}

async function AuditEntries() {
  const member = await requireRole("tenant_admin");
  const { t } = await getI18n();
  const entries = await listAuditLog(getDb(), member.tenantId);

  if (entries.length === 0) {
    return (
      <p className="px-4 py-6 text-muted-foreground sm:px-6">
        {t("Nothing recorded yet.")}
      </p>
    );
  }

  const countOf = (action: string) =>
    entries.filter((entry) => entry.action === action).length;

  return (
    <>
      <KpiCards
        items={[
          { label: "Entries", value: entries.length },
          { label: "Sign-ins", value: countOf("auth.signed_in") },
          { label: "Failed sign-ins", value: countOf("auth.sign_in_failed") },
          { label: "Tickets opened", value: countOf("ticket.viewed") },
        ]}
      />
      <AuditView entries={entries} />
    </>
  );
}
