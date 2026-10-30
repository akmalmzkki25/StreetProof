import "../scripts/load-root-env";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { getDashboard } from "./dashboard-queries";
import { DEMO_SCENES, drawDemoPhoto } from "./demo-photos";
import { seedDemoScenarios } from "./demo-scenarios";
import { getReporterStatus } from "./reports";
import {
  aiDrafts,
  assignments,
  clarifications,
  completionSubmissions,
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
  uploads,
  user,
  verifications,
} from "./schema";

const url = process.env.DATABASE_URL;

describe("drawDemoPhoto", () => {
  it("draws a valid PNG for every scene", () => {
    for (const scene of DEMO_SCENES) {
      const bytes = drawDemoPhoto(scene);
      expect([...bytes.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    }
  });

  it("draws different pictures for different scenes", () => {
    const hashes = DEMO_SCENES.map((scene) =>
      Buffer.from(drawDemoPhoto(scene)).toString("base64").slice(0, 400),
    );
    expect(new Set(hashes).size).toBe(DEMO_SCENES.length);
  });
});

describe.skipIf(!url)(
  "demo scenarios (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");

    afterAll(async () => {
      await pool.end();
    });

    async function cleanUp(siteId: string) {
      const siteTickets = await db
        .select({ id: tickets.id })
        .from(tickets)
        .where(eq(tickets.siteId, siteId));
      const ticketIds = siteTickets.map((row) => row.id);
      const siteReports = await db
        .select({ id: reports.id })
        .from(reports)
        .where(eq(reports.siteId, siteId));
      const reportIds = siteReports.map((row) => row.id);
      const attempts = await db
        .select({ id: completionSubmissions.id })
        .from(completionSubmissions)
        .where(inArray(completionSubmissions.ticketId, ticketIds));
      const attemptIds = attempts.map((row) => row.id);

      await db
        .delete(verifications)
        .where(inArray(verifications.completionId, attemptIds));
      await db.delete(uploads).where(inArray(uploads.completionId, attemptIds));
      await db
        .delete(completionSubmissions)
        .where(inArray(completionSubmissions.id, attemptIds));
      await db.delete(uploads).where(inArray(uploads.reportId, reportIds));
      await db
        .delete(duplicateLinks)
        .where(inArray(duplicateLinks.sourceTicketId, ticketIds));
      await db
        .delete(clarifications)
        .where(inArray(clarifications.ticketId, ticketIds));
      await db.delete(aiDrafts).where(inArray(aiDrafts.reportId, reportIds));
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, ticketIds));
      await db
        .delete(assignments)
        .where(inArray(assignments.ticketId, ticketIds));
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db
        .delete(idempotencyKeys)
        .where(
          inArray(sql`${idempotencyKeys.response}->>'ticketId'`, ticketIds),
        );
      await db.delete(reports).where(inArray(reports.id, reportIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      await db.delete(memberships).where(eq(memberships.siteId, siteId));
      await db.delete(sites).where(eq(sites.id, siteId));
    }

    // Its own tenant and accounts, so these rows can't change what other test
    // files read from the shared seeded tenant while they run in parallel.
    async function createWorld() {
      const [tenant] = await db
        .insert(tenants)
        .values({ name: `Demo replay ${randomUUID()}`, isSynthetic: true })
        .returning({ id: tenants.id });
      if (!tenant) throw new Error("no tenant");

      async function person(role: "operator" | "technician" | "supervisor") {
        const userId = randomUUID();
        await db.insert(user).values({
          id: userId,
          name: `Replay ${role}`,
          email: `${userId}@replay.streetproof.test`,
          emailVerified: true,
        });
        return { userId, roles: [role] };
      }

      return {
        tenantId: tenant.id,
        people: {
          operator: await person("operator"),
          technician: await person("technician"),
          otherTechnician: await person("technician"),
          supervisor: await person("supervisor"),
        },
      };
    }

    it("replays every scenario to its expected state, twice", async () => {
      const { tenantId, people } = await createWorld();
      const now = new Date();
      const statuses = [];
      const siteIds: string[] = [];

      try {
        for (const run of [1, 2]) {
          const [site] = await db
            .insert(sites)
            .values({ tenantId, name: `Replay site ${run}` })
            .returning({ id: sites.id });
          if (!site) throw new Error("no site");
          siteIds.push(site.id);
          await db.insert(memberships).values(
            Object.values(people).map((member) => ({
              tenantId,
              userId: member.userId,
              role: member.roles[0] ?? "operator",
              siteId: site.id,
            })),
          );

          const seeded = await seedDemoScenarios({
            db,
            tenantId,
            siteId: site.id,
            people,
            locationIds: new Map(),
            storePhoto: async () => ({
              objectKey: `test/${randomUUID()}.png`,
              contentType: "image/png",
              bytes: 1,
              sha256: "synthetic",
            }),
            now,
          });

          const rows = await db
            .select({ id: tickets.id, status: tickets.status })
            .from(tickets)
            .where(eq(tickets.siteId, site.id));
          const statusOf = Object.fromEntries(
            Object.entries(seeded.tickets).map(([name, id]) => [
              name,
              rows.find((row) => row.id === id)?.status,
            ]),
          );
          statuses.push(statusOf);

          expect(statusOf).toEqual({
            newLeak: "submitted",
            sameLeak: "submitted",
            vague: "needs_clarification",
            answered: "needs_clarification",
            modelTimeout: "submitted",
            readyToAssign: "triaged",
            assigned: "assigned",
            inProgress: "in_progress",
            linkedDuplicate: "submitted",
            waitingForParts: "waiting_for_parts",
            secondAttempt: "completion_submitted",
            rejected: "rejected_with_reason",
            proofException: "completion_submitted",
            closedOnTime: "verified_closed",
            reopened: "in_progress",
            cancelled: "cancelled",
          });

          // Only the two new reports may reach the paid model.
          const openJobs = await db
            .select({ ticketId: sql<string>`${outbox.payload}->>'ticketId'` })
            .from(outbox)
            .where(
              and(
                eq(outbox.topic, "report.submitted"),
                eq(outbox.status, "pending"),
                inArray(
                  sql`${outbox.payload}->>'ticketId'`,
                  rows.map((row) => row.id),
                ),
              ),
            );
          expect(openJobs.map((job) => job.ticketId).sort()).toEqual(
            [seeded.tickets.newLeak, seeded.tickets.sameLeak].sort(),
          );

          const dashboard = await getDashboard(
            db,
            { tenantId, siteIds: [site.id] },
            now,
          );
          expect(dashboard.period.duplicates).toBe(1);
          expect(dashboard.period.cancelled).toBe(1);
          expect(dashboard.proof).toEqual({
            accepted: 5,
            rejected: 2,
            waiting: 2,
            exceptions: 1,
          });
          expect(dashboard.verifiedResolution).toEqual({
            numerator: 3,
            denominator: 4,
            pending: expect.any(Number),
          });
          expect(dashboard.reopenRate).toEqual({
            numerator: 0,
            denominator: 2,
            pending: 3,
          });
          expect(dashboard.drafts.failed).toBe(1);
          expect(dashboard.drafts.pending).toBe(2);
          expect(
            dashboard.stages.reduce((total, row) => total + row.count, 0),
          ).toBe(dashboard.open);

          // A linked duplicate's reporter follows the work on the target.
          const follower = await getReporterStatus(
            db,
            seeded.receipts.linkedDuplicate,
          );
          expect(follower?.stage).toBe("in_progress");
          const vague = await getReporterStatus(db, seeded.receipts.vague);
          expect(vague?.clarifications[0]?.isOpen).toBe(true);
        }

        expect(statuses[1]).toEqual(statuses[0]);
      } finally {
        for (const siteId of siteIds) await cleanUp(siteId);
        await db.delete(tenants).where(eq(tenants.id, tenantId));
        await db.delete(user).where(
          inArray(
            user.id,
            Object.values(people).map((member) => member.userId),
          ),
        );
      }
    }, 60_000);
  },
);
