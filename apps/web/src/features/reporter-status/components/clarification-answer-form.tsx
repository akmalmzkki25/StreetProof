"use client";

import { Alert, AlertDescription } from "@streetproof/ui/components/alert";
import { Button } from "@streetproof/ui/components/button";
import { Field, FieldLabel } from "@streetproof/ui/components/field";
import { Textarea } from "@streetproof/ui/components/textarea";
import { useActionState, useId } from "react";

import { useI18n } from "@/lib/i18n/client";

import { answerClarificationAction, type AnswerState } from "../actions";

const initialState: AnswerState = { error: null };

export function ClarificationAnswerForm({
  clarificationId,
}: {
  clarificationId: string;
}) {
  const { t } = useI18n();
  const answerId = useId();
  const [state, formAction, isPending] = useActionState(
    answerClarificationAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="clarificationId" value={clarificationId} />
      <Field>
        <FieldLabel htmlFor={answerId}>{t("Your answer")}</FieldLabel>
        <Textarea
          id={answerId}
          name="answer"
          rows={3}
          maxLength={2000}
          required
        />
      </Field>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{t(state.error)}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Sending…") : t("Send answer")}
      </Button>
    </form>
  );
}
