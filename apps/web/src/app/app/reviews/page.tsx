import { getDb, listQueue } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { TicketTable } from "@/features/tickets/components/ticket-table";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-4 py-12 md:px-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/app"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Workspace
        </Link>
        <h1 className="text-2xl">Reviews</h1>
      </div>
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
        <h2 id="pending" className="text-sm text-muted-foreground">
          Awaiting your verification
        </h2>
        <TicketTable
          items={pending}
          emptyMessage="Nothing is waiting for verification."
        />
      </section>
      <section aria-labelledby="closed" className="flex flex-col gap-4">
        <h2 id="closed" className="text-sm text-muted-foreground">
          Verified closed
        </h2>
        <TicketTable items={closed} emptyMessage="No closed work yet." />
      </section>
    </div>
  );
}
