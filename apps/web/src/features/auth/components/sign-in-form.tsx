"use client";

import { Alert, AlertDescription } from "@streetproof/ui/components/alert";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import { Link } from "@/components/locale-link";
import { useActionState } from "react";

import { useI18n } from "@/lib/i18n/client";

import { signIn, type SignInState } from "../actions";

const initialState: SignInState = { error: null, email: "" };

export function SignInForm() {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
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
          <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
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
          <AlertDescription>{t(state.error)}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("Signing in…") : t("Sign in")}
      </Button>
      <Link
        href="/forgot-password"
        className="type-caption self-start text-brand-text underline underline-offset-4"
      >
        {t("Forgot your password?")}
      </Link>
    </form>
  );
}
