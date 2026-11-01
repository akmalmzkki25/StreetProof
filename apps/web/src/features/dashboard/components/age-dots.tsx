import type { WorkStage } from "@streetproof/domain";
import { cn } from "@streetproof/ui/lib/utils";

import { STAGE_COLORS } from "../labels";

const DAY_MS = 24 * 60 * 60 * 1000;
// Days 0 to 13, then one column for everything older.
const COLUMNS = 15;
const WEEK_COLUMN = 7;
const MAX_STACK = 9;

// Every open ticket is a dot, stacked above the day it has waited. The tint
// from day 7 marks the stretch worth chasing; the dot color is its stage.
export function AgeDots({
  tickets,
  label,
  axis,
}: {
  tickets: { ageMs: number; stage: WorkStage }[];
  label: string;
  axis: { start: string; week: string; end: string };
}) {
  const columns = Array.from({ length: COLUMNS }, (_, day) =>
    tickets.filter(
      (ticket) =>
        Math.min(Math.floor(ticket.ageMs / DAY_MS), COLUMNS - 1) === day,
    ),
  );

  return (
    <div className="flex flex-col gap-2">
      <div role="img" aria-label={label} className="flex h-32 items-end">
        {columns.map((column, day) => (
          <div
            key={day}
            className={cn(
              "flex h-full flex-1 flex-col-reverse items-center gap-1 pb-1",
              day >= WEEK_COLUMN && "bg-destructive/[0.06]",
              day === WEEK_COLUMN && "rounded-l-xl",
              day === COLUMNS - 1 && "rounded-r-xl",
            )}
          >
            {column.slice(0, MAX_STACK).map((ticket, index) => (
              <span
                key={index}
                className={cn(
                  "size-2.5 rounded-full",
                  STAGE_COLORS[ticket.stage],
                )}
              />
            ))}
            {column.length > MAX_STACK ? (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                +{column.length - MAX_STACK}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div
        className="flex justify-between text-xs text-muted-foreground"
        aria-hidden="true"
      >
        <span>{axis.start}</span>
        <span>{axis.week}</span>
        <span>{axis.end}</span>
      </div>
    </div>
  );
}
