"use client";

import { Alert, AlertDescription } from "@streetproof/ui/components/alert";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import { Link } from "@/components/locale-link";
import { useActionState } from "react";

import { useI18n } from "@/lib/i18n/client";

import {
  requestPasswordReset,
  setNewPassword,
  type NewPasswordState,
  type ResetRequestState,
} from "../actions";

const initialRequest: ResetRequestState = { isSent: false, error: null };
const initialNewPassword: NewPasswordState = { isDone: false, error: null };

function FormError({ error }: { error: string | null }) {
  const { t } = useI18n();
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{t(error)}</AlertDescription>
    </Alert>
  );
}

function BackToSignIn() {
  const { t } = useI18n();
  return (
    <Link
      href="/login"
      className="text-brand-text underline underline-offset-4"
    >
      {t("Back to sign in")}
    </Link>
  );
}

export function ForgotPasswordForm({ canEmail }: { canEmail: boolean }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialRequest,
  );

  if (state.isSent) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status">
          {t("If that address has an account, a reset link is on its way.")}
        </p>
        <BackToSignIn />
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        {canEmail ? null : (
          <FieldDescription>
            {t(
              "Email isn't set up on this server, so your building admin has to set a new password for you.",
            )}
          </FieldDescription>
        )}
      </Field>
      <FormError error={state.error} />
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("Sending…") : t("Send reset link")}
      </Button>
      <BackToSignIn />
    </form>
  );
}

export function NewPasswordForm({ token }: { token: string }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    setNewPassword,
    initialNewPassword,
  );

  if (state.isDone) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status">
          {t("Your password is changed. You can sign in with it.")}
        </p>
        <BackToSignIn />
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <Field>
        <FieldLabel htmlFor="password">{t("New password")}</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
        <FieldDescription>{t("At least 8 characters.")}</FieldDescription>
      </Field>
      <FormError error={state.error} />
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("Saving…") : t("Set new password")}
      </Button>
    </form>
  );
}
