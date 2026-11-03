import type { Role } from "@streetproof/domain";
import { and, asc, count, eq, ne } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { recordAudit } from "./audit";
import type { Db, Transaction } from "./client";
import { account, memberships, session, sites, teams, user } from "./schema";

export type MemberAccess = {
  tenantId: string;
  roles: readonly Role[];
  // null means every site of the tenant.
  siteId: string | null;
};

export type MemberOutcome =
  | { ok: true; userId: string }
  | {
      ok: false;
      code:
        | "email_taken"
        | "unknown_site"
        | "not_found"
        | "last_admin"
        | "no_roles";
    };

export async function listMembers(db: Db, tenantId: string) {
  const rows = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: memberships.role,
      siteId: memberships.siteId,
      active: memberships.active,
    })
    .from(memberships)
    .innerJoin(user, eq(user.id, memberships.userId))
    .where(eq(memberships.tenantId, tenantId))
    .orderBy(asc(user.name));

  const byUser = new Map<
    string,
    {
      userId: string;
      name: string;
      email: string;
      roles: Role[];
      siteId: string | null;
      isActive: boolean;
    }
  >();
  for (const row of rows) {
    const current = byUser.get(row.userId);
    byUser.set(row.userId, {
      userId: row.userId,
      name: row.name,
      email: row.email,
      roles: row.active
        ? [...(current?.roles ?? []), row.role]
        : (current?.roles ?? []),
      siteId: row.siteId,
      isActive: (current?.isActive ?? false) || row.active,
    });
  }
  return [...byUser.values()];
}

export async function listTenantSites(db: Db, tenantId: string) {
  return db
    .select({ id: sites.id, name: sites.name })
    .from(sites)
    .where(eq(sites.tenantId, tenantId))
    .orderBy(asc(sites.name));
}

async function isSiteOfTenant(
  db: Db | Transaction,
  tenantId: string,
  siteId: string,
) {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.tenantId, tenantId), eq(sites.id, siteId)));
  return site !== undefined;
}

// An account is global but a membership isn't, so an email used elsewhere is
// refused instead of quietly joining this tenant to someone else's account.
// Null means the email is taken.
export async function insertAccount(
  tx: Transaction,
  input: { name: string; email: string; passwordHash: string },
) {
  const email = input.email.toLowerCase();
  const [taken] = await tx
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  if (taken) return null;

  const userId = randomUUID();
  await tx.insert(user).values({
    id: userId,
    name: input.name,
    email,
    emailVerified: true,
  });
  await tx.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: input.passwordHash,
  });
  return userId;
}

export async function createMember(
  db: Db,
  input: MemberAccess & {
    name: string;
    email: string;
    passwordHash: string;
    actorId: string;
  },
): Promise<MemberOutcome> {
  if (input.roles.length === 0) return { ok: false, code: "no_roles" };
  return db.transaction(async function run(tx) {
    if (
      input.siteId &&
      !(await isSiteOfTenant(tx, input.tenantId, input.siteId))
    ) {
      return { ok: false, code: "unknown_site" };
    }
    const userId = await insertAccount(tx, input);
    if (!userId) return { ok: false, code: "email_taken" };
    await tx.insert(memberships).values(
      input.roles.map((role) => ({
        tenantId: input.tenantId,
        userId,
        role,
        siteId: input.siteId,
      })),
    );
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "member.created",
      targetType: "user",
      targetId: userId,
      metadata: { roles: input.roles, siteId: input.siteId },
    });
    return { ok: true, userId };
  });
}

// A tenant must keep someone who can manage its members.
async function wouldRemoveLastAdmin(
  tx: Transaction,
  tenantId: string,
  userId: string,
) {
  const [others] = await tx
    .select({ total: count() })
    .from(memberships)
    .where(
      and(
        eq(memberships.tenantId, tenantId),
        eq(memberships.role, "tenant_admin"),
        eq(memberships.active, true),
        ne(memberships.userId, userId),
      ),
    );
  return (others?.total ?? 0) === 0;
}

async function isMemberOfTenant(
  tx: Transaction,
  tenantId: string,
  userId: string,
) {
  const [row] = await tx
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(eq(memberships.tenantId, tenantId), eq(memberships.userId, userId)),
    );
  return row !== undefined;
}

export async function updateMemberAccess(
  db: Db,
  input: MemberAccess & { userId: string; actorId: string },
): Promise<MemberOutcome> {
  if (input.roles.length === 0) return { ok: false, code: "no_roles" };
  return db.transaction(async function run(tx) {
    if (!(await isMemberOfTenant(tx, input.tenantId, input.userId))) {
      return { ok: false, code: "not_found" };
    }
    if (
      input.siteId &&
      !(await isSiteOfTenant(tx, input.tenantId, input.siteId))
    ) {
      return { ok: false, code: "unknown_site" };
    }
    if (
      !input.roles.includes("tenant_admin") &&
      (await wouldRemoveLastAdmin(tx, input.tenantId, input.userId))
    ) {
      return { ok: false, code: "last_admin" };
    }

    await tx
      .delete(memberships)
      .where(
        and(
          eq(memberships.tenantId, input.tenantId),
          eq(memberships.userId, input.userId),
        ),
      );
    await tx.insert(memberships).values(
      input.roles.map((role) => ({
        tenantId: input.tenantId,
        userId: input.userId,
        role,
        siteId: input.siteId,
      })),
    );
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "member.access_changed",
      targetType: "user",
      targetId: input.userId,
      metadata: { roles: input.roles, siteId: input.siteId },
    });
    return { ok: true, userId: input.userId };
  });
}

export async function setMemberActive(
  db: Db,
  input: {
    tenantId: string;
    userId: string;
    isActive: boolean;
    actorId: string;
  },
): Promise<MemberOutcome> {
  return db.transaction(async function run(tx) {
    if (!(await isMemberOfTenant(tx, input.tenantId, input.userId))) {
      return { ok: false, code: "not_found" };
    }
    if (
      !input.isActive &&
      (await wouldRemoveLastAdmin(tx, input.tenantId, input.userId))
    ) {
      return { ok: false, code: "last_admin" };
    }

    await tx
      .update(memberships)
      .set({ active: input.isActive })
      .where(
        and(
          eq(memberships.tenantId, input.tenantId),
          eq(memberships.userId, input.userId),
        ),
      );
    // Signed-in sessions end now, not when they next expire.
    if (!input.isActive) {
      await tx.delete(session).where(eq(session.userId, input.userId));
    }
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: input.isActive ? "member.reactivated" : "member.deactivated",
      targetType: "user",
      targetId: input.userId,
    });
    return { ok: true, userId: input.userId };
  });
}

export async function setMemberPassword(
  db: Db,
  input: {
    tenantId: string;
    userId: string;
    passwordHash: string;
    actorId: string;
  },
): Promise<MemberOutcome> {
  return db.transaction(async function run(tx) {
    if (!(await isMemberOfTenant(tx, input.tenantId, input.userId))) {
      return { ok: false, code: "not_found" };
    }
    await tx
      .update(account)
      .set({ password: input.passwordHash })
      .where(
        and(
          eq(account.userId, input.userId),
          eq(account.providerId, "credential"),
        ),
      );
    await tx.delete(session).where(eq(session.userId, input.userId));
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "member.password_set",
      targetType: "user",
      targetId: input.userId,
    });
    return { ok: true, userId: input.userId };
  });
}

export async function createTeam(
  db: Db,
  input: { tenantId: string; name: string; actorId: string },
) {
  await db.transaction(async function run(tx) {
    const [team] = await tx
      .insert(teams)
      .values({ tenantId: input.tenantId, name: input.name })
      .returning({ id: teams.id });
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "team.created",
      targetType: "team",
      ...(team ? { targetId: team.id } : {}),
      metadata: { name: input.name },
    });
  });
}

export async function retireTeam(
  db: Db,
  input: { tenantId: string; teamId: string; actorId: string },
) {
  await db.transaction(async function run(tx) {
    const retired = await tx
      .update(teams)
      .set({ active: false })
      .where(
        and(eq(teams.tenantId, input.tenantId), eq(teams.id, input.teamId)),
      )
      .returning({ id: teams.id });
    if (retired.length === 0) return;
    await recordAudit(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: "team.retired",
      targetType: "team",
      targetId: input.teamId,
    });
  });
}

// Which tenant to record a sign-in under, since an email arrives without one. An
// address with no account gets no entry, so the log can't fill up with guesses.
export async function findMemberByEmail(db: Db, email: string) {
  const [row] = await db
    .select({ userId: user.id, tenantId: memberships.tenantId })
    .from(user)
    .innerJoin(memberships, eq(memberships.userId, user.id))
    .where(eq(user.email, email.toLowerCase()));
  return row ?? null;
}
