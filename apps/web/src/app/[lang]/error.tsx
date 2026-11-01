"use client";

import { RouteError } from "@/components/route-error";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center">
      <RouteError retry={retry} />
    </main>
  );
}
