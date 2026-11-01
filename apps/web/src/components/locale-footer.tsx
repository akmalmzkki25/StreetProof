"use client";

import { Button } from "@streetproof/ui/components/button";
import { usePathname } from "next/navigation";

import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/translate";

// Signed-in pages change the language from the user menu instead.
export function LocaleFooter({ other }: { other: Locale }) {
  const pathname = usePathname();
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;

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
