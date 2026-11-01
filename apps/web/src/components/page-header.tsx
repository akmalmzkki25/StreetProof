import { SidebarTrigger } from "@streetproof/ui/components/sidebar";
import { Suspense } from "react";

import { PageHeaderStart } from "@/features/shell/components/nav-items";

// The sticky bar at the top of every /app page: menu, page name, actions. The
// title is an English sentence, translated once the request's language is known.
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
      <Suspense fallback={<SidebarTrigger />}>
        <PageHeaderStart title={title} />
      </Suspense>
      {badge}
      {actions ? (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
