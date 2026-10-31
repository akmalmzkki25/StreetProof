"use client";

import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Textarea } from "@streetproof/ui/components/textarea";
import { useActionState } from "react";

import { useI18n } from "@/lib/i18n/client";

import {
  linkDuplicateAction,
  unlinkDuplicateAction,
  type TicketActionState,
} from "../actions";
import { FormError, SelectField, TicketRefFields } from "./ticket-forms";
import { useSuggestedDefaults } from "./use-suggested-defaults";

const initialState: TicketActionState = { error: null };

type TicketRef = { ticketId: string; revision: number };

export function LinkDuplicateForm({
  ticketId,
  revision,
  suggestionKey,
  candidates,
  defaultTargetId,
  defaultReason,
}: TicketRef & {
  suggestionKey: string;
  candidates: { value: string; label: string }[];
  defaultTargetId: string | null;
  defaultReason: string;
}) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    linkDuplicateAction,
    initialState,
  );
  const { formKey, defaults, markEdited } = useSuggestedDefaults(
    suggestionKey,
    { targetId: defaultTargetId, reason: defaultReason },
  );

  return (
    <form
      key={formKey}
      action={formAction}
      onChange={markEdited}
      className="flex flex-col gap-5"
    >
      <TicketRefFields ticketId={ticketId} revision={revision} />
      <FieldGroup>
        <SelectField
          id="targetTicketId"
          label="Ticket for the same problem"
          placeholder="Choose a ticket"
          options={candidates}
          defaultValue={defaults.targetId}
          onChange={markEdited}
        />
        <Field>
          <FieldLabel htmlFor="link-reason">{t("Why they match")}</FieldLabel>
          <Textarea
            id="link-reason"
            name="reason"
            rows={2}
            maxLength={500}
            defaultValue={defaults.reason}
            required
          />
          <FieldDescription>
            {t(
              "This report stays on record and its reporter follows the other ticket's progress.",
            )}
          </FieldDescription>
        </Field>
      </FieldGroup>
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? t("Linking…") : t("Link as duplicate")}
      </Button>
    </form>
  );
}

export function UnlinkDuplicateForm({ ticketId, revision }: TicketRef) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    unlinkDuplicateAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TicketRefFields ticketId={ticketId} revision={revision} />
      <Field>
        <FieldLabel htmlFor="unlink-reason">
          {t("Why this is a new problem")}
        </FieldLabel>
        <Textarea
          id="unlink-reason"
          name="reason"
          rows={2}
          maxLength={500}
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
        {isPending ? t("Removing…") : t("Remove link")}
      </Button>
    </form>
  );
}
