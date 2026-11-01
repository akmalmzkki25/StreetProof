"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@streetproof/ui/components/select";

import { useI18n } from "@/lib/i18n/client";

// A toolbar filter that reads "Status | Any status": the label stays visible
// next to the value, so the row stays compact without hiding what it filters.
export function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  const items = options.map((option) => ({
    value: option.value,
    label: t(option.label),
  }));

  return (
    <div className="flex h-8 items-center rounded-full border text-[13px]">
      <label
        htmlFor={id}
        className="flex h-full items-center border-r pr-2.5 pl-3 text-muted-foreground"
      >
        {t(label)}
      </label>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => onChange(String(next ?? ""))}
      >
        <SelectTrigger
          id={id}
          className="h-full rounded-l-none rounded-r-full bg-transparent pr-2.5 pl-2.5 text-[13px] font-medium hover:bg-accent"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
