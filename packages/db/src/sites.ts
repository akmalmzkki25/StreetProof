import { SITE_TIME_ZONES, type SiteTimeZone } from "@streetproof/domain";
import { and, asc, eq, ne } from "drizzle-orm";
import { recordAudit } from "./audit";
import type { Db, Transaction } from "./client";
import { locations, sites, tenants } from "./schema";

export type SiteOutcome =
  | { ok: true; id: string }
  | {
      ok: false;
      code:
        | "not_found"
        | "intake_code_taken"
        | "location_exists"
        | "invalid_time_zone";
    };

const INTAKE_CODE = /^[a-z0-9][a-z0-9-]{2,39}$/;

// The code in a site's report link, QR and Telegram link. Lowercase so a code
// read aloud or typed from a poster still matches.
export function isValidIntakeCode(code: string) {
  return INTAKE_CODE.test(code);
}

function isSiteTimeZone(value: string): value is SiteTimeZone {
  return (SITE_TIME_ZONES as readonly string[]).includes(value);
}

export type SitePlace = {
  address: string | null;
  latitude: number;
  longitude: number;
};

// No place clears all three, so a building never keeps an address without its pin.
function placeColumns(place: SitePlace | null | undefined) {
  return {
    address: place?.address ?? null,
    latitude: place?.latitude ?? null,
    longitude: place?.longitude ?? null,
  };
}

export async function listSitesWithLocations(db: Db, tenantId: string) {
  const siteRows = await db
    .select({
      id: sites.id,
      name: sites.name,
      intakeCode: sites.intakeCode,
      timezone: sites.timezone,
      address: sites.address,
      latitude: sites.latitude,
      longitude: sites.longitude,
      active: sites.active,
    })
    .from(sites)
    .where(eq(sites.tenantId, tenantId))
    .orderBy(asc(sites.name));
  const locationRows = await db
    .select({
      id: locations.id,
      siteId: locations.siteId,
      name: locations.name,
      active: locations.active,
    })
    .from(locations)
    .where(eq(locations.tenantId, tenantId))
    .orderBy(asc(locations.name));

  return siteRows.map((site) => ({
    ...site,
    locations: locationRows.filter((location) => location.siteId === site.id),
  }));
}

export async function getTenantName(db: Db, tenantId: string) {
  const [tenant] = await db
    .select({ name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, tenantId));
  return tenant?.name ?? null;
}

// The zone for tenant-wide views, like the audit log: the first active site's.
export async function getTenantTimeZone(db: Db, tenantId: string) {
  const [site] = await db
    .select({ timezone: sites.timezone })
    .from(sites)
    .where(and(eq(sites.tenantId, tenantId), eq(sites.active, true)))
    .orderBy(asc(sites.createdAt))
    .limit(1);
  return site?.timezone ?? null;
}

export async function renameTenant(
  db: Db,
  input: { tenantId: string; actorId: string; name: string },
): Promise<SiteOutcome> {
  return db.transaction(async function run(tx) {
    const [tenant] = await tx
      .update(tenants)
      .set({ name: input.name })
      .where(eq(tenants.id, input.tenantId))
      .returning({ id: tenants.id });
    if (!tenant) return { ok: false, code: "not_found" };
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "tenant.renamed",
      targetType: "tenant",
      targetId: tenant.id,
      metadata: { name: input.name },
    });
    return { ok: true, id: tenant.id };
  });
}

async function isCodeTaken(
  tx: Transaction,
  intakeCode: string,
  exceptSiteId?: string,
) {
  const [site] = await tx
    .select({ id: sites.id })
    .from(sites)
    .where(
      and(
        eq(sites.intakeCode, intakeCode),
        exceptSiteId ? ne(sites.id, exceptSiteId) : undefined,
      ),
    );
  return site !== undefined;
}

export async function createSite(
  db: Db,
  input: {
    tenantId: string;
    actorId: string;
    name: string;
    intakeCode: string;
    timezone: string;
    place?: SitePlace | null;
    locationNames: readonly string[];
  },
): Promise<SiteOutcome> {
  if (!isSiteTimeZone(input.timezone)) {
    return { ok: false, code: "invalid_time_zone" };
  }
  return db.transaction(async function run(tx) {
    if (await isCodeTaken(tx, input.intakeCode)) {
      return { ok: false, code: "intake_code_taken" };
    }
    const [site] = await tx
      .insert(sites)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        intakeCode: input.intakeCode,
        timezone: input.timezone,
        ...placeColumns(input.place),
      })
      .returning({ id: sites.id });
    if (!site) throw new Error("Site insert returned nothing.");

    if (input.locationNames.length > 0) {
      await tx.insert(locations).values(
        input.locationNames.map((name) => ({
          tenantId: input.tenantId,
          siteId: site.id,
          name,
        })),
      );
    }
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "site.created",
      targetType: "site",
      targetId: site.id,
      metadata: { name: input.name, intakeCode: input.intakeCode },
    });
    return { ok: true, id: site.id };
  });
}

// A new code stops the old report link, QR and Telegram link from working.
export async function updateSite(
  db: Db,
  input: {
    tenantId: string;
    actorId: string;
    siteId: string;
    name: string;
    intakeCode: string;
    timezone: string;
    place?: SitePlace | null;
  },
): Promise<SiteOutcome> {
  if (!isSiteTimeZone(input.timezone)) {
    return { ok: false, code: "invalid_time_zone" };
  }
  return db.transaction(async function run(tx) {
    if (await isCodeTaken(tx, input.intakeCode, input.siteId)) {
      return { ok: false, code: "intake_code_taken" };
    }
    const [before] = await tx
      .select({ intakeCode: sites.intakeCode })
      .from(sites)
      .where(
        and(eq(sites.tenantId, input.tenantId), eq(sites.id, input.siteId)),
      )
      .for("update");
    if (!before) return { ok: false, code: "not_found" };

    await tx
      .update(sites)
      .set({
        name: input.name,
        intakeCode: input.intakeCode,
        timezone: input.timezone,
        ...placeColumns(input.place),
      })
      .where(eq(sites.id, input.siteId));
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "site.updated",
      targetType: "site",
      targetId: input.siteId,
      metadata: {
        name: input.name,
        timezone: input.timezone,
        ...(before.intakeCode !== input.intakeCode
          ? { intakeCode: input.intakeCode, previousCode: before.intakeCode }
          : {}),
      },
    });
    return { ok: true, id: input.siteId };
  });
}

// An inactive site keeps its tickets and history; only new reports stop.
export async function setSiteActive(
  db: Db,
  input: { tenantId: string; actorId: string; siteId: string; active: boolean },
): Promise<SiteOutcome> {
  return db.transaction(async function run(tx) {
    const [site] = await tx
      .update(sites)
      .set({ active: input.active })
      .where(
        and(eq(sites.tenantId, input.tenantId), eq(sites.id, input.siteId)),
      )
      .returning({ id: sites.id });
    if (!site) return { ok: false, code: "not_found" };
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: input.active ? "site.activated" : "site.deactivated",
      targetType: "site",
      targetId: site.id,
    });
    return { ok: true, id: site.id };
  });
}

async function hasActiveLocationNamed(
  tx: Transaction,
  siteId: string,
  name: string,
  exceptLocationId?: string,
) {
  const rows = await tx
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .where(and(eq(locations.siteId, siteId), eq(locations.active, true)));
  return rows.some(
    (row) =>
      row.id !== exceptLocationId &&
      row.name.toLowerCase() === name.toLowerCase(),
  );
}

export async function addLocation(
  db: Db,
  input: { tenantId: string; actorId: string; siteId: string; name: string },
): Promise<SiteOutcome> {
  return db.transaction(async function run(tx) {
    const [site] = await tx
      .select({ id: sites.id })
      .from(sites)
      .where(
        and(eq(sites.tenantId, input.tenantId), eq(sites.id, input.siteId)),
      );
    if (!site) return { ok: false, code: "not_found" };
    if (await hasActiveLocationNamed(tx, site.id, input.name)) {
      return { ok: false, code: "location_exists" };
    }
    const [location] = await tx
      .insert(locations)
      .values({ tenantId: input.tenantId, siteId: site.id, name: input.name })
      .returning({ id: locations.id });
    if (!location) throw new Error("Location insert returned nothing.");
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "location.created",
      targetType: "location",
      targetId: location.id,
      metadata: { siteId: site.id, name: input.name },
    });
    return { ok: true, id: location.id };
  });
}

// Tickets keep pointing at a location after it's renamed or deactivated; an
// inactive one only leaves the report form and the triage list.
export async function updateLocation(
  db: Db,
  input: {
    tenantId: string;
    actorId: string;
    locationId: string;
    name: string;
    active: boolean;
  },
): Promise<SiteOutcome> {
  return db.transaction(async function run(tx) {
    const [location] = await tx
      .select({ id: locations.id, siteId: locations.siteId })
      .from(locations)
      .where(
        and(
          eq(locations.tenantId, input.tenantId),
          eq(locations.id, input.locationId),
        ),
      )
      .for("update");
    if (!location) return { ok: false, code: "not_found" };
    if (
      input.active &&
      (await hasActiveLocationNamed(
        tx,
        location.siteId,
        input.name,
        location.id,
      ))
    ) {
      return { ok: false, code: "location_exists" };
    }
    await tx
      .update(locations)
      .set({ name: input.name, active: input.active })
      .where(eq(locations.id, location.id));
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "location.updated",
      targetType: "location",
      targetId: location.id,
      metadata: { name: input.name, active: input.active },
    });
    return { ok: true, id: location.id };
  });
}
