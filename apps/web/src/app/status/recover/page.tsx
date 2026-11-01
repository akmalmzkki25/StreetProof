import { createMailer } from "@streetproof/db/mail";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { RecoverLinkForm } from "@/features/reporter-status/components/recover-link-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Get a new status link",
  robots: { index: false, follow: false },
};

export default function RecoverLinkPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col gap-8 px-4 py-12">
      <Suspense fallback={<RecoverLinkSkeleton />}>
        <RecoverLinkContent />
      </Suspense>
    </main>
  );
}

async function RecoverLinkContent() {
  await connection();
  const { t } = await getI18n();
  return (
    <>
      <h1 className="type-headline">{t("Get a new status link")}</h1>
      {createMailer() ? (
        <RecoverLinkForm />
      ) : (
        <p>
          {t(
            "Email isn't set up on this server. Ask the building team for a new link, and give them your report's reference if you have it.",
          )}
        </p>
      )}
    </>
  );
}

function RecoverLinkSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
