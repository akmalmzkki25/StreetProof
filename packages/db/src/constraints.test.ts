import "../scripts/load-root-env";
import { and, eq, sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { createDb, type Db } from "./client";
import {
  assignments,
  completionSubmissions,
  duplicateLinks,
  memberships,
  sites,
  tenants,
  tickets,
  user,
} from "./schema";

const url = process.env.DATABASE_URL;

class Rollback extends Error {}

// Runs the body in a transaction that is always rolled back, so tests leave the
// seeded demo data untouched.
async function inRolledBackTransaction(
  db: Db,
  body: (tx: Parameters<Parameters<Db["transaction"]>[0]>[0]) => Promise<void>,
) {
  await expect(
    db.transaction(async function run(tx) {
      await body(tx);
      throw new Rollback();
    }),
  ).rejects.toBeInstanceOf(Rollback);
}

describe.skipIf(!url)(
  "database constraints (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");

    afterAll(async () => {
      await pool.end();
    });

    async function fixture() {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!tenant) throw new Error("Run pnpm db:seed first.");
      const [site] = await db
        .select()
        .from(sites)
        .where(eq(sites.tenantId, tenant.id));
      const [operator] = await db
        .select({ id: user.id })
        .from(user)
        .innerJoin(memberships, eq(memberships.userId, user.id))
        .where(
          and(
            eq(memberships.tenantId, tenant.id),
            eq(memberships.role, "operator"),
          ),
        );
      const technicians = await db
        .select({ id: user.id })
        .from(user)
        .innerJoin(memberships, eq(memberships.userId, user.id))
        .where(
          and(
            eq(memberships.tenantId, tenant.id),
            eq(memberships.role, "technician"),
          ),
        );
      if (!site || !operator || technicians.length < 2)
        throw new Error("Seed data is incomplete.");
      return { tenant, site, operator, technicians };
    }

    it("allows only one active assignment per ticket", async () => {
      const { tenant, site, operator, technicians } = await fixture();

      await inRolledBackTransaction(db, async (tx) => {
        const [ticket] = await tx
          .insert(tickets)
          .values({ tenantId: tenant.id, siteId: site.id })
          .returning();
        if (!ticket) throw new Error("no ticket");
        const base = {
          tenantId: tenant.id,
          ticketId: ticket.id,
          assignedBy: operator.id,
        };
        await tx
          .insert(assignments)
          .values({ ...base, technicianId: technicians[0]!.id });

        await expect(
          tx.transaction(async (nested) => {
            await nested
              .insert(assignments)
              .values({ ...base, technicianId: technicians[1]!.id });
          }),
        ).rejects.toMatchObject({ cause: { code: "23505" } });
      });
    });

    it("allows only one pending completion per ticket", async () => {
      const { tenant, site, operator, technicians } = await fixture();

      await inRolledBackTransaction(db, async (tx) => {
        const [ticket] = await tx
          .insert(tickets)
          .values({ tenantId: tenant.id, siteId: site.id })
          .returning();
        if (!ticket) throw new Error("no ticket");
        const [assignment] = await tx
          .insert(assignments)
          .values({
            tenantId: tenant.id,
            ticketId: ticket.id,
            technicianId: technicians[0]!.id,
            assignedBy: operator.id,
          })
          .returning();
        if (!assignment) throw new Error("no assignment");
        const attempt = {
          tenantId: tenant.id,
          ticketId: ticket.id,
          assignmentId: assignment.id,
          submittedBy: technicians[0]!.id,
          note: "Fixed the leak",
        };
        await tx.insert(completionSubmissions).values(attempt);

        await expect(
          tx.transaction(async (nested) => {
            await nested.insert(completionSubmissions).values(attempt);
          }),
        ).rejects.toMatchObject({ cause: { code: "23505" } });
      });
    });

    it("rejects a ticket linked as a duplicate of itself", async () => {
      const { tenant, site, operator } = await fixture();

      await inRolledBackTransaction(db, async (tx) => {
        const [ticket] = await tx
          .insert(tickets)
          .values({ tenantId: tenant.id, siteId: site.id })
          .returning();
        if (!ticket) throw new Error("no ticket");

        await expect(
          tx.transaction(async (nested) => {
            await nested.insert(duplicateLinks).values({
              tenantId: tenant.id,
              sourceTicketId: ticket.id,
              targetTicketId: ticket.id,
              reason: "same leak",
              actorId: operator.id,
            });
          }),
        ).rejects.toMatchObject({ cause: { code: "23514" } });
      });
    });

    it("rejects a ticket whose site belongs to another tenant", async () => {
      const [ownTenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      const [otherSite] = await db
        .select({ id: sites.id })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Kampus Contoh (synthetic)"));
      if (!ownTenant || !otherSite) throw new Error("Run pnpm db:seed first.");

      await inRolledBackTransaction(db, async (tx) => {
        await expect(
          tx.transaction(async (nested) => {
            await nested
              .insert(tickets)
              .values({ tenantId: ownTenant.id, siteId: otherSite.id });
          }),
        ).rejects.toMatchObject({ cause: { code: "23503" } });
        await tx.execute(sql`select 1`);
      });
    });
  },
);
