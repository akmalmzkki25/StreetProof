"use client";

import { SITE_TIME_ZONES, timeZoneLabel } from "@streetproof/domain";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import { Textarea } from "@streetproof/ui/components/textarea";
import { useActionState } from "react";

import { PlacePicker } from "@/features/places/components/place-picker";
import {
  FormError,
  SelectField,
} from "@/features/tickets/components/ticket-forms";
import { useI18n } from "@/lib/i18n/client";

import {
  addLocationAction,
  createSiteAction,
  renameTenantAction,
  setSiteActiveAction,
  updateLocationAction,
  updateSiteAction,
  type SiteActionState,
} from "../actions";

const initialState: SiteActionState = { error: null, isDone: false };

const TIME_ZONE_OPTIONS = SITE_TIME_ZONES.map((zone) => ({
  value: zone,
  label: `${timeZoneLabel(zone)} (${zone})`,
}));

type SitePlaceValue = {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

function SiteFields({
  idPrefix,
  name,
  intakeCode,
  timezone,
  place,
}: {
  idPrefix: string;
  name?: string;
  intakeCode?: string | null;
  timezone?: string;
  place?: SitePlaceValue;
}) {
  const { t } = useI18n();
  const initialPlace =
    place?.latitude != null && place.longitude != null
      ? {
          latitude: place.latitude,
          longitude: place.longitude,
          address: place.address,
        }
      : null;
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-name`}>
          {t("Building name")}
        </FieldLabel>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          maxLength={100}
          defaultValue={name}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-code`}>{t("Report code")}</FieldLabel>
        <Input
          id={`${idPrefix}-code`}
          name="intakeCode"
          maxLength={40}
          defaultValue={intakeCode ?? ""}
          pattern="[a-z0-9][a-z0-9\-]{2,39}"
          autoCapitalize="none"
          spellCheck={false}
          className="font-mono"
          required
        />
        <FieldDescription>
          {t(
            "Lowercase letters, numbers and dashes. It's in the report link, the QR poster and the Telegram link.",
          )}
        </FieldDescription>
      </Field>
      <SelectField
        id={`${idPrefix}-timezone`}
        name="timezone"
        label="Time zone"
        placeholder="Choose a time zone"
        options={TIME_ZONE_OPTIONS}
        defaultValue={timezone ?? "Asia/Jakarta"}
      />
      <PlacePicker
        id={`${idPrefix}-place`}
        label="Address (optional)"
        description="Shown to staff on the map in each ticket, and used to centre the reporter's map."
        initial={initialPlace}
        center={null}
        withAddress
      />
    </>
  );
}

export function AddSiteForm() {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    createSiteAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
        <SiteFields idPrefix="new-site" />
        <Field>
          <FieldLabel htmlFor="new-site-locations">{t("Locations")}</FieldLabel>
          <Textarea
            id="new-site-locations"
            name="locations"
            rows={4}
            placeholder={t("Lobby, Floor 2 pantry, Basement parking")}
          />
          <FieldDescription>
            {t("One per line, or separated by commas. You can add more later.")}
          </FieldDescription>
        </Field>
      </FieldGroup>
      <FormError error={state.error} />
      {state.isDone ? <p role="status">{t("Site added.")}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Adding…") : t("Add site")}
      </Button>
    </form>
  );
}

export function EditSiteForm({
  siteId,
  name,
  intakeCode,
  timezone,
  place,
}: {
  siteId: string;
  name: string;
  intakeCode: string | null;
  timezone: string;
  place: SitePlaceValue;
}) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    updateSiteAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="siteId" value={siteId} />
      <FieldGroup>
        <SiteFields
          idPrefix={`site-${siteId}`}
          name={name}
          intakeCode={intakeCode}
          timezone={timezone}
          place={place}
        />
      </FieldGroup>
      <p className="type-caption text-muted-foreground">
        {t(
          "Changing the report code stops the old link, QR poster and Telegram link from working.",
        )}
      </p>
      <FormError error={state.error} />
      {state.isDone ? <p role="status">{t("Site saved.")}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Saving…") : t("Save site")}
      </Button>
    </form>
  );
}

export function SiteActiveForm({
  siteId,
  isActive,
}: {
  siteId: string;
  isActive: boolean;
}) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    setSiteActiveAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 border-t pt-6">
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="active" value={isActive ? "false" : "true"} />
      <p className="type-caption text-muted-foreground">
        {isActive
          ? t(
              "Deactivating stops new reports at this site. Its tickets and history stay.",
            )
          : t("This site takes no new reports.")}
      </p>
      <FormError error={state.error} />
      <Button
        type="submit"
        variant={isActive ? "destructive" : "secondary"}
        disabled={isPending}
        className="self-start"
      >
        {isActive ? t("Deactivate site") : t("Reactivate site")}
      </Button>
    </form>
  );
}

export function AddLocationForm({ siteId }: { siteId: string }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    addLocationAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="siteId" value={siteId} />
      <Field>
        <FieldLabel htmlFor={`add-location-${siteId}`}>
          {t("New location")}
        </FieldLabel>
        <div className="flex gap-2">
          <Input
            id={`add-location-${siteId}`}
            name="name"
            maxLength={100}
            required
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            {t("Add")}
          </Button>
        </div>
      </Field>
      <FormError error={state.error} />
    </form>
  );
}

export function LocationRow({
  location,
}: {
  location: { id: string; name: string; active: boolean };
}) {
  const { t } = useI18n();
  const [renameState, renameAction, isRenaming] = useActionState(
    updateLocationAction,
    initialState,
  );
  const [activeState, activeAction, isToggling] = useActionState(
    updateLocationAction,
    initialState,
  );

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <form action={renameAction} className="flex min-w-0 flex-1 gap-2">
          <input type="hidden" name="locationId" value={location.id} />
          <input type="hidden" name="active" value={String(location.active)} />
          <Input
            aria-label={t("Location name")}
            name="name"
            maxLength={100}
            defaultValue={location.name}
            className={location.active ? "" : "text-muted-foreground"}
            required
          />
          <Button type="submit" variant="ghost" size="sm" disabled={isRenaming}>
            {t("Rename")}
          </Button>
        </form>
        <form action={activeAction}>
          <input type="hidden" name="locationId" value={location.id} />
          <input type="hidden" name="name" value={location.name} />
          <input
            type="hidden"
            name="active"
            value={location.active ? "false" : "true"}
          />
          <Button type="submit" variant="ghost" size="sm" disabled={isToggling}>
            {location.active ? t("Retire") : t("Bring back")}
          </Button>
        </form>
      </div>
      <FormError error={renameState.error ?? activeState.error} />
    </li>
  );
}

export function TenantNameForm({ name }: { name: string }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    renameTenantAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="tenant-name">{t("Organisation name")}</FieldLabel>
        <Input
          id="tenant-name"
          name="name"
          maxLength={100}
          defaultValue={name}
          required
        />
        <FieldDescription>
          {t("Shown to staff in the menu under their name.")}
        </FieldDescription>
      </Field>
      <FormError error={state.error} />
      {state.isDone ? <p role="status">{t("Organisation saved.")}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("Saving…") : t("Save")}
      </Button>
    </form>
  );
}
