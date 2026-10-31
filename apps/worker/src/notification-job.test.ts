import {
  createDb,
  linkDuplicate,
  schema,
  submitReport,
  transitionTicket,
} from "@streetproof/db";
import type { Mail } from "@streetproof/db/mail";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import {
  handleUnexpectedNotificationFailure,
  NOTIFICATION_TOPIC,
  runNotificationJob,
} from "./notification-job";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
const url = process.env.DATABASE_URL;

const { duplicateLinks, idempotencyKeys, memberships, outbox } = schema;
const { reporterCredentials, reporterNotifications, reports } = schema;
const { sites, tenants, ticketEvents, tickets } = schema;

describe.skipIf(!url)(
  "runNotificationJob (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];
    const reportIds: string[] = [];
    const keys: string[] = [];

    afterEach(async () => {
      if (ticketIds.length === 0) return;
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db
        .delete(reporterNotifications)
        .where(inArray(reporterNotifications.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
      await db
        .delete(duplicateLinks)
        .where(inArray(duplicateLinks.sourceTicketId, ticketIds));
      await db
        .delete(ticketEvents)
        .where(inArray(ticketEvents.ticketId, ticketIds));
      await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, keys));
      ticketIds.length = 0;
      reportIds.length = 0;
      keys.length = 0;
    });

    afterAll(async () => {
      await pool.end();
    });

    async function newReport(reporterEmail: string | null) {
      const [site] = await db
        .select({ id: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!site) throw new Error("Run pnpm db:seed first.");
      const reportId = randomUUID();
      const idempotencyKey = randomUUID();
      keys.push(idempotencyKey);
      reportIds.push(reportId);
      const outcome = await submitReport(db, {
        tenantId: site.tenantId,
        siteId: site.id,
        reportId,
        locationId: null,
        locationText: "Floor 3",
        description: "Water below the sink",
        reporterEmail,
        photos: [],
        idempotencyKey,
        requestDigest: "digest",
      });
      if (!outcome.ok) throw new Error(outcome.code);
      ticketIds.push(outcome.ticketId);
      return { ...outcome, tenantId: site.tenantId };
    }

    async function operatorOf(tenantId: string) {
      const [member] = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(
          and(
            eq(memberships.tenantId, tenantId),
            eq(memberships.role, "operator"),
          ),
        );
      if (!member) throw new Error("Run pnpm db:seed first.");
      return { userId: member.userId, roles: ["operator" as const] };
    }

    // Moves a ticket and returns the job that change queued.
    async function askQuestion(ticketId: string, tenantId: string) {
      const outcome = await transitionTicket(db, {
        tenantId,
        ticketId,
        actor: await operatorOf(tenantId),
        to: "needs_clarification",
        expectedRevision: 0,
        provided: ["reason"],
      });
      if (!outcome.ok) throw new Error("Refused.");
      const [job] = await db
        .select()
        .from(outbox)
        .where(
          and(
            eq(outbox.topic, NOTIFICATION_TOPIC),
            eq(sql`${outbox.payload}->>'ticketId'`, ticketId),
          ),
        );
      if (!job) throw new Error("no job");
      return job;
    }

    function inbox() {
      const sent: Mail[] = [];
      return {
        sent,
        sendMail: async (mail: Mail) => {
          sent.push(mail);
        },
      };
    }

    const appUrl = "https://app.example.test";

    it("emails the reporter, with no token and without repeating on retry", async () => {
      const report = await newReport("Reporter@Example.Test");
      const job = await askQuestion(report.ticketId, report.tenantId);
      const { sent, sendMail } = inbox();

      expect(await runNotificationJob({ db, sendMail, appUrl }, job)).toBe(
        "succeeded",
      );
      expect(sent).toHaveLength(1);
      expect(sent[0]?.to).toBe("reporter@example.test");
      expect(sent[0]?.text).toContain("question");
      expect(sent[0]?.text).toContain("pertanyaan");
      expect(sent[0]?.text).not.toContain(report.reporterToken);

      await runNotificationJob({ db, sendMail, appUrl }, job);
      expect(sent).toHaveLength(1);
    });

    it("also tells the reporter of a linked duplicate", async () => {
      const target = await newReport("first@example.test");
      const source = await newReport("second@example.test");
      const operator = await operatorOf(target.tenantId);
      const linked = await linkDuplicate(db, {
        tenantId: target.tenantId,
        sourceTicketId: source.ticketId,
        targetTicketId: target.ticketId,
        actor: operator,
        expectedRevision: 0,
        reason: "Same leak.",
      });
      expect(linked.ok).toBe(true);
      const job = await askQuestion(target.ticketId, target.tenantId);
      const { sent, sendMail } = inbox();

      await runNotificationJob({ db, sendMail, appUrl }, job);

      expect(sent.map((mail) => mail.to).sort()).toEqual([
        "first@example.test",
        "second@example.test",
      ]);
    });

    it("sends nothing without an address, or for an internal step", async () => {
      const silent = await newReport(null);
      const job = await askQuestion(silent.ticketId, silent.tenantId);
      const { sent, sendMail } = inbox();

      expect(await runNotificationJob({ db, sendMail, appUrl }, job)).toBe(
        "succeeded",
      );

      const internal = {
        ...job,
        payload: { ...job.payload, from: "assigned", to: "accepted" },
      };
      expect(await runNotificationJob({ db, sendMail, appUrl }, internal)).toBe(
        "skipped_manual",
      );
      expect(sent).toEqual([]);
    });

    it("finishes the job when no mail server is set", async () => {
      const report = await newReport("reporter@example.test");
      const job = await askQuestion(report.ticketId, report.tenantId);

      expect(
        await runNotificationJob({ db, sendMail: null, appUrl }, job),
      ).toBe("skipped_manual");
      const [row] = await db.select().from(outbox).where(eq(outbox.id, job.id));
      expect(row?.status).toBe("done");
    });

    it("retries a mail failure only for those not yet told, then stops", async () => {
      const report = await newReport("reporter@example.test");
      const job = await askQuestion(report.ticketId, report.tenantId);
      const failing = async () => {
        throw new Error("smtp down");
      };

      await expect(
        runNotificationJob({ db, sendMail: failing, appUrl }, job),
      ).rejects.toThrow("smtp down");

      expect(
        await handleUnexpectedNotificationFailure(db, { ...job, attempts: 1 }),
      ).toBe("retrying");
      expect(
        await handleUnexpectedNotificationFailure(db, { ...job, attempts: 3 }),
      ).toBe("failed_terminal");
      const [ticket] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, report.ticketId));
      expect(ticket?.status).toBe("needs_clarification");
    });
  },
);
