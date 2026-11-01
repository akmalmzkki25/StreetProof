import {
  getDb,
  listMembers,
  listTeams,
  listTenantSites,
} from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { KpiCards } from "@/components/kpi-cards";
import { PageHeader } from "@/components/page-header";
import { MembersView } from "@/features/members/components/members-view";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <>
      <PageHeader title="Members" />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-96 sm:m-6" />}>
          <Members />
        </Suspense>
      </main>
    </>
  );
}

async function Members() {
  const member = await requireRole("tenant_admin");
  const db = getDb();
  const [members, sites, teams] = await Promise.all([
    listMembers(db, member.tenantId),
    listTenantSites(db, member.tenantId),
    listTeams(db, member.tenantId),
  ]);
  const activeCount = members.filter((person) => person.isActive).length;

  return (
    <>
      <KpiCards
        items={[
          { label: "Members", value: members.length },
          { label: "Active", value: activeCount },
          { label: "Deactivated", value: members.length - activeCount },
          { label: "Teams", value: teams.length },
        ]}
      />
      <MembersView members={members} sites={sites} teams={teams} />
    </>
  );
}
