"use client";

import { Alert, AlertDescription } from "@streetproof/ui/components/alert";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import Link from "next/link";
import { useActionState, useRef } from "react";

import { signIn, type SignInState } from "../actions";

const initialState: SignInState = { error: null, email: "" };

type DemoAccount = { label: string; email: string };

export function SignInForm({
  demoAccounts,
  demoPassword,
}: {
  demoAccounts: DemoAccount[];
  demoPassword: string | null;
}) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  function signInAs(email: string) {
    const form = formRef.current;
    if (!form || !demoPassword) return;
    const emailInput = form.elements.namedItem("email");
    const passwordInput = form.elements.namedItem("password");
    if (emailInput instanceof HTMLInputElement) emailInput.value = email;
    if (passwordInput instanceof HTMLInputElement)
      passwordInput.value = demoPassword;
    form.requestSubmit();
  }

  return (
    <div className="flex flex-col gap-6">
      <form ref={formRef} action={formAction} className="flex flex-col gap-5">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              defaultValue={state.email}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
        </FieldGroup>

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
        <Link
          href="/forgot-password"
          className="type-caption self-start text-brand-text underline underline-offset-4"
        >
          Forgot your password?
        </Link>
      </form>

      {demoPassword && demoAccounts.length > 0 ? (
        <section
          aria-labelledby="demo-accounts"
          className="flex flex-col gap-3"
        >
          <h2 id="demo-accounts" className="type-caption text-muted-foreground">
            Demo accounts (synthetic data)
          </h2>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => signInAs(account.email)}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
