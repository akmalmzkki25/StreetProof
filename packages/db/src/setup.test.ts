import "../scripts/load-root-env";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { findIntakeSite } from "./reports";
import {
  account,
  auditLog,
  locations,
  memberships,
  sites,
  tenants,
  user,
} from "./schema";
import {
  parseLocationNames,
  parseRoles,
  setupProblem,
  setupTenant,
} from "./setup";

function answers(overrides: Partial<Parameters<typeof setupProblem>[0]> = {}) {
  return {
    tenantName: "Gedung Uji",
    siteName: "Menara Uji",
    intakeCode: "menara-uji",
    timezone: "Asia/Makassar",
    locationNames: ["Lobby", "Lantai 2"],
    adminName: "Admin Uji",
    adminEmail: "admin@uji.example.test",
    roles: ["tenant_admin" as const],
    isSynthetic: true,
    password: "long enough",
    ...overrides,
  };
}

describe("setup answers", () => {
  it("accepts a complete set", () => {
    expect(setupProblem(answers())).toBeNull();
  });

  it("refuses what would leave the tenant unusable", () => {
    expect(setupProblem(answers({ intakeCode: "Bad Code" }))).toContain(
      "report link code",
    );
    expect(setupProblem(answers({ locationNames: [] }))).toContain("locations");
    expect(setupProblem(answers({ adminEmail: "nope" }))).toContain("email");
    expect(setupProblem(answers({ roles: ["operator"] }))).toContain(
      "tenant_admin",
    );
    expect(setupProblem(answers({ password: "short" }))).toContain("password");
    expect(setupProblem(answers({ tenantName: "  " }))).toContain("Names");
  });

  it("splits lists and rejects unknown roles", () => {
    expect(parseLocationNames(" Lobby, ,Lantai 2,Lobby ")).toEqual([
      "Lobby",
      "Lantai 2",
    ]);
    expect(parseRoles("tenant_admin, operator")).toEqual([
      "tenant_admin",
      "operator",
    ]);
    expect(parseRoles("tenant_admin, boss")).toBeNull();
  });
});

const url = process.env.DATABASE_URL;

describe.skipIf(!url)("setupTenant (needs a local database)", () => {
  const { db, pool } = createDb(url ?? "");
  const tenantIds: string[] = [];
  const userIds: string[] = [];

  afterAll(async () => {
    if (tenantIds.length > 0) {
      await db.delete(auditLog).where(inArray(auditLog.tenantId, tenantIds));
      await db
        .delete(memberships)
        .where(inArray(memberships.tenantId, tenantIds));
      await db.delete(locations).where(inArray(locations.tenantId, tenantIds));
      await db.delete(sites).where(inArray(sites.tenantId, tenantIds));
      await db.delete(tenants).where(inArray(tenants.id, tenantIds));
    }
    if (userIds.length > 0) {
      await db.delete(user).where(inArray(user.id, userIds));
    }
    await pool.end();
  });

  function input() {
    const suffix = randomUUID().slice(0, 8);
    const { password: _password, ...rest } = answers({
      intakeCode: `uji-${suffix}`,
      adminEmail: `admin-${suffix}@uji.example.test`,
      roles: ["tenant_admin", "operator"],
    });
    return { ...rest, passwordHash: "hashed" };
  }

  it("creates a working tenant with its admin on every site", async () => {
    const setup = input();
    const outcome = await setupTenant(db, setup);
    if (!outcome.ok) throw new Error(outcome.code);
    tenantIds.push(outcome.tenantId);
    userIds.push(outcome.userId);

    const site = await findIntakeSite(db, setup.intakeCode);
    expect(site?.tenantId).toBe(outcome.tenantId);
    expect(site?.locations.map((item) => item.name).sort()).toEqual([
      "Lantai 2",
      "Lobby",
    ]);

    const roles = await db
      .select({ role: memberships.role, siteId: memberships.siteId })
      .from(memberships)
      .where(eq(memberships.userId, outcome.userId));
    expect(roles.map((row) => row.role).sort()).toEqual([
      "operator",
      "tenant_admin",
    ]);
    expect(roles.every((row) => row.siteId === null)).toBe(true);

    const [credential] = await db
      .select({ password: account.password })
      .from(account)
      .where(eq(account.userId, outcome.userId));
    expect(credential?.password).toBe("hashed");

    const [tenant] = await db
      .select({ isSynthetic: tenants.isSynthetic })
      .from(tenants)
      .where(eq(tenants.id, outcome.tenantId));
    expect(tenant?.isSynthetic).toBe(true);

    const audit = await db
      .select({ action: auditLog.action })
      .from(auditLog)
      .where(eq(auditLog.tenantId, outcome.tenantId));
    expect(audit.map((row) => row.action)).toEqual(["tenant.created"]);
  });

  it("creates nothing when the email or the report code is taken", async () => {
    const first = input();
    const created = await setupTenant(db, first);
    if (!created.ok) throw new Error(created.code);
    tenantIds.push(created.tenantId);
    userIds.push(created.userId);

    const sameEmail = { ...input(), adminEmail: first.adminEmail };
    expect(await setupTenant(db, sameEmail)).toEqual({
      ok: false,
      code: "email_taken",
    });
    expect(await findIntakeSite(db, sameEmail.intakeCode)).toBeNull();

    const sameCode = { ...input(), intakeCode: first.intakeCode };
    expect(await setupTenant(db, sameCode)).toEqual({
      ok: false,
      code: "intake_code_taken",
    });
    const [account] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, sameCode.adminEmail));
    expect(account).toBeUndefined();
  });
});
