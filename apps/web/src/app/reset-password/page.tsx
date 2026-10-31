import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { NewPasswordForm } from "@/features/auth/components/password-forms";

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
      <h1 className="type-headline">Set a new password</h1>
      <Suspense>
        <Form searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Form({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert">This link has expired or was already used.</p>
        <Link
          href="/forgot-password"
          className="text-brand-text underline underline-offset-4"
        >
          Ask for a new one
        </Link>
      </div>
    );
  }
  return <NewPasswordForm token={token} />;
}
