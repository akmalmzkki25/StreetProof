"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { listAuditLog } from "@streetproof/db";
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
  initialPagination,
  type DataTableFeatures,
} from "@/components/data-table";
import { FilterSelect } from "@/components/filter-select";
import { Link } from "@/components/locale-link";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";

import { auditLabel } from "../labels";

type AuditRow = Awaited<ReturnType<typeof listAuditLog>>[number];

const ANY = "any";
const column = createColumnHelper<DataTableFeatures, AuditRow>();
const COLUMN_CLASSES: Record<string, string> = {
  when: "whitespace-nowrap",
};

export function AuditView({ entries }: { entries: AuditRow[] }) {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState(ANY);

  const actions = useMemo(
    () => [...new Set(entries.map((entry) => entry.action))],
    [entries],
  );

  const visible = useMemo(() => {
    const words = search.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        (!words ||
          (entry.actorName ?? t("Removed account"))
            .toLowerCase()
            .includes(words)) &&
        (action === ANY || entry.action === action),
    );
  }, [entries, search, action, t]);

  const columns = useMemo(
    () =>
      column.columns([
        column.accessor((entry) => entry.actorName ?? t("Removed account"), {
          id: "who",
          header: t("Who"),
          sortFn: "alphanumeric",
        }),
        column.accessor((entry) => t(auditLabel(entry.action)), {
          id: "what",
          header: t("What"),
          sortFn: "alphanumeric",
          cell: ({ row }) => {
            const entry = row.original;
            const label = t(auditLabel(entry.action));
            if (entry.targetType === "ticket" && entry.targetId) {
              return (
                <Link
                  href={`/app/tickets/${entry.targetId}`}
                  className="text-brand-text underline underline-offset-4"
                >
                  {label}
                </Link>
              );
            }
            return label;
          },
        }),
        column.accessor((entry) => entry.createdAt.getTime(), {
          id: "when",
          header: t("When"),
          sortFn: "basic",
          cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
              {formatDateTime(row.original.createdAt, locale)}
            </span>
          ),
        }),
      ]),
    [t, locale],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: visible,
    initialState: {
      sorting: [{ id: "when", desc: true }],
      pagination: initialPagination,
    },
  });

  return (
    <>
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:px-6">
        <p className="type-caption text-muted-foreground">
          {t(
            "The latest 200 sign-ins, account changes and ticket views. Changes to a ticket itself are in that ticket's history.",
          )}
        </p>
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
              placeholder={t("Who")}
            />
          </InputGroup>
          <FilterSelect
            id="audit-action"
            label="Event"
            value={action}
            options={[
              { value: ANY, label: "Any event" },
              ...actions.map((value) => ({
                value,
                label: auditLabel(value),
              })),
            ]}
            onChange={setAction}
          />
        </search>
      </div>

      <DataTable
        table={table}
        columnClasses={COLUMN_CLASSES}
        empty={
          <Empty className="flex-none py-16">
            <EmptyHeader>
              <EmptyTitle>{t("No matching entries")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        }
        footer={
          visible.length === 1
            ? t("1 entry in view")
            : t("{count} entries in view", { count: visible.length })
        }
      />
    </>
  );
}
