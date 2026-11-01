import Link from "next/link";
import { Suspense } from "react";

import { getI18n } from "@/lib/i18n/server";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60svh] w-full max-w-lg flex-col justify-center gap-4 px-4 py-16">
      <Suspense fallback={null}>
        <NotFoundContent />
      </Suspense>
    </main>
  );
}

async function NotFoundContent() {
  const { t } = await getI18n();
  return (
    <>
      <h1 className="type-headline">{t("This page could not be found.")}</h1>
      <Link
        href="/"
        className="self-start text-brand-text underline underline-offset-4"
      >
        {t("Back to the start")}
      </Link>
    </>
  );
}
