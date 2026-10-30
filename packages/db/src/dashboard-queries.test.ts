import "../scripts/load-root-env";
import type { Role } from "@streetproof/domain";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { getDashboard } from "./dashboard-queries";
import { linkDuplicate } from "./duplicate-commands";
import { submitReport } from "./reports";
import {
  duplicateLinks,
  idempotencyKeys,
  memberships,
  outbox,
  reporterCredentials,
  reports,
  sites,
  tenants,
  ticketEvents,
  tickets,
} from "./schema";
import { triageTicket } from "./ticket-commands";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)("getDashboard (needs the seeded local database)", () => {
  const { db, pool } = createDb(url ?? "");
  const ticketIds: string[] = [];
  const reportIds: string[] = [];
  const keys: string[] = [];
  const siteIds: string[] = [];

  afterEach(async () => {
    if (ticketIds.length > 0) {
      await db
        .delete(duplicateLinks)
        .where(inArray(duplicateLinks.sourceTicketId, ticketIds));
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, ticketIds));
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, keys));
    }
    if (siteIds.length > 0) {
      await db.delete(sites).where(inArray(sites.id, siteIds));
    }
    ticketIds.length = 0;
    reportIds.length = 0;
    keys.length = 0;
    siteIds.length = 0;
  });

  afterAll(async () => {
    await pool.end();
  });

  async function tenantId() {
    const [tenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.name, "Graha Contoh (synthetic)"));
    if (!tenant) throw new Error("Run pnpm db:seed first.");
    return tenant.id;
  }

  // A fresh site per test keeps the counts exact while other test files run.
  async function newSite(id: string) {
    const [site] = await db
      .insert(sites)
      .values({ tenantId: id, name: `Dashboard test ${randomUUID()}` })
      .returning({ id: sites.id });
    if (!site) throw new Error("no site");
    siteIds.push(site.id);
    return site.id;
  }

  async function report(tenant: string, siteId: string, description: string) {
    const reportId = randomUUID();
    const key = randomUUID();
    const outcome = await submitReport(db, {
      tenantId: tenant,
      siteId,
      reportId,
      locationId: null,
      locationText: "Lobi",
      description,
      photos: [],
      idempotencyKey: key,
      requestDigest: key,
    });
    if (!outcome.ok) throw new Error(outcome.code);
    ticketIds.push(outcome.ticketId);
    reportIds.push(reportId);
    keys.push(key);
    return outcome.ticketId;
  }

  async function operatorOf(id: string, role: Role = "operator") {
    const [row] = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(and(eq(memberships.tenantId, id), eq(memberships.role, role)));
    if (!row) throw new Error("Seed data is incomplete.");
    return { userId: row.userId, roles: [role] };
  }

  it("counts a linked duplicate as a report and stays inside the site scope", async () => {
    const tenant = await tenantId();
    const siteId = await newSite(tenant);
    const otherSiteId = await newSite(tenant);
    const main = await report(tenant, siteId, "Pintu lobi rusak");
    const duplicate = await report(tenant, siteId, "Engsel pintu lobi lepas");
    await report(tenant, otherSiteId, "Lampu parkir mati");

    const linked = await linkDuplicate(db, {
      tenantId: tenant,
      sourceTicketId: duplicate,
      targetTicketId: main,
      actor: await operatorOf(tenant),
      expectedRevision: 0,
      reason: "Pintu yang sama",
    });
    expect(linked.ok).toBe(true);

    const result = await getDashboard(db, {
      tenantId: tenant,
      siteIds: [siteId],
    });

    expect(result.open).toBe(1);
    expect(result.period.reports).toBe(2);
    expect(result.period.duplicates).toBe(1);
    expect(result.oldest[0]).toMatchObject({
      id: main,
      title: "Pintu lobi rusak",
      location: "Lobi",
    });
    expect(result.drafts.pending).toBe(2);
  });

  it("reads elapsed times from the ticket's own events", async () => {
    const tenant = await tenantId();
    const siteId = await newSite(tenant);
    const ticketId = await report(tenant, siteId, "Keran bocor");

    const triaged = await triageTicket(db, {
      tenantId: tenant,
      ticketId,
      actor: await operatorOf(tenant),
      expectedRevision: 0,
      summary: "Keran bocor di pantry",
      category: "plumbing",
      priority: "normal",
      locationId: null,
    });
    expect(triaged.ok).toBe(true);

    const result = await getDashboard(db, {
      tenantId: tenant,
      siteIds: [siteId],
    });

    expect(result.timeToTriage.count).toBe(1);
    expect(result.timeToTriage.untriaged).toBe(0);
    expect(result.period.byCategory).toEqual([{ key: "plumbing", count: 1 }]);
    expect(result.stages.find((row) => row.stage === "assignment")?.count).toBe(
      1,
    );
    expect(result.oldest[0]?.title).toBe("Keran bocor di pantry");
  });

  it("shows zeros for a site with no work", async () => {
    const tenant = await tenantId();
    const siteId = await newSite(tenant);

    const result = await getDashboard(db, {
      tenantId: tenant,
      siteIds: [siteId],
    });

    expect(result.open).toBe(0);
    expect(result.period.reports).toBe(0);
    expect(result.timeToClose.medianMs).toBeNull();
    expect(result.verifiedResolution.denominator).toBe(0);
  });
});
