import type { Metadata } from "next";
import { Suspense } from "react";

import { LocaleFooter } from "@/components/locale-footer";
import Providers from "@/components/providers";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_COOKIE } from "@/lib/i18n/translate";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "StreetProof",
  title: {
    default: "StreetProof",
    template: "%s · StreetProof",
  },
  description:
    "Facility damage reports become assigned repair work with completion evidence and supervisor-controlled closure.",
};

// The layout can't read the request without making every page wait for it, so
// this sets Indonesian from the cookie in the browser, before first paint.
const LANG_SCRIPT = `if(/(?:^|; )${LOCALE_COOKIE}=id/.test(document.cookie))document.documentElement.lang="id"`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>
          <LocaleProvider localePromise={getLocale()}>
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
