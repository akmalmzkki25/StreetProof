import "server-only";

import { getDb, schema } from "@streetproof/db";
import type { Role } from "@streetproof/domain";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { getAuth } from "./auth";

export type Member = {
  userId: string;
  name: string;
  email: string;
  tenantId: string;
  tenantName: string;
  roles: Role[];
  // null means every site of the tenant.
  siteIds: string[] | null;
};

// The data access layer: every page and action resolves the signed-in user and
// their current membership through here, once per request.
export const getCurrentMember = cache(
  async function getCurrentMember(): Promise<Member | null> {
    // Read the request first: during prerender this is where Next stops, so
    // the database is never touched at build time.
    const requestHeaders = await headers();
    const session = await getAuth().api.getSession({ headers: requestHeaders });
    if (!session) return null;

    const rows = await getDb()
      .select({
        tenantId: schema.memberships.tenantId,
        tenantName: schema.tenants.name,
        role: schema.memberships.role,
        siteId: schema.memberships.siteId,
      })
      .from(schema.memberships)
      .innerJoin(
        schema.tenants,
        eq(schema.tenants.id, schema.memberships.tenantId),
      )
      .where(
        and(
          eq(schema.memberships.userId, session.user.id),
          eq(schema.memberships.active, true),
        ),
      );

    const first = rows[0];
    if (!first) return null;

    // A user belongs to one tenant in the demo; use the first active one.
    const tenantRows = rows.filter((row) => row.tenantId === first.tenantId);
    const roles = [...new Set(tenantRows.map((row) => row.role))];
    const coversAllSites = tenantRows.some((row) => row.siteId === null);
    const siteIds = coversAllSites
      ? null
      : [
          ...new Set(
            tenantRows
              .map((row) => row.siteId)
              .filter((siteId) => siteId !== null),
          ),
        ];

    return {
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      tenantId: first.tenantId,
      tenantName: first.tenantName,
      roles,
      siteIds,
    };
  },
);

export async function requireMember(): Promise<Member> {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return member;
}

export async function requireRole(role: Role): Promise<Member> {
  const member = await requireMember();
  if (!member.roles.includes(role)) notFound();
  return member;
}
