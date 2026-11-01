"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@streetproof/domain";
import { Button } from "@streetproof/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@streetproof/ui/components/input-group";
import { Spinner } from "@streetproof/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { FilterSelect } from "@/components/filter-select";
import { useLocalePath } from "@/components/locale-link";
import { useI18n } from "@/lib/i18n/client";

import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "../labels";

export const ANY = "any";

type Filters = {
  q: string;
  status: string;
  category: string;
  priority: string;
};

const NO_FILTERS: Filters = {
  q: "",
  status: ANY,
  category: ANY,
  priority: ANY,
};

function withAny(
  anyLabel: string,
  values: readonly string[],
  labels: Record<string, string>,
) {
  return [
    { value: ANY, label: anyLabel },
    ...values.map((value) => ({ value, label: labels[value] ?? value })),
  ];
}

function queueUrl(filters: Filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    const trimmed = value.trim();
    if (trimmed && trimmed !== ANY) params.set(key, trimmed);
  }
  const query = params.toString();
  return query ? `/app/queue?${query}` : "/app/queue";
}

// Filters apply as they change and live in the URL, so a filtered queue is a
// link someone can share or reload.
export function QueueFilters({
  search,
  status,
  category,
  priority,
}: {
  search: string;
  status: string | null;
  category: string | null;
  priority: string | null;
}) {
  const { t } = useI18n();
  const toLocalePath = useLocalePath();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<Filters>({
    q: search,
    status: status ?? ANY,
    category: category ?? ANY,
    priority: priority ?? ANY,
  });
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function apply(next: Filters) {
    setFilters(next);
    clearTimeout(searchTimer.current);
    startTransition(() => {
      router.replace(toLocalePath(queueUrl(next)), { scroll: false });
    });
  }

  function changeSearch(q: string) {
    const next = { ...filters, q };
    setFilters(next);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => apply(next), 300);
  }

  const isFiltered =
    filters.q.trim() !== "" ||
    filters.status !== ANY ||
    filters.category !== ANY ||
    filters.priority !== ANY;

  return (
    <search className="flex flex-wrap items-center gap-2">
      <InputGroup className="h-8 w-full rounded-full sm:w-72">
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label={t("Search")}
          maxLength={100}
          value={filters.q}
          onChange={(event) => changeSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") apply(filters);
          }}
          placeholder={t("Search reports")}
        />
      </InputGroup>
      <FilterSelect
        id="queue-status"
        label="Status"
        options={withAny("Any status", TICKET_STATUSES, STATUS_LABELS)}
        value={filters.status}
        onChange={(value) => apply({ ...filters, status: value })}
      />
      <FilterSelect
        id="queue-category"
        label="Category"
        options={withAny("Any category", TICKET_CATEGORIES, CATEGORY_LABELS)}
        value={filters.category}
        onChange={(value) => apply({ ...filters, category: value })}
      />
      <FilterSelect
        id="queue-priority"
        label="Priority"
        options={withAny("Any priority", TICKET_PRIORITIES, PRIORITY_LABELS)}
        value={filters.priority}
        onChange={(value) => apply({ ...filters, priority: value })}
      />
      {isFiltered ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => apply(NO_FILTERS)}
        >
          {t("Clear")}
        </Button>
      ) : null}
      {isPending ? <Spinner aria-label={t("Loading")} /> : null}
    </search>
  );
}
