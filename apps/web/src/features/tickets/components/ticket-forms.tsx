"use client";

import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@streetproof/domain";
import { Alert, AlertDescription } from "@streetproof/ui/components/alert";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@streetproof/ui/components/select";
import { Textarea } from "@streetproof/ui/components/textarea";
import { useActionState } from "react";

import {
  assignAction,
  cancelAction,
  triageAction,
  type TicketActionState,
} from "../actions";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../labels";

const initialState: TicketActionState = { error: null };

type Option = { value: string; label: string };
type TicketRef = { ticketId: string; revision: number };

function TicketRefFields({ ticketId, revision }: TicketRef) {
  return (
    <>
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="expectedRevision" value={revision} />
    </>
  );
}

function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

function SelectField({
  id,
  label,
  placeholder,
  options,
  defaultValue,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: Option[];
  defaultValue?: string | null;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select name={id} items={options} defaultValue={defaultValue ?? null}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

const categoryOptions = TICKET_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));
const priorityOptions = TICKET_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

export function TriageForm({
  ticketId,
  revision,
  defaultSummary,
  locations,
  defaultLocationId,
}: TicketRef & {
  defaultSummary: string;
  locations: { id: string; name: string }[];
  defaultLocationId: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    triageAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TicketRefFields ticketId={ticketId} revision={revision} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="summary">Summary</FieldLabel>
          <Input
            id="summary"
            name="summary"
            maxLength={200}
            defaultValue={defaultSummary}
            required
          />
        </Field>
        <SelectField
          id="category"
          label="Category"
          placeholder="Choose a category"
          options={categoryOptions}
        />
        <SelectField
          id="priority"
          label="Priority"
          placeholder="Choose a priority"
          options={priorityOptions}
          defaultValue="normal"
        />
        <SelectField
          id="locationId"
          label="Location"
          placeholder="Keep the reporter's description"
          options={locations.map((location) => ({
            value: location.id,
            label: location.name,
          }))}
          defaultValue={defaultLocationId}
        />
      </FieldGroup>
      <FormError error={state.error} />
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : "Confirm triage"}
      </Button>
    </form>
  );
}

export function AssignForm({
  ticketId,
  revision,
  technicians,
}: TicketRef & { technicians: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(
    assignAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TicketRefFields ticketId={ticketId} revision={revision} />
      <SelectField
        id="technicianId"
        label="Technician"
        placeholder="Choose a technician"
        options={technicians.map((technician) => ({
          value: technician.id,
          label: technician.name,
        }))}
      />
      <FormError error={state.error} />
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Assigning…" : "Assign technician"}
      </Button>
    </form>
  );
}

export function CancelForm({ ticketId, revision }: TicketRef) {
  const [state, formAction, isPending] = useActionState(
    cancelAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TicketRefFields ticketId={ticketId} revision={revision} />
      <Field>
        <FieldLabel htmlFor="reason">Reason for cancelling</FieldLabel>
        <Textarea id="reason" name="reason" rows={2} maxLength={500} required />
      </Field>
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="destructive"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Cancelling…" : "Cancel ticket"}
      </Button>
    </form>
  );
}
