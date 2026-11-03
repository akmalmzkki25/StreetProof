import {
  asSiteTimeZone,
  ROLES,
  SITE_TIME_ZONES,
  type Role,
} from "@streetproof/domain";
import { eq } from "drizzle-orm";
import { recordAudit } from "./audit";
import type { Db } from "./client";
import { insertAccount } from "./members";
import { locations, memberships, sites, tenants } from "./schema";
import { isValidIntakeCode } from "./sites";

export type SetupInput = {
  tenantName: string;
  siteName: string;
  intakeCode: string;
  timezone: string;
  locationNames: readonly string[];
  adminName: string;
  adminEmail: string;
  roles: readonly Role[];
  // Labels every figure in the app, for a tenant that holds only test data.
  isSynthetic: boolean;
};

export type SetupOutcome =
  | { ok: true; tenantId: string; siteId: string; userId: string }
  | { ok: false; code: "email_taken" | "intake_code_taken" };

const MAX_NAME = 100;
const MAX_LOCATIONS = 50;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Names arrive comma separated, so blanks and repeats are dropped here.
export function parseLocationNames(text: string) {
  return [
    ...new Set(
      text
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseRoles(text: string): Role[] | null {
  const names = parseLocationNames(text);
  const roles = names.filter((name): name is Role =>
    (ROLES as readonly string[]).includes(name),
  );
  return roles.length === names.length ? roles : null;
}

// The first problem with the answers, in words for the person running setup.
export function setupProblem(input: SetupInput & { password: string }) {
  const names = [input.tenantName, input.siteName, input.adminName];
  if (names.some((name) => !name.trim() || name.length > MAX_NAME)) {
    return `Names must be 1 to ${MAX_NAME} characters.`;
  }
  if (!(SITE_TIME_ZONES as readonly string[]).includes(input.timezone)) {
    return `The time zone must be one of ${SITE_TIME_ZONES.join(", ")}.`;
  }
  if (!isValidIntakeCode(input.intakeCode)) {
    return "The report link code needs 3 to 40 lowercase letters, numbers or dashes, starting with a letter or number.";
  }
  if (
    input.locationNames.length === 0 ||
    input.locationNames.length > MAX_LOCATIONS ||
    input.locationNames.some((name) => name.length > MAX_NAME)
  ) {
    return `Give 1 to ${MAX_LOCATIONS} locations, each up to ${MAX_NAME} characters.`;
  }
  if (!EMAIL.test(input.adminEmail)) return "Check the admin's email address.";
  if (!input.roles.includes("tenant_admin")) {
    return "The first account must include the tenant_admin role, or nobody can add members.";
  }
  if (
    input.password.length < MIN_PASSWORD ||
    input.password.length > MAX_PASSWORD
  ) {
    return `The password needs ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.`;
  }
  return null;
}

// Everything a new organisation needs before anyone can sign in, in one go, so a
// refusal part way leaves nothing behind. Members, teams and more sites are added
// in the app afterwards.
export async function setupTenant(
  db: Db,
  input: SetupInput & { passwordHash: string },
): Promise<SetupOutcome> {
  return db.transaction(async function run(tx) {
    const [codeInUse] = await tx
      .select({ id: sites.id })
      .from(sites)
      .where(eq(sites.intakeCode, input.intakeCode));
    if (codeInUse) return { ok: false, code: "intake_code_taken" };

    const userId = await insertAccount(tx, {
      name: input.adminName.trim(),
      email: input.adminEmail,
      passwordHash: input.passwordHash,
    });
    if (!userId) return { ok: false, code: "email_taken" };

    const [tenant] = await tx
      .insert(tenants)
      .values({ name: input.tenantName.trim(), isSynthetic: input.isSynthetic })
      .returning({ id: tenants.id });
    if (!tenant) throw new Error("Tenant insert returned nothing.");

    const [site] = await tx
      .insert(sites)
      .values({
        tenantId: tenant.id,
        name: input.siteName.trim(),
        intakeCode: input.intakeCode,
        timezone: asSiteTimeZone(input.timezone),
      })
      .returning({ id: sites.id });
    if (!site) throw new Error("Site insert returned nothing.");

    await tx.insert(locations).values(
      input.locationNames.map((name) => ({
        tenantId: tenant.id,
        siteId: site.id,
        name,
      })),
    );
    await tx.insert(memberships).values(
      input.roles.map((role) => ({
        tenantId: tenant.id,
        userId,
        role,
        siteId: null,
      })),
    );
    await recordAudit(tx, {
      tenantId: tenant.id,
      actorId: userId,
      action: "tenant.created",
      targetType: "tenant",
      targetId: tenant.id,
      metadata: { siteId: site.id, roles: input.roles },
    });
    return { ok: true, tenantId: tenant.id, siteId: site.id, userId };
  });
}
