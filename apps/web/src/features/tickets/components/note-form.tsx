"use client";

import { Button } from "@streetproof/ui/components/button";
import { Field, FieldLabel } from "@streetproof/ui/components/field";
import { Textarea } from "@streetproof/ui/components/textarea";
import { useActionState } from "react";

import { useI18n } from "@/lib/i18n/client";

import { addNoteAction, type TicketActionState } from "../actions";
import { FormError } from "./ticket-forms";

const initialState: TicketActionState = { error: null };

export function NoteForm({ ticketId }: { ticketId: string }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    addNoteAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <Field>
        <FieldLabel htmlFor="note-body">{t("Add a note")}</FieldLabel>
        <Textarea
          id="note-body"
          name="body"
          rows={2}
          maxLength={1000}
          required
        />
      </Field>
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? t("Saving…") : t("Save note")}
      </Button>
    </form>
  );
}
