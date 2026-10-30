import { cn } from "@streetproof/ui/lib/utils";

// The flat panel from design.md, with its title wired up as the section's name.
export function Panel({
  id,
  title,
  note,
  className,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex min-w-0 flex-col gap-5 rounded-4xl bg-card p-6 shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={id} className="type-title">
          {title}
        </h2>
        {note ? (
          <p className="type-caption text-muted-foreground">{note}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
