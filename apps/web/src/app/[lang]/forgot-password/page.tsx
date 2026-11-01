import { createMailer } from "@streetproof/db/mail";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { ForgotPasswordForm } from "@/features/auth/components/password-forms";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Forgot your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 px-4 py-16">
      <Suspense fallback={<ForgotPasswordSkeleton />}>
        <ForgotPasswordContent />
      </Suspense>
    </main>
  );
}

async function ForgotPasswordContent() {
  await connection();
  const { t } = await getI18n();
  return (
    <>
      <h1 className="type-headline">{t("Forgot your password?")}</h1>
      <ForgotPasswordForm canEmail={createMailer() !== null} />
    </>
  );
}

function ForgotPasswordSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
