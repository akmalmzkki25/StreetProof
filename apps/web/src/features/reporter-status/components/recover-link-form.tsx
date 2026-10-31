"use client";

import { Alert, AlertDescription } from "@streetproof/ui/components/alert";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import { useActionState } from "react";

import { recoverLinksAction, type RecoverState } from "../actions";

const initialState: RecoverState = { isSent: false, error: null };

export function RecoverLinkForm() {
  const [state, formAction, isPending] = useActionState(
    recoverLinksAction,
    initialState,
  );

  if (state.isSent) {
    return (
      <p role="status">
        If a report was sent with that address, new links are on their way. Your
        old links keep working.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="max-sm:h-11"
          required
        />
        <FieldDescription>
          The address you gave when you sent the report. Without one, ask the
          building team for a new link.
        </FieldDescription>
      </Field>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Sending…" : "Send my links"}
      </Button>
    </form>
  );
}
