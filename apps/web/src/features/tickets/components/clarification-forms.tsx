"use client";

import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Textarea } from "@streetproof/ui/components/textarea";
import { useActionState } from "react";

import {
  requestClarificationAction,
  resumeAfterClarificationAction,
  type TicketActionState,
} from "../actions";
import { FormError, TicketRefFields } from "./ticket-forms";

const initialState: TicketActionState = { error: null };

type TicketRef = { ticketId: string; revision: number };

export function RequestClarificationForm({
  ticketId,
  revision,
  missingFields,
}: TicketRef & { missingFields: string[] }) {
  const [state, formAction, isPending] = useActionState(
    requestClarificationAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TicketRefFields ticketId={ticketId} revision={revision} />
      <Field>
        <FieldLabel htmlFor="question">Question for the reporter</FieldLabel>
        <Textarea
          id="question"
          name="question"
          rows={2}
          maxLength={500}
          required
        />
        <FieldDescription>
          The reporter sees this exactly as you write it, on their status page.
        </FieldDescription>
        {missingFields.length > 0 ? (
          <FieldDescription>
            AI suggestion, not verified. Possibly missing:{" "}
            {missingFields.join(", ")}.
          </FieldDescription>
        ) : null}
      </Field>
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Sending…" : "Ask the reporter"}
      </Button>
    </form>
  );
}

export function ResumeAfterClarificationForm({
  ticketId,
  revision,
  needsReason,
}: TicketRef & { needsReason: boolean }) {
  const [state, formAction, isPending] = useActionState(
    resumeAfterClarificationAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TicketRefFields ticketId={ticketId} revision={revision} />
      {needsReason ? (
        <Field>
          <FieldLabel htmlFor="resume-reason">
            Why continue without an answer
          </FieldLabel>
          <Textarea
            id="resume-reason"
            name="reason"
            rows={2}
            maxLength={500}
            required
          />
        </Field>
      ) : null}
      <FormError error={state.error} />
      <Button
        type="submit"
        variant={needsReason ? "outline" : "default"}
        disabled={isPending}
        className="self-start"
      >
        {isPending
          ? "Saving…"
          : needsReason
            ? "Continue without an answer"
            : "Back to triage"}
      </Button>
    </form>
  );
}
