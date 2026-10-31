import Link from "next/link";

import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex min-h-[60svh] w-full max-w-lg flex-col justify-center gap-4 px-4 py-16">
      <h1 className="type-headline">{t("This page could not be found.")}</h1>
      <Link
        href="/"
        className="self-start text-brand-text underline underline-offset-4"
      >
        {t("Back to the start")}
      </Link>
    </main>
  );
}
