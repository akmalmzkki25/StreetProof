import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Link } from "@/components/locale-link";
import { Suspense } from "react";

import { StreetProofMark } from "@/components/street-proof-mark";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-16">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginContent />
      </Suspense>
    </main>
  );
}

async function LoginContent() {
  const { t } = await getI18n();

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 self-start font-heading text-sm font-semibold"
        >
          <StreetProofMark className="shrink-0" />
          StreetProof
        </Link>
        <h1 className="type-headline">{t("Sign in")}</h1>
        <p className="type-caption text-muted-foreground">
          {t(
            "Operators, technicians and supervisors sign in with the account their building admin created.",
          )}
        </p>
      </div>
      <SignInForm />
    </>
  );
}

function LoginSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
