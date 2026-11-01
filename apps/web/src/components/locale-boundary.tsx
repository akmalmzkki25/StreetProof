import { Suspense } from "react";

import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";

import { LocaleFooter } from "./locale-footer";

// The language comes from the request, so everything under here renders per request.
async function LocaleContent({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const other = locale === "id" ? "en" : "id";

  return (
    <LocaleProvider locale={locale}>
      {children}
      <LocaleFooter other={other} />
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
