import { createMailer } from "@streetproof/db/mail";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { ForgotPasswordForm } from "@/features/auth/components/password-forms";

export const metadata: Metadata = {
  title: "Forgot your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 px-4 py-16">
      <h1 className="type-headline">Forgot your password?</h1>
      <Suspense>
        <Form />
      </Suspense>
    </main>
  );
}

async function Form() {
  await connection();
  return <ForgotPasswordForm canEmail={createMailer() !== null} />;
}
