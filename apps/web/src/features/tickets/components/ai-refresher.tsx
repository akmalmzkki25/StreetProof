"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 3000;
const MAX_REFRESHES = 40;

// Rendered only while AI work is pending. Stops on its own, so a stopped worker
// doesn't leave the page refreshing forever.
export function AiRefresher() {
  const router = useRouter();

  useEffect(() => {
    let refreshes = 0;
    const timer = setInterval(() => {
      refreshes += 1;
      router.refresh();
      if (refreshes >= MAX_REFRESHES) clearInterval(timer);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
