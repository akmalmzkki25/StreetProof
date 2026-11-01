import {
  getDb,
  listMembers,
  listTeams,
  listTenantSites,
} from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { MembersView } from "@/features/members/components/members-view";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageHeader title={t("Members")} />
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
  return <MembersView members={members} sites={sites} teams={teams} />;
}
