import { Button } from "@streetproof/ui/components/button";
import { Suspense } from "react";

import { setLocaleAction } from "@/lib/i18n/actions";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";

// The language comes from the request, so everything under here renders per request.
async function LocaleContent({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const other = locale === "id" ? "en" : "id";

  return (
    <LocaleProvider locale={locale}>
      {children}
      <footer className="flex justify-end px-4 pb-4 sm:px-8">
        <form action={setLocaleAction}>
          <input type="hidden" name="locale" value={other} />
          <Button type="submit" variant="ghost" size="sm">
            {other === "id" ? "Bahasa Indonesia" : "English"}
          </Button>
        </form>
      </footer>
    </LocaleProvider>
  );
}

export function LocaleBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <LocaleContent>{children}</LocaleContent>
    </Suspense>
  );
}
