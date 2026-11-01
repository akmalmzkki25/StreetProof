import { Skeleton } from "@streetproof/ui/components/skeleton";
import { Suspense } from "react";

import { TicketDetail } from "@/features/tickets/components/ticket-detail";
import { TicketDrawer } from "@/features/tickets/components/ticket-drawer";

export default function TicketDrawerPage({ params }: PageProps<"/app/tickets/[id]">) {
  return (
    <TicketDrawer>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <TicketDetail idPromise={params.then((value) => value.id)} />
      </Suspense>
    </TicketDrawer>
  );
}
