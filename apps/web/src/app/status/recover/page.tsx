import { createMailer } from "@streetproof/db/mail";
import type { Metadata } from "next";
import { connection } from "next/server";

import { RecoverLinkForm } from "@/features/reporter-status/components/recover-link-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Get a new status link",
  robots: { index: false, follow: false },
};

export default async function RecoverLinkPage() {
  await connection();
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col gap-8 px-4 py-12">
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
    </main>
  );
}
