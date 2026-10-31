import type { Metadata } from "next";
import Link from "next/link";

import { NewPasswordForm } from "@/features/auth/components/password-forms";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Set a new password",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { t } = await getI18n();
  const { token } = await searchParams;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 px-4 py-16">
      <h1 className="type-headline">{t("Set a new password")}</h1>
      {typeof token === "string" && token ? (
        <NewPasswordForm token={token} />
      ) : (
        <div className="flex flex-col gap-4">
          <p role="alert">{t("This link has expired or was already used.")}</p>
          <Link
            href="/forgot-password"
            className="text-brand-text underline underline-offset-4"
          >
            {t("Ask for a new one")}
          </Link>
        </div>
      )}
    </main>
  );
}
