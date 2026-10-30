import { DEMO_PASSWORD, DEMO_TENANTS } from "@streetproof/db/demo";
import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const showDemoLogins = process.env.SHOW_DEMO_LOGINS === "true";
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
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          StreetProof
        </Link>
        <h1 className="text-2xl">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Operators, technicians and supervisors sign in with the account their
          building admin created.
        </p>
      </div>
      <SignInForm
        demoAccounts={demoAccounts}
        demoPassword={showDemoLogins ? DEMO_PASSWORD : null}
      />
    </main>
  );
}
