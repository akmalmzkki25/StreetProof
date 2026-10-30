import { getDb, listQueue } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { TicketTable } from "@/features/tickets/components/ticket-table";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <h1 className="type-headline">Reviews</h1>
      <Suspense fallback={<Skeleton className="h-64" />}>
        <Reviews />
      </Suspense>
    </main>
  );
}

async function Reviews() {
  const member = await requireRole("supervisor");
  const db = getDb();
  const scope = { tenantId: member.tenantId, siteIds: member.siteIds };
  const [pending, closed] = await Promise.all([
    listQueue(db, scope, { statuses: ["completion_submitted"] }),
    listQueue(db, scope, { statuses: ["verified_closed"] }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="pending" className="flex flex-col gap-4">
        <h2 id="pending" className="type-title">
          Awaiting your verification
        </h2>
        <TicketTable
          items={pending}
          emptyTitle="Nothing to verify"
          emptyMessage="Work appears here when a technician submits completion proof."
        />
      </section>
      <section aria-labelledby="closed" className="flex flex-col gap-4">
        <h2 id="closed" className="type-title">
          Verified closed
        </h2>
        <TicketTable
          items={closed}
          emptyTitle="No closed work yet"
          emptyMessage="Tickets you verify move here, and you can reopen them from their page."
        />
      </section>
    </div>
  );
}
