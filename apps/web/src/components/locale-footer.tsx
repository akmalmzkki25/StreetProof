"use client";

import { buttonVariants } from "@streetproof/ui/components/button";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/lib/i18n/client";
import { localePath, splitLocale } from "@/lib/i18n/translate";

// Signed-in pages change the language from the user menu instead.
export function LocaleFooter() {
  const { locale } = useI18n();
  const { path } = splitLocale(usePathname());
  if (path === "/app" || path.startsWith("/app/")) return null;
  if (path.startsWith("/print/")) return null;

  const other = locale === "id" ? "en" : "id";

  return (
    <footer className="flex justify-end px-4 pb-4 sm:px-8">
      <NextLink
        href={localePath(other, path)}
        hrefLang={other}
        lang={other}
        prefetch={false}
        // 32px like other app controls, with a 44px touch area.
        className={buttonVariants({
          variant: "ghost",
          className: "relative after:absolute after:-inset-1.5",
        })}
      >
        {other === "id" ? "Bahasa Indonesia" : "English"}
      </NextLink>
    </footer>
  );
}
