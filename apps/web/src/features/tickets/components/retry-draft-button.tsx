"use client";

import { Button } from "@streetproof/ui/components/button";
import { useActionState } from "react";

import { retryDraftAction, type TicketActionState } from "../actions";
import { FormError } from "./ticket-forms";

const initialState: TicketActionState = { error: null };

export function RetryDraftButton({ ticketId }: { ticketId: string }) {
  const [state, formAction, isPending] = useActionState(
    retryDraftAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Asking again…" : "Try again"}
      </Button>
    </form>
  );
}
