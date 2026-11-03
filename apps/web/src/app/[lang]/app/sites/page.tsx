import { getDb, getTenantName, listSitesWithLocations } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { KpiCards } from "@/components/kpi-cards";
import { PageHeader } from "@/components/page-header";
import { SitesView } from "@/features/sites/components/sites-view";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Sites" };

export default function SitesPage() {
  return (
    <>
      <PageHeader title="Sites" />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-96 sm:m-6" />}>
          <Sites />
        </Suspense>
      </main>
    </>
  );
}

async function Sites() {
  const member = await requireRole("tenant_admin");
  const db = getDb();
  const [sites, tenantName] = await Promise.all([
    listSitesWithLocations(db, member.tenantId),
    getTenantName(db, member.tenantId),
  ]);
  const activeSites = sites.filter((site) => site.active);
  const locationCount = activeSites.reduce(
    (total, site) =>
      total + site.locations.filter((location) => location.active).length,
    0,
  );

  return (
    <>
      <KpiCards
        items={[
          { label: "Sites", value: sites.length },
          { label: "Taking reports", value: activeSites.length },
          { label: "Locations", value: locationCount },
          { label: "Inactive", value: sites.length - activeSites.length },
        ]}
      />
      <SitesView
        sites={sites}
        tenantName={tenantName ?? member.tenantName}
        appUrl={process.env.APP_URL ?? ""}
      />
    </>
  );
}
