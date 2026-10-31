"use client";

import { Button } from "@streetproof/ui/components/button";
import { useActionState } from "react";

import { useI18n } from "@/lib/i18n/client";

import { retryDraftAction, type TicketActionState } from "../actions";
import { FormError } from "./ticket-forms";

const initialState: TicketActionState = { error: null };

export function RetryDraftButton({ ticketId }: { ticketId: string }) {
  const { t } = useI18n();
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
        {isPending ? t("Asking again…") : t("Try again")}
      </Button>
    </form>
  );
}
