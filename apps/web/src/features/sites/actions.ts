"use server";

import {
  addLocation,
  createSite,
  getDb,
  isValidIntakeCode,
  renameTenant,
  setSiteActive,
  updateLocation,
  updateSite,
  type SiteOutcome,
} from "@streetproof/db";
import { SITE_TIME_ZONES } from "@streetproof/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/member";

export type SiteActionState = { error: string | null; isDone: boolean };

const name = z
  .string()
  .trim()
  .min(2, "Enter a name of at least 2 characters.")
  .max(100, "Keep the name under 100 characters.");

const intakeCode = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    isValidIntakeCode,
    "Use 3 to 40 lowercase letters, numbers or dashes for the report code.",
  );

const timezone = z.enum(SITE_TIME_ZONES, { error: "Choose a time zone." });

// A pin is optional; when it's there both coordinates come with it.
const place = {
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  address: z.string().trim().max(300).optional(),
};

const siteFields = z.object({
  name,
  intakeCode,
  timezone,
  locations: z.string().max(5000),
  ...place,
});

const editFields = z.object({
  siteId: z.uuid(),
  name,
  intakeCode,
  timezone,
  ...place,
});

function placeOf(fields: {
  latitude?: number | undefined;
  longitude?: number | undefined;
  address?: string | undefined;
}) {
  if (fields.latitude === undefined || fields.longitude === undefined) {
    return null;
  }
  return {
    latitude: fields.latitude,
    longitude: fields.longitude,
    address: fields.address || null,
  };
}

function optional(formData: FormData, key: string) {
  return formData.get(key) ?? undefined;
}
const activeFields = z.object({
  siteId: z.uuid(),
  active: z.enum(["true", "false"]),
});
const locationFields = z.object({ siteId: z.uuid(), name });
const locationEditFields = z.object({
  locationId: z.uuid(),
  name,
  active: z.enum(["true", "false"]),
});
const tenantFields = z.object({ name });

const OUTCOME_MESSAGES: Record<
  Extract<SiteOutcome, { ok: false }>["code"],
  string
> = {
  not_found: "This site isn't available.",
  intake_code_taken: "Another site already uses that report code.",
  location_exists: "This site already has a location with that name.",
  invalid_time_zone: "Choose a time zone.",
};

function finish(outcome: SiteOutcome): SiteActionState {
  if (!outcome.ok) {
    return { error: OUTCOME_MESSAGES[outcome.code], isDone: false };
  }
  revalidatePath("/[lang]/app/sites", "page");
  return { error: null, isDone: true };
}

function invalid(error: z.ZodError): SiteActionState {
  return {
    error: error.issues[0]?.message ?? "Check the form.",
    isDone: false,
  };
}

// One location per line or comma, blanks and repeats dropped.
function locationNamesOf(text: string) {
  return [
    ...new Set(
      text
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ].slice(0, 50);
}

export async function createSiteAction(
  _previous: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const member = await requireRole("tenant_admin");
  const fields = siteFields.safeParse({
    name: formData.get("name") ?? "",
    intakeCode: formData.get("intakeCode") ?? "",
    timezone: formData.get("timezone"),
    locations: formData.get("locations") ?? "",
    latitude: optional(formData, "latitude"),
    longitude: optional(formData, "longitude"),
    address: optional(formData, "address"),
  });
  if (!fields.success) return invalid(fields.error);
  const locationNames = locationNamesOf(fields.data.locations);
  if (locationNames.some((item) => item.length > 100)) {
    return { error: "Keep each location under 100 characters.", isDone: false };
  }

  return finish(
    await createSite(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      name: fields.data.name,
      intakeCode: fields.data.intakeCode,
      timezone: fields.data.timezone,
      place: placeOf(fields.data),
      locationNames,
    }),
  );
}

export async function updateSiteAction(
  _previous: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const member = await requireRole("tenant_admin");
  const fields = editFields.safeParse({
    siteId: formData.get("siteId"),
    name: formData.get("name") ?? "",
    intakeCode: formData.get("intakeCode") ?? "",
    timezone: formData.get("timezone"),
    latitude: optional(formData, "latitude"),
    longitude: optional(formData, "longitude"),
    address: optional(formData, "address"),
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await updateSite(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      siteId: fields.data.siteId,
      name: fields.data.name,
      intakeCode: fields.data.intakeCode,
      timezone: fields.data.timezone,
      place: placeOf(fields.data),
    }),
  );
}

export async function setSiteActiveAction(
  _previous: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const member = await requireRole("tenant_admin");
  const fields = activeFields.safeParse({
    siteId: formData.get("siteId"),
    active: formData.get("active"),
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await setSiteActive(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      siteId: fields.data.siteId,
      active: fields.data.active === "true",
    }),
  );
}

export async function addLocationAction(
  _previous: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const member = await requireRole("tenant_admin");
  const fields = locationFields.safeParse({
    siteId: formData.get("siteId"),
    name: formData.get("name") ?? "",
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await addLocation(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      ...fields.data,
    }),
  );
}

export async function updateLocationAction(
  _previous: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const member = await requireRole("tenant_admin");
  const fields = locationEditFields.safeParse({
    locationId: formData.get("locationId"),
    name: formData.get("name") ?? "",
    active: formData.get("active"),
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await updateLocation(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      locationId: fields.data.locationId,
      name: fields.data.name,
      active: fields.data.active === "true",
    }),
  );
}

export async function renameTenantAction(
  _previous: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const member = await requireRole("tenant_admin");
  const fields = tenantFields.safeParse({ name: formData.get("name") ?? "" });
  if (!fields.success) return invalid(fields.error);

  const outcome = await renameTenant(getDb(), {
    tenantId: member.tenantId,
    actorId: member.userId,
    name: fields.data.name,
  });
  // The name shows in the sidebar on every page.
  if (outcome.ok) revalidatePath("/[lang]/app", "layout");
  return finish(outcome);
}
