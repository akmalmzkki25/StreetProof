import "../scripts/load-root-env";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listAuditLog } from "./audit";
import { createDb } from "./client";
import { findIntakeSite } from "./reports";
import { auditLog, locations, sites, tenants } from "./schema";
import {
  addLocation,
  createSite,
  getTenantName,
  getTenantTimeZone,
  isValidIntakeCode,
  listSitesWithLocations,
  renameTenant,
  setSiteActive,
  updateLocation,
  updateSite,
} from "./sites";

const url = process.env.DATABASE_URL;

describe("isValidIntakeCode", () => {
  it("takes lowercase letters, numbers and dashes", () => {
    expect(isValidIntakeCode("menara-a2")).toBe(true);
    expect(isValidIntakeCode("Menara")).toBe(false);
    expect(isValidIntakeCode("-menara")).toBe(false);
    expect(isValidIntakeCode("ab")).toBe(false);
    expect(isValidIntakeCode("a".repeat(41))).toBe(false);
  });
});

describe.skipIf(!url)("site management (needs a local database)", () => {
  const { db, pool } = createDb(url ?? "");
  let tenantId = "";
  let otherTenantId = "";
  const actorId = null as unknown as string;

  // Its own tenants, so these tests can't disturb anyone reading the seeded ones.
  beforeAll(async () => {
    const [tenant] = await db
      .insert(tenants)
      .values({ name: "Sites test (synthetic)", isSynthetic: true })
      .returning();
    const [other] = await db
      .insert(tenants)
      .values({ name: "Other sites test (synthetic)", isSynthetic: true })
      .returning();
    if (!tenant || !other) throw new Error("Tenant insert returned nothing.");
    tenantId = tenant.id;
    otherTenantId = other.id;
  });

  afterAll(async () => {
    const ids = [tenantId, otherTenantId];
    await db.delete(auditLog).where(inArray(auditLog.tenantId, ids));
    await db.delete(locations).where(inArray(locations.tenantId, ids));
    await db.delete(sites).where(inArray(sites.tenantId, ids));
    await db.delete(tenants).where(inArray(tenants.id, ids));
    await pool.end();
  });

  function code() {
    return `site-${randomUUID().slice(0, 8)}`;
  }

  async function newSite(locationNames: string[] = ["Lobby"]) {
    const intakeCode = code();
    const outcome = await createSite(db, {
      tenantId,
      actorId,
      name: "Menara Uji",
      intakeCode,
      timezone: "Asia/Makassar",
      locationNames,
    });
    if (!outcome.ok) throw new Error(outcome.code);
    return { siteId: outcome.id, intakeCode };
  }

  it("creates a site that takes reports straight away, and audits it", async () => {
    const { siteId, intakeCode } = await newSite(["Lobby", "Lantai 2"]);

    const intake = await findIntakeSite(db, intakeCode);
    expect(intake?.id).toBe(siteId);
    expect(intake?.locations.map((item) => item.name).sort()).toEqual([
      "Lantai 2",
      "Lobby",
    ]);
    const listed = await listSitesWithLocations(db, tenantId);
    expect(listed.find((site) => site.id === siteId)?.timezone).toBe(
      "Asia/Makassar",
    );
    const audit = await listAuditLog(db, tenantId);
    expect(audit.some((row) => row.action === "site.created")).toBe(true);
  });

  it("refuses a report code another site uses, and an unknown time zone", async () => {
    const { intakeCode } = await newSite();
    expect(
      await createSite(db, {
        tenantId: otherTenantId,
        actorId,
        name: "Copy",
        intakeCode,
        timezone: "Asia/Jakarta",
        locationNames: [],
      }),
    ).toEqual({ ok: false, code: "intake_code_taken" });
    expect(
      await createSite(db, {
        tenantId,
        actorId,
        name: "Abroad",
        intakeCode: code(),
        timezone: "Europe/Berlin",
        locationNames: [],
      }),
    ).toEqual({ ok: false, code: "invalid_time_zone" });
  });

  it("moves a site to a new code, which stops the old link", async () => {
    const { siteId, intakeCode } = await newSite();
    const next = code();

    const outcome = await updateSite(db, {
      tenantId,
      actorId,
      siteId,
      name: "Menara Baru",
      intakeCode: next,
      timezone: "Asia/Jayapura",
    });

    expect(outcome.ok).toBe(true);
    expect(await findIntakeSite(db, intakeCode)).toBeNull();
    expect((await findIntakeSite(db, next))?.name).toBe("Menara Baru");
  });

  it("keeps another tenant's site out of reach", async () => {
    const { siteId } = await newSite();
    expect(
      await setSiteActive(db, {
        tenantId: otherTenantId,
        actorId,
        siteId,
        active: false,
      }),
    ).toEqual({ ok: false, code: "not_found" });
    expect(
      await addLocation(db, {
        tenantId: otherTenantId,
        actorId,
        siteId,
        name: "Sneaky",
      }),
    ).toEqual({ ok: false, code: "not_found" });
  });

  it("stops new reports at an inactive site, then takes them again", async () => {
    const { siteId, intakeCode } = await newSite();

    await setSiteActive(db, { tenantId, actorId, siteId, active: false });
    expect(await findIntakeSite(db, intakeCode)).toBeNull();

    await setSiteActive(db, { tenantId, actorId, siteId, active: true });
    expect(await findIntakeSite(db, intakeCode)).not.toBeNull();
  });

  it("adds, renames and retires locations without duplicate names", async () => {
    const { siteId, intakeCode } = await newSite(["Lobby"]);

    expect(
      await addLocation(db, { tenantId, actorId, siteId, name: "lobby" }),
    ).toEqual({ ok: false, code: "location_exists" });
    const added = await addLocation(db, {
      tenantId,
      actorId,
      siteId,
      name: "Roof",
    });
    if (!added.ok) throw new Error(added.code);

    await updateLocation(db, {
      tenantId,
      actorId,
      locationId: added.id,
      name: "Roof deck",
      active: true,
    });
    const [lobby] = await db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.siteId, siteId));
    if (!lobby) throw new Error("No lobby.");
    expect(
      await updateLocation(db, {
        tenantId,
        actorId,
        locationId: lobby.id,
        name: "Roof deck",
        active: true,
      }),
    ).toEqual({ ok: false, code: "location_exists" });
    await updateLocation(db, {
      tenantId,
      actorId,
      locationId: lobby.id,
      name: "Lobby",
      active: false,
    });

    const intake = await findIntakeSite(db, intakeCode);
    expect(intake?.locations.map((item) => item.name)).toEqual(["Roof deck"]);
  });

  it("renames the organisation and finds its main time zone", async () => {
    expect(
      await renameTenant(db, { tenantId, actorId, name: "Sites test 2" }),
    ).toMatchObject({ ok: true });
    expect(await getTenantName(db, tenantId)).toBe("Sites test 2");
    expect(await getTenantTimeZone(db, tenantId)).toBe("Asia/Makassar");
  });
});
