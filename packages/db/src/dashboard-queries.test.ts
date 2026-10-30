import "../scripts/load-root-env";
import { inArray, sql } from "drizzle-orm";
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
  user,
} from "./schema";
import { triageTicket } from "./ticket-commands";

const url = process.env.DATABASE_URL;

describe.skipIf(!url)("getDashboard (needs the seeded local database)", () => {
  const { db, pool } = createDb(url ?? "");
  const ticketIds: string[] = [];
  const reportIds: string[] = [];
  const keys: string[] = [];
  const siteIds: string[] = [];
  const tenantIds: string[] = [];
  const userIds: string[] = [];

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
      await db.delete(memberships).where(inArray(memberships.siteId, siteIds));
      await db.delete(sites).where(inArray(sites.id, siteIds));
    }
    if (tenantIds.length > 0) {
      await db.delete(tenants).where(inArray(tenants.id, tenantIds));
    }
    if (userIds.length > 0) {
      await db.delete(user).where(inArray(user.id, userIds));
    }
    ticketIds.length = 0;
    reportIds.length = 0;
    keys.length = 0;
    siteIds.length = 0;
    tenantIds.length = 0;
    userIds.length = 0;
  });

  afterAll(async () => {
    await pool.end();
  });

  // Its own tenant, because other test files read the first site of the seeded
  // one. A site added there would be picked up by them while they run in parallel.
  async function tenantId() {
    const [tenant] = await db
      .insert(tenants)
      .values({ name: `Dashboard test ${randomUUID()}`, isSynthetic: true })
      .returning({ id: tenants.id });
    if (!tenant) throw new Error("no tenant");
    tenantIds.push(tenant.id);
    return tenant.id;
  }

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

  async function operator() {
    const userId = randomUUID();
    await db.insert(user).values({
      id: userId,
      name: "Dashboard test operator",
      email: `${userId}@dashboard.streetproof.test`,
      emailVerified: true,
    });
    userIds.push(userId);
    return { userId, roles: ["operator" as const] };
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
      actor: await operator(),
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
      actor: await operator(),
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
