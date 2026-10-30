"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { exchangeReceipt } from "../actions";

// Hides the status until any receipt in the URL fragment has been exchanged,
// so opening a valid link never flashes "unavailable".
export function ReceiptExchange({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isExchanging, setIsExchanging] = useState(true);

  useEffect(() => {
    async function exchange() {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("t");
      if (token) {
        window.history.replaceState(null, "", window.location.pathname);
        await exchangeReceipt(token);
        router.refresh();
      }
      setIsExchanging(false);
    }
    void exchange();
  }, [router]);

  if (isExchanging) {
    return (
      <p className="text-sm text-muted-foreground">Opening your report…</p>
    );
  }
  return children;
}
