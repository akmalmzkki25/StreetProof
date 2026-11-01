import { SidebarProvider } from "@streetproof/ui/components/sidebar";
import { Suspense } from "react";

import {
  AppSidebar,
  AppSidebarFallback,
} from "@/features/shell/components/app-sidebar";
import { getI18n } from "@/lib/i18n/server";

export default function AppLayout({ children, drawer }: LayoutProps<"/[lang]/app">) {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <SkipLink />
      </Suspense>
      <Suspense fallback={<AppSidebarFallback />}>
        <AppSidebar />
      </Suspense>
      <div id="content" className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
      {/* The drawer reads the ticket, so it streams in like the page does. */}
      <Suspense fallback={null}>{drawer}</Suspense>
    </SidebarProvider>
  );
}

async function SkipLink() {
  const { t } = await getI18n();
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      {t("Skip to content")}
    </a>
  );
}
