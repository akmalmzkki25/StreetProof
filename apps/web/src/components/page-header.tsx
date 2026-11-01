import { Separator } from "@streetproof/ui/components/separator";

import { AppSidebarTrigger } from "@/features/shell/components/nav-items";

// The sticky bar at the top of every /app page: menu, page name, actions.
export function PageHeader({
  title,
  badge,
  actions,
}: {
  title?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b glass px-4 sm:px-6">
      <AppSidebarTrigger />
      {title ? (
        <>
          <Separator
            orientation="vertical"
            className="h-4 data-vertical:self-center"
          />
          <h1 className="min-w-0 truncate font-medium">{title}</h1>
        </>
      ) : null}
      {badge}
      {actions ? (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
