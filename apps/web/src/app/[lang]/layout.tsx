import type { Metadata } from "next";
import { Suspense } from "react";

import { LocaleFooter } from "@/components/locale-footer";
import Providers from "@/components/providers";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { LOCALES } from "@/lib/i18n/translate";

import "../globals.css";

export const metadata: Metadata = {
  applicationName: "StreetProof",
  title: {
    default: "StreetProof",
    template: "%s · StreetProof",
  },
  description:
    "Facility damage reports become assigned repair work with completion evidence and supervisor-controlled closure.",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className="flex min-h-svh flex-col bg-background text-foreground antialiased">
        <Providers>
          <LocaleProvider locale={locale}>
            {children}
            <Suspense fallback={null}>
              <LocaleFooter />
            </Suspense>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
