import { DEMO_PASSWORD, DEMO_TENANTS } from "@streetproof/db/demo";
import type { Metadata } from "next";
import Link from "next/link";

import { StreetProofMark } from "@/components/street-proof-mark";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const { t } = await getI18n();
  const showDemoLogins = process.env.NODE_ENV === "development";
  const demoTenant = DEMO_TENANTS[0];
  const demoAccounts =
    showDemoLogins && demoTenant
      ? demoTenant.users.map((user) => ({
          label: user.name,
          email: user.email,
        }))
      : [];

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 px-4 py-16">
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
      <SignInForm
        demoAccounts={demoAccounts}
        demoPassword={showDemoLogins ? DEMO_PASSWORD : null}
      />
    </main>
  );
}
