import { createMailer } from "@streetproof/db/mail";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ForgotPasswordForm } from "@/features/auth/components/password-forms";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Forgot your password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  await connection();
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 px-4 py-16">
      <h1 className="type-headline">{t("Forgot your password?")}</h1>
      <ForgotPasswordForm canEmail={createMailer() !== null} />
    </main>
  );
}
