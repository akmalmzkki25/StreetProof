import "../scripts/load-root-env";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { listAuditLog } from "./audit";
import { createDb } from "./client";
import {
  createMember,
  createTeam,
  listMembers,
  retireTeam,
  setMemberActive,
  setMemberPassword,
  updateMemberAccess,
} from "./members";
import {
  account,
  auditLog,
  memberships,
  session,
  sites,
  teams,
  tenants,
  user,
} from "./schema";
import { listTeams } from "./ticket-queries";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)("member management (needs a local database)", () => {
  const { db, pool } = createDb(url ?? "");
  const userIds: string[] = [];
  let tenantId = "";
  let otherTenantId = "";
  let siteId = "";

  // Its own tenants, so these tests can't disturb anyone reading the seeded ones.
  beforeAll(async () => {
    const [tenant] = await db
      .insert(tenants)
      .values({ name: "Members test (synthetic)", isSynthetic: true })
      .returning();
    const [other] = await db
      .insert(tenants)
      .values({ name: "Members test 2 (synthetic)", isSynthetic: true })
      .returning();
    if (!tenant || !other) throw new Error("no tenant");
    tenantId = tenant.id;
    otherTenantId = other.id;
    const [site] = await db
      .insert(sites)
      .values({ tenantId, name: "Site" })
      .returning();
    if (!site) throw new Error("no site");
    siteId = site.id;
  });

  afterEach(async () => {
    await db.delete(auditLog).where(eq(auditLog.tenantId, tenantId));
    await db.delete(memberships).where(eq(memberships.tenantId, tenantId));
    if (userIds.length > 0) {
      await db.delete(user).where(inArray(user.id, userIds));
    }
    userIds.length = 0;
    await db.delete(teams).where(eq(teams.tenantId, tenantId));
  });

  afterAll(async () => {
    await db.delete(sites).where(eq(sites.tenantId, tenantId));
    await db
      .delete(tenants)
      .where(inArray(tenants.id, [tenantId, otherTenantId]));
    await pool.end();
  });

  async function admin() {
    const outcome = await createMember(db, {
      tenantId,
      roles: ["tenant_admin"],
      siteId: null,
      name: "Admin",
      email: `admin-${randomUUID()}@example.test`,
      passwordHash: "hash",
      actorId: await systemActor(),
    });
    if (!outcome.ok) throw new Error(outcome.code);
    userIds.push(outcome.userId);
    return outcome.userId;
  }

  async function systemActor() {
    const id = randomUUID();
    await db.insert(user).values({
      id,
      name: "Actor",
      email: `actor-${id}@example.test`,
    });
    userIds.push(id);
    return id;
  }

  async function technician(actorId: string, email?: string) {
    const outcome = await createMember(db, {
      tenantId,
      roles: ["technician"],
      siteId,
      name: "Tech",
      email: email ?? `tech-${randomUUID()}@example.test`,
      passwordHash: "hash",
      actorId,
    });
    if (outcome.ok) userIds.push(outcome.userId);
    return outcome;
  }

  it("creates a member who can sign in, and records it", async () => {
    const actorId = await admin();
    const outcome = await technician(actorId);
    if (!outcome.ok) throw new Error(outcome.code);

    const [credential] = await db
      .select()
      .from(account)
      .where(eq(account.userId, outcome.userId));
    expect(credential).toMatchObject({
      providerId: "credential",
      password: "hash",
    });

    const members = await listMembers(db, tenantId);
    expect(
      members.find((member) => member.userId === outcome.userId),
    ).toMatchObject({ roles: ["technician"], siteId, isActive: true });
    const log = await listAuditLog(db, tenantId);
    expect(log.map((entry) => entry.action)).toContain("member.created");
  });

  it("refuses an email already in use, in any case", async () => {
    const actorId = await admin();
    const email = `Same-${randomUUID()}@example.test`;
    await technician(actorId, email);

    expect(await technician(actorId, email.toUpperCase())).toEqual({
      ok: false,
      code: "email_taken",
    });
  });

  it("refuses a site from another tenant", async () => {
    const actorId = await admin();
    const [foreign] = await db
      .insert(sites)
      .values({ tenantId: otherTenantId, name: "Foreign" })
      .returning();
    if (!foreign) throw new Error("no site");

    const outcome = await createMember(db, {
      tenantId,
      roles: ["operator"],
      siteId: foreign.id,
      name: "X",
      email: `x-${randomUUID()}@example.test`,
      passwordHash: "hash",
      actorId,
    });
    await db.delete(sites).where(eq(sites.id, foreign.id));

    expect(outcome).toEqual({ ok: false, code: "unknown_site" });
  });

  it("changes roles and site, but needs at least one role", async () => {
    const actorId = await admin();
    const created = await technician(actorId);
    if (!created.ok) throw new Error(created.code);

    expect(
      await updateMemberAccess(db, {
        tenantId,
        userId: created.userId,
        roles: [],
        siteId: null,
        actorId,
      }),
    ).toEqual({ ok: false, code: "no_roles" });

    const changed = await updateMemberAccess(db, {
      tenantId,
      userId: created.userId,
      roles: ["operator", "supervisor"],
      siteId: null,
      actorId,
    });
    expect(changed.ok).toBe(true);
    const members = await listMembers(db, tenantId);
    const member = members.find((item) => item.userId === created.userId);
    expect([...(member?.roles ?? [])].sort()).toEqual([
      "operator",
      "supervisor",
    ]);
    expect(member?.siteId).toBeNull();
  });

  it("won't remove the last admin by demotion or deactivation", async () => {
    const actorId = await admin();

    expect(
      await updateMemberAccess(db, {
        tenantId,
        userId: actorId,
        roles: ["operator"],
        siteId: null,
        actorId,
      }),
    ).toEqual({ ok: false, code: "last_admin" });
    expect(
      await setMemberActive(db, {
        tenantId,
        userId: actorId,
        isActive: false,
        actorId,
      }),
    ).toEqual({ ok: false, code: "last_admin" });
  });

  it("deactivating ends sessions, and a password change does too", async () => {
    const actorId = await admin();
    const created = await technician(actorId);
    if (!created.ok) throw new Error(created.code);
    const openSession = () =>
      db.insert(session).values({
        id: randomUUID(),
        token: randomUUID(),
        userId: created.userId,
        expiresAt: new Date(Date.now() + 60_000),
      });
    const sessions = () =>
      db.select().from(session).where(eq(session.userId, created.userId));

    await openSession();
    await setMemberPassword(db, {
      tenantId,
      userId: created.userId,
      passwordHash: "new-hash",
      actorId,
    });
    expect(await sessions()).toEqual([]);
    const [credential] = await db
      .select()
      .from(account)
      .where(eq(account.userId, created.userId));
    expect(credential?.password).toBe("new-hash");

    await openSession();
    await setMemberActive(db, {
      tenantId,
      userId: created.userId,
      isActive: false,
      actorId,
    });
    expect(await sessions()).toEqual([]);
    const members = await listMembers(db, tenantId);
    expect(
      members.find((item) => item.userId === created.userId)?.isActive,
    ).toBe(false);
  });

  it("can't touch someone from another tenant", async () => {
    const actorId = await admin();
    const created = await technician(actorId);
    if (!created.ok) throw new Error(created.code);

    const outcome = await setMemberPassword(db, {
      tenantId: otherTenantId,
      userId: created.userId,
      passwordHash: "stolen",
      actorId,
    });

    expect(outcome).toEqual({ ok: false, code: "not_found" });
    const [credential] = await db
      .select()
      .from(account)
      .where(eq(account.userId, created.userId));
    expect(credential?.password).toBe("hash");
  });

  it("adds and retires teams", async () => {
    const actorId = await admin();
    await createTeam(db, { tenantId, name: "Painters", actorId });
    const [team] = await listTeams(db, tenantId);
    expect(team?.name).toBe("Painters");
    if (!team) throw new Error("no team");

    await retireTeam(db, { tenantId: otherTenantId, teamId: team.id, actorId });
    expect(await listTeams(db, tenantId)).toHaveLength(1);

    await retireTeam(db, { tenantId, teamId: team.id, actorId });
    expect(await listTeams(db, tenantId)).toEqual([]);
  });
});
