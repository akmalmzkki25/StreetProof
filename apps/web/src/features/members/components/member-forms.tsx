"use client";

import { ROLES, type Role } from "@streetproof/domain";
import { Button } from "@streetproof/ui/components/button";
import { Checkbox } from "@streetproof/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import { useActionState } from "react";

import {
  FormError,
  SelectField,
} from "@/features/tickets/components/ticket-forms";

import {
  addMemberAction,
  addTeamAction,
  setActiveAction,
  setPasswordAction,
  updateAccessAction,
  type MemberActionState,
} from "../actions";
import { ROLE_LABELS } from "../labels";

const initialState: MemberActionState = { error: null, isDone: false };

type Site = { id: string; name: string };

function siteOptions(sites: Site[]) {
  return [
    { value: "all", label: "All sites" },
    ...sites.map((site) => ({ value: site.id, label: site.name })),
  ];
}

function RoleChoices({
  idPrefix,
  checked,
}: {
  idPrefix: string;
  checked: readonly Role[];
}) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Roles</FieldLegend>
      <FieldGroup className="gap-2">
        {ROLES.map((role) => (
          <Field key={role} orientation="horizontal">
            <Checkbox
              id={`${idPrefix}-${role}`}
              name="roles"
              value={role}
              defaultChecked={checked.includes(role)}
            />
            <FieldLabel htmlFor={`${idPrefix}-${role}`} className="font-normal">
              {ROLE_LABELS[role]}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

export function AddMemberForm({ sites }: { sites: Site[] }) {
  const [state, formAction, isPending] = useActionState(
    addMemberAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-name">Name</FieldLabel>
          <Input id="new-name" name="name" maxLength={100} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-email">Email</FieldLabel>
          <Input id="new-email" name="email" type="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-password">First password</FieldLabel>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FieldDescription>
            Pass it on privately. They can change it through &quot;Forgot your
            password?&quot; when email is set up.
          </FieldDescription>
        </Field>
        <RoleChoices idPrefix="new" checked={[]} />
        <SelectField
          id="site"
          label="Site"
          placeholder="Choose a site"
          options={siteOptions(sites)}
          defaultValue="all"
        />
      </FieldGroup>
      <FormError error={state.error} />
      {state.isDone ? <p role="status">Member added.</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Adding…" : "Add member"}
      </Button>
    </form>
  );
}

export function MemberAccessForm({
  userId,
  roles,
  siteId,
  sites,
}: {
  userId: string;
  roles: readonly Role[];
  siteId: string | null;
  sites: Site[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateAccessAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />
      <RoleChoices idPrefix={userId} checked={roles} />
      <SelectField
        id="site"
        label="Site"
        placeholder="Choose a site"
        options={siteOptions(sites)}
        defaultValue={siteId ?? "all"}
      />
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Saving…" : "Save access"}
      </Button>
    </form>
  );
}

export function SetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(
    setPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      <Field>
        <FieldLabel htmlFor={`password-${userId}`}>New password</FieldLabel>
        <Input
          id={`password-${userId}`}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <FormError error={state.error} />
      {state.isDone ? (
        <p role="status" className="type-caption text-muted-foreground">
          Password set. They were signed out everywhere.
        </p>
      ) : null}
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Saving…" : "Set password"}
      </Button>
    </form>
  );
}

export function MemberActiveForm({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    setActiveAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <FormError error={state.error} />
      <Button
        type="submit"
        variant={isActive ? "destructive" : "outline"}
        disabled={isPending}
        className="self-start"
      >
        {isActive ? "Deactivate" : "Reactivate"}
      </Button>
    </form>
  );
}

export function AddTeamForm() {
  const [state, formAction, isPending] = useActionState(
    addTeamAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="team-name">New team</FieldLabel>
        <Input id="team-name" name="name" maxLength={60} required />
      </Field>
      <FormError error={state.error} />
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? "Adding…" : "Add team"}
      </Button>
    </form>
  );
}
