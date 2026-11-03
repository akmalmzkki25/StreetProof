import "../scripts/load-root-env";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { purgeExpiredData, REPORTER_CONTACT_DAYS } from "./retention";
import {
  rateLimits,
  reports,
  sites,
  telegramConversations,
  telegramReportSubscriptions,
  tenants,
  tickets,
} from "./schema";

const url = process.env.DATABASE_URL;
const DAY_MS = 24 * 60 * 60 * 1000;

describe.skipIf(!url)("purgeExpiredData (needs a local database)", () => {
  const { db, pool } = createDb(url ?? "");
  let tenantId = "";
  let siteId = "";

  beforeAll(async () => {
    const [tenant] = await db
      .insert(tenants)
      .values({ name: "Retention test (synthetic)", isSynthetic: true })
      .returning();
    if (!tenant) throw new Error("Tenant insert returned nothing.");
    tenantId = tenant.id;
    const [site] = await db
      .insert(sites)
      .values({ tenantId, name: "Retention site" })
      .returning();
    if (!site) throw new Error("Site insert returned nothing.");
    siteId = site.id;
  });

  afterAll(async () => {
    await db
      .delete(telegramReportSubscriptions)
      .where(eq(telegramReportSubscriptions.tenantId, tenantId));
    await db.delete(reports).where(eq(reports.tenantId, tenantId));
    await db.delete(tickets).where(eq(tickets.tenantId, tenantId));
    await db.delete(sites).where(eq(sites.tenantId, tenantId));
    await db.delete(tenants).where(eq(tenants.id, tenantId));
    await pool.end();
  });

  async function reportOnTicket(
    status: "verified_closed" | "in_progress",
    updatedAt: Date,
  ) {
    const ticketId = randomUUID();
    await db
      .insert(tickets)
      .values({ id: ticketId, tenantId, siteId, status, updatedAt });
    // updatedAt is refreshed on insert; set it back to the moment under test.
    await db.update(tickets).set({ updatedAt }).where(eq(tickets.id, ticketId));
    const reportId = randomUUID();
    await db.insert(reports).values({
      id: reportId,
      tenantId,
      siteId,
      locationText: "Lobby",
      description: "Synthetic report",
      reporterEmail: "reporter@example.test",
      canonicalTicketId: ticketId,
    });
    const chatId = String(6_000_000_000 + Math.floor(Math.random() * 1e6));
    await db
      .insert(telegramReportSubscriptions)
      .values({ tenantId, reportId, chatId });
    return reportId;
  }

  it("forgets how to reach a reporter long after their report closed, and nothing else", async () => {
    const now = new Date();
    const old = await reportOnTicket(
      "verified_closed",
      new Date(now.getTime() - (REPORTER_CONTACT_DAYS + 1) * DAY_MS),
    );
    const recent = await reportOnTicket(
      "verified_closed",
      new Date(now.getTime() - 10 * DAY_MS),
    );
    const open = await reportOnTicket(
      "in_progress",
      new Date(now.getTime() - (REPORTER_CONTACT_DAYS + 30) * DAY_MS),
    );

    const result = await purgeExpiredData(db, now);

    expect(result.reporterEmails).toBeGreaterThanOrEqual(1);
    const rows = await db
      .select({ id: reports.id, email: reports.reporterEmail })
      .from(reports)
      .where(inArray(reports.id, [old, recent, open]));
    const emailOf = (id: string) => rows.find((row) => row.id === id)?.email;
    expect(emailOf(old)).toBeNull();
    expect(emailOf(recent)).toBe("reporter@example.test");
    expect(emailOf(open)).toBe("reporter@example.test");

    const followers = await db
      .select({ reportId: telegramReportSubscriptions.reportId })
      .from(telegramReportSubscriptions)
      .where(eq(telegramReportSubscriptions.tenantId, tenantId));
    expect(followers.map((row) => row.reportId).sort()).toEqual(
      [recent, open].sort(),
    );
    // The report itself stays: it's evidence.
    expect(rows.find((row) => row.id === old)).toBeDefined();
  });

  it("clears abandoned chats and spent rate limit counts", async () => {
    const now = new Date();
    const chatId = `retention-${randomUUID()}`;
    await db.insert(telegramConversations).values({
      chatId,
      state: { flow: "report" },
      updatedAt: new Date(now.getTime() - 8 * DAY_MS),
    });
    await db
      .update(telegramConversations)
      .set({ updatedAt: new Date(now.getTime() - 8 * DAY_MS) })
      .where(eq(telegramConversations.chatId, chatId));
    const key = `retention-test:${randomUUID()}`;
    await db
      .insert(rateLimits)
      .values({ key, points: 3, expire: now.getTime() - 1000 });

    await purgeExpiredData(db, now);

    expect(
      await db
        .select()
        .from(telegramConversations)
        .where(eq(telegramConversations.chatId, chatId)),
    ).toEqual([]);
    expect(
      await db.select().from(rateLimits).where(eq(rateLimits.key, key)),
    ).toEqual([]);
  });
});
