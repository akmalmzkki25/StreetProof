"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n/client";

import { exchangeReceipt } from "../actions";

// Hides the status until any receipt in the URL fragment has been exchanged,
// so opening a valid link never flashes "unavailable". A new link pasted into a
// tab already on this page only changes the fragment, so that counts too.
export function ReceiptExchange({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();
  const [isExchanging, setIsExchanging] = useState(true);

  useEffect(() => {
    async function exchange() {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("t");
      if (token) {
        setIsExchanging(true);
        window.history.replaceState(null, "", window.location.pathname);
        await exchangeReceipt(token);
        router.refresh();
      }
      setIsExchanging(false);
    }
    void exchange();
    window.addEventListener("hashchange", exchange);
    return () => window.removeEventListener("hashchange", exchange);
  }, [router]);

  if (isExchanging) {
    return (
      <p className="type-caption text-muted-foreground">
        {t("Opening your report…")}
      </p>
    );
  }
  return children;
}
