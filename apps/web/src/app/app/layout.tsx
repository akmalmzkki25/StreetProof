import { Suspense } from "react";

import { AppNav, AppNavFallback } from "@/features/shell/components/app-nav";
import { getI18n } from "@/lib/i18n/server";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("Skip to content")}
      </a>
      <header className="sticky top-0 z-40 px-4 pt-4">
        <Suspense fallback={<AppNavFallback />}>
          <AppNav />
        </Suspense>
      </header>
      <div id="content" className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
