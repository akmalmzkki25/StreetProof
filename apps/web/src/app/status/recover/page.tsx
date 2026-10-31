import { createMailer } from "@streetproof/db/mail";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { RecoverLinkForm } from "@/features/reporter-status/components/recover-link-form";

export const metadata: Metadata = {
  title: "Get a new status link",
  robots: { index: false, follow: false },
};

export default function RecoverLinkPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col gap-8 px-4 py-12">
      <h1 className="type-headline">Get a new status link</h1>
      <Suspense>
        <Recover />
      </Suspense>
    </main>
  );
}

async function Recover() {
  await connection();
  if (!createMailer()) {
    return (
      <p>
        Email isn&apos;t set up on this server. Ask the building team for a new
        link, and give them your report&apos;s reference if you have it.
      </p>
    );
  }
  return <RecoverLinkForm />;
}
