"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@streetproof/ui/components/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { Locale } from "@/lib/i18n/translate";

type Point = { day: string; opened: number; verified: number };

// Verified closes are the outcome, so they take the accent; new work stays grey.
export function TrendChart({
  points,
  locale,
  openedLabel,
  verifiedLabel,
}: {
  points: Point[];
  locale: Locale;
  openedLabel: string;
  verifiedLabel: string;
}) {
  const config = {
    opened: { label: openedLabel, color: "var(--muted-foreground)" },
    verified: { label: verifiedLabel, color: "var(--chart-1)" },
  } satisfies ChartConfig;
  // The day keys are already WIB dates, so format them as UTC to keep the day.
  const dayFormat = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-GB",
    {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    },
  );
  const formatDay = (day: string) => dayFormat.format(new Date(day));

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <BarChart data={points} accessibilityLayer barGap={1}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={formatDay}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                formatDay(String(payload[0]?.payload?.day ?? ""))
              }
            />
          }
        />
        <Bar
          dataKey="opened"
          fill="var(--color-opened)"
          radius={2}
          isAnimationActive={false}
        />
        <Bar
          dataKey="verified"
          fill="var(--color-verified)"
          radius={2}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

// A small area under a metric tile: the shape of the last 30 days, no axes.
export function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const points = values.map((value, index) => ({ index, value }));
  return (
    <div className="h-10" aria-hidden="true">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 240, height: 40 }}
      >
        <AreaChart
          data={points}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <Area
            dataKey="value"
            type="monotone"
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.15}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
