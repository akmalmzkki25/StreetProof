"use client";

import { PageHeader } from "@/components/page-header";
import { RouteError } from "@/components/route-error";

// Inside the /app layout, so the sidebar and its phone menu stay usable.
export default function AppErrorPage({ retry }: { retry: () => void }) {
  return (
    <>
      <PageHeader />
      <main className="flex w-full flex-1 flex-col">
        <RouteError retry={retry} />
      </main>
    </>
  );
}
