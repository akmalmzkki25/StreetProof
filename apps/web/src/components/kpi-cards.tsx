import { getI18n } from "@/lib/i18n/server";

type Kpi = { label: string; value: number };

// The row of figures under a page header, above the list they summarize.
export async function KpiCards({ items }: { items: Kpi[] }) {
  const { t } = await getI18n();
  return (
    <dl className="grid grid-cols-2 gap-3 border-b px-4 py-4 sm:px-6 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col gap-1 rounded-4xl bg-linear-to-t from-[color-mix(in_oklch,var(--brand)_30%,var(--foreground))]/6 to-card px-4 py-3 shadow-card"
        >
          <dt className="text-xs text-muted-foreground">{t(item.label)}</dt>
          <dd className="text-2xl font-medium tracking-tight tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
