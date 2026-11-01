import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { NewPasswordForm } from "@/features/auth/components/password-forms";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Set a new password",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 px-4 py-16">
      <Suspense fallback={<ResetPasswordSkeleton />}>
        <ResetPasswordContent
          token={searchParams.then(({ token }) =>
            typeof token === "string" ? token : "",
          )}
        />
      </Suspense>
    </main>
  );
}

async function ResetPasswordContent({ token }: { token: Promise<string> }) {
  const { t } = await getI18n();
  const resetToken = await token;

  return (
    <>
      <h1 className="type-headline">{t("Set a new password")}</h1>
      {resetToken ? (
        <NewPasswordForm token={resetToken} />
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
    </>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
