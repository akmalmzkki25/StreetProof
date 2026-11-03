"use client";

import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import { useActionState, useTransition } from "react";

import { connectTelegramAction } from "@/features/telegram/actions";
import { FormError } from "@/features/tickets/components/ticket-forms";
import { useI18n } from "@/lib/i18n/client";

import {
  changePasswordAction,
  updateNameAction,
  type AccountState,
} from "../actions";

const initialState: AccountState = { error: null, isDone: false };

export function NameForm({ name }: { name: string }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    updateNameAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="account-name">{t("Name")}</FieldLabel>
        <Input
          id="account-name"
          name="name"
          maxLength={100}
          defaultValue={name}
          autoComplete="name"
          required
        />
      </Field>
      <FormError error={state.error} />
      {state.isDone ? <p role="status">{t("Name saved.")}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Saving…") : t("Save")}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="current-password">
            {t("Current password")}
          </FieldLabel>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-password">{t("New password")}</FieldLabel>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="repeat-password">
            {t("New password again")}
          </FieldLabel>
          <Input
            id="repeat-password"
            name="repeatPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
      </FieldGroup>
      <FormError error={state.error} />
      {state.isDone ? (
        <p role="status">
          {t("Password changed. You're signed out everywhere else.")}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Saving…") : t("Change password")}
      </Button>
    </form>
  );
}

export function TelegramConnect({ isLinked }: { isLinked: boolean }) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  function connect() {
    startTransition(async () => {
      const { url } = await connectTelegramAction();
      if (url) window.location.assign(url);
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-muted-foreground">
        {isLinked
          ? t(
              "Your work and reviews come to your Telegram chat. Connecting again moves them to another chat.",
            )
          : t(
              "Get new work, corrections and proof to review in Telegram, and act on them there.",
            )}
      </p>
      <Button variant="secondary" disabled={isPending} onClick={connect}>
        {isLinked ? t("Reconnect Telegram") : t("Connect Telegram")}
      </Button>
    </div>
  );
}
