"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { listMembers, listTeams } from "@streetproof/db";
import { ROLES } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import { Button } from "@streetproof/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@streetproof/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@streetproof/ui/components/input-group";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  DataTable,
  dataTableFeatures,
  type DataTableFeatures,
} from "@/components/data-table";
import { FilterSelect } from "@/components/filter-select";
import { SideDrawer } from "@/components/side-drawer";
import { useI18n } from "@/lib/i18n/client";

import { retireTeamAction } from "../actions";
import { ROLE_LABELS } from "../labels";
import {
  AddMemberForm,
  AddTeamForm,
  MemberAccessForm,
  MemberActiveForm,
  SetPasswordForm,
} from "./member-forms";

type MemberRow = Awaited<ReturnType<typeof listMembers>>[number];
type Team = Awaited<ReturnType<typeof listTeams>>[number];
type Site = { id: string; name: string };
type Drawer =
  { kind: "add" } | { kind: "teams" } | { kind: "member"; userId: string };

const ANY = "any";
const column = createColumnHelper<DataTableFeatures, MemberRow>();
const COLUMN_CLASSES: Record<string, string> = {
  site: "hidden md:table-cell",
};

function siteNameOf(
  sites: Site[],
  siteId: string | null,
  t: (text: string) => string,
) {
  return sites.find((site) => site.id === siteId)?.name ?? t("All sites");
}

export function MembersView({
  members,
  sites,
  teams,
}: {
  members: MemberRow[];
  sites: Site[];
  teams: Team[];
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ANY);
  const [status, setStatus] = useState(ANY);
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function openDrawer(next: Drawer) {
    setDrawer(next);
    setIsDrawerOpen(true);
  }

  const visible = useMemo(() => {
    const words = search.trim().toLowerCase();
    return members.filter(
      (person) =>
        (!words ||
          person.name.toLowerCase().includes(words) ||
          person.email.toLowerCase().includes(words)) &&
        (role === ANY ||
          person.roles.includes(role as MemberRow["roles"][number])) &&
        (status === ANY || (status === "active") === person.isActive),
    );
  }, [members, search, role, status]);

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor("name", {
          header: t("Member"),
          sortFn: "alphanumeric",
          cell: ({ row }) => (
            <div className="flex flex-col">
              {/* The row's click handler opens the member, for this button too. */}
              <button
                type="button"
                className="self-start text-left font-medium transition-colors hover:text-brand-text focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                {row.original.name}
              </button>
              <span className="text-xs text-muted-foreground">
                {row.original.email}
              </span>
            </div>
          ),
        }),
        column.accessor((person) => person.roles.join(","), {
          id: "roles",
          header: t("Roles"),
          sortFn: "alphanumeric",
          cell: ({ row }) => (
            <span className="flex flex-wrap gap-1">
              {row.original.roles.map((personRole) => (
                <Badge key={personRole} variant="outline">
                  {t(ROLE_LABELS[personRole])}
                </Badge>
              ))}
            </span>
          ),
        }),
        column.accessor((person) => siteNameOf(sites, person.siteId, t), {
          id: "site",
          header: t("Site"),
          sortFn: "alphanumeric",
        }),
        column.accessor((person) => (person.isActive ? 0 : 1), {
          id: "status",
          header: t("Status"),
          sortFn: "basic",
          cell: ({ row }) =>
            row.original.isActive ? (
              <Badge variant="secondary">{t("Active")}</Badge>
            ) : (
              <Badge variant="destructive">{t("Deactivated")}</Badge>
            ),
        }),
      ]),
    [t, sites],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: visible,
  });

  const selected =
    drawer?.kind === "member"
      ? members.find((person) => person.userId === drawer.userId)
      : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <search className="flex flex-wrap items-center gap-2">
          <InputGroup className="h-8 w-full rounded-full sm:w-64">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label={t("Search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Name or email")}
            />
          </InputGroup>
          <FilterSelect
            id="members-role"
            label="Role"
            value={role}
            options={[
              { value: ANY, label: "Any role" },
              ...ROLES.map((value) => ({
                value,
                label: ROLE_LABELS[value],
              })),
            ]}
            onChange={setRole}
          />
          <FilterSelect
            id="members-status"
            label="Status"
            value={status}
            options={[
              { value: ANY, label: "Any status" },
              { value: "active", label: "Active" },
              { value: "deactivated", label: "Deactivated" },
            ]}
            onChange={setStatus}
          />
        </search>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openDrawer({ kind: "teams" })}
          >
            {t("Teams")}
          </Button>
          <Button size="sm" onClick={() => openDrawer({ kind: "add" })}>
            {t("Add member")}
          </Button>
        </div>
      </div>

      <DataTable
        table={table}
        columnClasses={COLUMN_CLASSES}
        onRowClick={(person) =>
          openDrawer({ kind: "member", userId: person.userId })
        }
        empty={
          <Empty className="flex-none py-16">
            <EmptyHeader>
              <EmptyTitle>{t("No matching members")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        }
        footer={
          visible.length === 1
            ? t("1 member in view")
            : t("{count} members in view", { count: visible.length })
        }
      />

      <SideDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title={
          drawer?.kind === "add"
            ? t("Add a member")
            : drawer?.kind === "teams"
              ? t("Teams")
              : (selected?.name ?? t("Member"))
        }
      >
        {drawer?.kind === "add" ? <AddMemberForm sites={sites} /> : null}
        {drawer?.kind === "teams" ? <TeamsPanel teams={teams} /> : null}
        {selected ? (
          <div key={selected.userId} className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="type-caption text-muted-foreground">
                {selected.email}
              </p>
              <span className="flex flex-wrap gap-1">
                {selected.isActive ? null : (
                  <Badge variant="destructive">{t("Deactivated")}</Badge>
                )}
                {selected.roles.map((personRole) => (
                  <Badge key={personRole} variant="outline">
                    {t(ROLE_LABELS[personRole])}
                  </Badge>
                ))}
              </span>
            </div>
            {selected.isActive ? (
              <MemberAccessForm
                userId={selected.userId}
                roles={selected.roles}
                siteId={selected.siteId}
                sites={sites}
              />
            ) : null}
            <SetPasswordForm userId={selected.userId} />
            <MemberActiveForm
              userId={selected.userId}
              isActive={selected.isActive}
            />
          </div>
        ) : null}
      </SideDrawer>
    </>
  );
}

function TeamsPanel({ teams }: { teams: Team[] }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      {teams.length > 0 ? (
        <ul className="flex flex-col divide-y">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center justify-between gap-4 py-2"
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
    </div>
  );
}
