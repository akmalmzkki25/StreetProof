import {
  getDb,
  listMembers,
  listTeams,
  listTenantSites,
} from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";
import { Button } from "@streetproof/ui/components/button";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Panel } from "@/components/panel";
import { retireTeamAction } from "@/features/members/actions";
import {
  AddMemberForm,
  AddTeamForm,
  MemberAccessForm,
  MemberActiveForm,
  SetPasswordForm,
} from "@/features/members/components/member-forms";
import { ROLE_LABELS } from "@/features/members/labels";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <h1 className="type-headline">{t("Members")}</h1>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Members />
      </Suspense>
    </main>
  );
}

async function Members() {
  const member = await requireRole("tenant_admin");
  const { t } = await getI18n();
  const db = getDb();
  const [members, sites, teams] = await Promise.all([
    listMembers(db, member.tenantId),
    listTenantSites(db, member.tenantId),
    listTeams(db, member.tenantId),
  ]);

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section
        aria-label={t("Current members")}
        className="flex flex-col gap-4"
      >
        {members.map((person) => (
          <details
            key={person.userId}
            className="group rounded-4xl bg-card p-6 shadow-card"
          >
            <summary className="flex cursor-pointer flex-col gap-2 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none">
              <span className="font-medium">{person.name}</span>
              <span className="type-caption text-muted-foreground">
                {person.email}
              </span>
              <span className="flex flex-wrap gap-2">
                {person.isActive ? null : (
                  <Badge variant="destructive">{t("Deactivated")}</Badge>
                )}
                {person.roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {t(ROLE_LABELS[role])}
                  </Badge>
                ))}
              </span>
            </summary>
            <div className="mt-6 flex flex-col gap-6">
              {person.isActive ? (
                <MemberAccessForm
                  userId={person.userId}
                  roles={person.roles}
                  siteId={person.siteId}
                  sites={sites}
                />
              ) : null}
              <SetPasswordForm userId={person.userId} />
              <MemberActiveForm
                userId={person.userId}
                isActive={person.isActive}
              />
            </div>
          </details>
        ))}
      </section>
      <aside className="flex flex-col gap-6">
        <Panel id="add-member" title="Add a member">
          <AddMemberForm sites={sites} />
        </Panel>
        <Panel id="teams" title="Teams">
          {teams.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between gap-4"
                >
                  {team.name}
                  <form action={retireTeamAction}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      {t("Retire")}
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t("No teams yet.")}</p>
          )}
          <AddTeamForm />
        </Panel>
      </aside>
    </div>
  );
}
