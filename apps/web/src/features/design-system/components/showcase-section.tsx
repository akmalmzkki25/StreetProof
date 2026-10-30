import { cn } from "@/lib/utils";

export function ShowcaseSection({
  id,
  title,
  description,
  className,
  children,
}: {
  id: string;
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16", className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-8">
        <header className="flex max-w-2xl flex-col gap-2">
          <h2 className="type-headline text-foreground">{title}</h2>
          <p className="type-lead text-muted-foreground">{description}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

export function ShowcaseBlock({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="type-title text-foreground">{title}</h3>
        {description ? (
          <p className="type-caption text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
