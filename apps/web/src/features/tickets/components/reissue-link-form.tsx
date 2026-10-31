"use client";

import { Button } from "@streetproof/ui/components/button";
import { Input } from "@streetproof/ui/components/input";
import { useActionState } from "react";

import {
  reissueStatusLinkAction,
  type ReissueState,
} from "../status-link-actions";
import { FormError } from "./ticket-forms";

const initialState: ReissueState = { url: null, error: null };

export function ReissueLinkForm({
  ticketId,
  reportId,
}: {
  ticketId: string;
  reportId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    reissueStatusLinkAction,
    initialState,
  );

  if (state.url) {
    return (
      <div className="flex flex-col gap-2">
        <Input
          readOnly
          aria-label="New status link"
          value={state.url}
          className="font-mono"
        />
        <p className="type-caption text-muted-foreground">
          Send this to the reporter now. It isn&apos;t shown again, and their
          old link has stopped working.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="reportId" value={reportId} />
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Creating…" : "Create a new status link"}
      </Button>
    </form>
  );
}
