"use client";

import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@streetproof/domain";
import { Button } from "@streetproof/ui/components/button";
import { Field, FieldLabel } from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import Form from "next/form";
import Link from "next/link";

import { useI18n } from "@/lib/i18n/client";

import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "../labels";
import { SelectField } from "./ticket-forms";

export const ANY = "any";

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

// A plain GET form, so a filtered queue is a link someone can share or reload.
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
  return (
    <Form
      action="/app/queue"
      role="search"
      className="grid grid-cols-1 items-end gap-4 rounded-4xl bg-card p-6 shadow-card sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]"
    >
      <Field>
        <FieldLabel htmlFor="q">{t("Search")}</FieldLabel>
        <Input
          id="q"
          name="q"
          type="search"
          maxLength={100}
          defaultValue={search}
          placeholder={t("Words from the report, summary or location")}
        />
      </Field>
      <SelectField
        id="status"
        label="Status"
        placeholder="Any status"
        options={withAny("Any status", TICKET_STATUSES, STATUS_LABELS)}
        defaultValue={status ?? ANY}
      />
      <SelectField
        id="category"
        label="Category"
        placeholder="Any category"
        options={withAny("Any category", TICKET_CATEGORIES, CATEGORY_LABELS)}
        defaultValue={category ?? ANY}
      />
      <SelectField
        id="priority"
        label="Priority"
        placeholder="Any priority"
        options={withAny("Any priority", TICKET_PRIORITIES, PRIORITY_LABELS)}
        defaultValue={priority ?? ANY}
      />
      <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-4">
        <Button type="submit" variant="outline">
          {t("Apply filters")}
        </Button>
        <Link
          href="/app/queue"
          className="type-caption text-brand-text underline underline-offset-4"
        >
          {t("Clear")}
        </Link>
      </div>
    </Form>
  );
}
