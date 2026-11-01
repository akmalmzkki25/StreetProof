import { cn } from "@streetproof/ui/lib/utils";

// One bar split by share. A zero draws nothing.
export function SegmentedBar({
  segments,
  className,
}: {
  segments: { value: number; className: string }[];
  className?: string;
}) {
  const total = Math.max(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    1,
  );
  return (
    <div
      className={cn(
        "flex h-2 gap-px overflow-hidden rounded-full bg-muted-foreground/15",
        className,
      )}
      aria-hidden="true"
    >
      {segments.map((segment) =>
        segment.value > 0 ? (
          <div
            key={segment.className}
            className={segment.className}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ) : null,
      )}
    </div>
  );
}
