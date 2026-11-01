import { getDb, listQueue } from "@streetproof/db";
import { isOverdue } from "@streetproof/domain";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@streetproof/ui/components/tabs";
import type { Metadata } from "next";
import { Suspense } from "react";

import { KpiCards } from "@/components/kpi-cards";
import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <>
      <PageHeader title="Reviews" />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-64 sm:m-6" />}>
          <Reviews />
        </Suspense>
      </main>
    </>
  );
}

async function Reviews() {
  const member = await requireRole("supervisor");
  const { t } = await getI18n();
  const db = getDb();
  const scope = { tenantId: member.tenantId, siteIds: member.siteIds };
  const [pending, closed] = await Promise.all([
    listQueue(db, scope, { statuses: ["completion_submitted"] }),
    listQueue(db, scope, { statuses: ["verified_closed"] }),
  ]);

  const now = new Date();

  return (
    <>
      <KpiCards
        items={[
          { label: "Awaiting your verification", value: pending.length },
          { label: "Verified closed", value: closed.length },
          {
            label: "Overdue",
            value: pending.filter((item) => isOverdue(item, now)).length,
          },
        ]}
      />
      <Tabs defaultValue="pending" className="gap-0">
        <div className="border-b px-4 py-3 sm:px-6">
          <TabsList>
            <TabsTrigger value="pending">
              {t("Awaiting your verification")}
              <span className="text-muted-foreground tabular-nums">
                {pending.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="closed">
              {t("Verified closed")}
              <span className="text-muted-foreground tabular-nums">
                {closed.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="pending">
          <TicketTable
            items={pending}
            emptyTitle="Nothing to verify"
            emptyMessage="Work appears here when a technician submits completion proof."
          />
        </TabsContent>
        <TabsContent value="closed">
          <TicketTable
            items={closed}
            emptyTitle="No closed work yet"
            emptyMessage="Tickets you verify move here, and you can reopen them from their page."
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
