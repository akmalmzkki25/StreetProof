"use client";

import { Button } from "@streetproof/ui/components/button";
import { usePathname } from "next/navigation";

import { setLocaleAction } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/client";

// Signed-in pages change the language from the user menu instead.
export function LocaleFooter() {
  const pathname = usePathname();
  const { locale } = useI18n();
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;

  const other = locale === "id" ? "en" : "id";

  return (
    <footer className="flex justify-end px-4 pb-4 sm:px-8">
      <form action={setLocaleAction}>
        <input type="hidden" name="locale" value={other} />
        <Button type="submit" variant="ghost" size="sm">
          {other === "id" ? "Bahasa Indonesia" : "English"}
        </Button>
      </form>
    </footer>
  );
}
