import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { TicketDetail } from "@/features/tickets/components/ticket-detail";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Ticket" };

export default async function TicketPage({
  params,
}: PageProps<"/app/tickets/[id]">) {
  const { t } = await getI18n();
  return (
    <>
      <PageHeader title={t("Ticket")} />
      <main className="flex w-full flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <TicketDetail idPromise={params.then((value) => value.id)} />
        </Suspense>
      </main>
    </>
  );
}
