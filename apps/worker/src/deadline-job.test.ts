import {
  assignTicket,
  createDb,
  schema,
  submitReport,
  triageTicket,
} from "@streetproof/db";
import type { Mail } from "@streetproof/db/mail";
import type { TelegramMessage } from "@streetproof/db/telegram-send";
import { and, eq, inArray, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runDeadlineSweep } from "./deadline-job";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
const url = process.env.DATABASE_URL;

const { assignments, deadlineNotices, idempotencyKeys, outbox } = schema;
const { reporterCredentials, reports, sites, telegramMembers } = schema;
const { tenants, ticketEvents, tickets, user } = schema;

const HOUR_MS = 60 * 60 * 1000;
const appUrl = "https://app.example.test";

describe.skipIf(!url)(
  "runDeadlineSweep (needs the seeded local database)",
  () => {
    const { db, pool } = createDb(url ?? "");
    const ticketIds: string[] = [];
    const keys: string[] = [];
    const chatIds: string[] = [];
    let tenantId = "";
    let siteId = "";

    beforeAll(async () => {
      const [site] = await db
        .select({ id: sites.id, tenantId: sites.tenantId })
        .from(sites)
        .innerJoin(tenants, eq(tenants.id, sites.tenantId))
        .where(eq(tenants.name, "Graha Contoh (synthetic)"));
      if (!site) throw new Error("Run pnpm db:seed first.");
      tenantId = site.tenantId;
      siteId = site.id;
    });

    afterAll(async () => {
      if (ticketIds.length > 0) {
        await db
          .delete(deadlineNotices)
          .where(inArray(deadlineNotices.ticketId, ticketIds));
        await db
          .delete(assignments)
          .where(inArray(assignments.ticketId, ticketIds));
        const rows = await db
          .select({ id: reports.id })
          .from(reports)
          .where(inArray(reports.canonicalTicketId, ticketIds));
        const reportIds = rows.map((row) => row.id);
        await db
          .delete(reporterCredentials)
          .where(inArray(reporterCredentials.reportId, reportIds));
        await db.delete(reports).where(inArray(reports.id, reportIds));
        await db
          .delete(outbox)
          .where(inArray(sql`${outbox.payload}->>'ticketId'`, ticketIds));
        await db
          .delete(ticketEvents)
          .where(inArray(ticketEvents.ticketId, ticketIds));
        await db.delete(tickets).where(inArray(tickets.id, ticketIds));
      }
      if (keys.length > 0) {
        await db
          .delete(idempotencyKeys)
          .where(inArray(idempotencyKeys.key, keys));
      }
      if (chatIds.length > 0) {
        await db
          .delete(telegramMembers)
          .where(inArray(telegramMembers.chatId, chatIds));
      }
      await pool.end();
    });

    async function userOf(email: string) {
      const [row] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email));
      if (!row) throw new Error("Run pnpm db:seed first.");
      return row.id;
    }

    // A ticket assigned to Budi with its deadline at the given moment.
    async function ticketDueAt(dueAt: Date) {
      const idempotencyKey = randomUUID();
      keys.push(idempotencyKey);
      const report = await submitReport(db, {
        tenantId,
        siteId,
        reportId: randomUUID(),
        locationId: null,
        locationText: "Floor 3",
        description: "Water below the sink",
        photos: [],
        idempotencyKey,
        requestDigest: "digest",
      });
      if (!report.ok) throw new Error(report.code);
      ticketIds.push(report.ticketId);
      const operator = {
        userId: await userOf("operator@streetproof.test"),
        roles: ["operator" as const],
      };
      await triageTicket(db, {
        tenantId,
        ticketId: report.ticketId,
        actor: operator,
        expectedRevision: 0,
        summary: "Leak below the sink",
        category: "plumbing",
        priority: "normal",
        locationId: null,
      });
      const assigned = await assignTicket(db, {
        tenantId,
        siteId,
        ticketId: report.ticketId,
        actor: operator,
        expectedRevision: 1,
        technicianId: await userOf("technician@streetproof.test"),
      });
      if (!assigned.ok) throw new Error("Assignment refused.");
      // Set directly: assignment refuses a deadline that has already passed.
      await db
        .update(tickets)
        .set({ dueAt })
        .where(eq(tickets.id, report.ticketId));
      return report.ticketId;
    }

    function outboxes() {
      const mail: Mail[] = [];
      const chats: TelegramMessage[] = [];
      return {
        mail,
        chats,
        sendMail: async (message: Mail) => {
          mail.push(message);
        },
        sendTelegram: async (message: TelegramMessage) => {
          chats.push(message);
          return "sent" as const;
        },
      };
    }

    it("reminds only the technician a day ahead, once", async () => {
      const now = new Date();
      const ticketId = await ticketDueAt(new Date(now.getTime() + 3 * HOUR_MS));
      const { mail, sendMail } = outboxes();

      await runDeadlineSweep({ db, sendMail, sendTelegram: null, appUrl }, now);
      await runDeadlineSweep({ db, sendMail, sendTelegram: null, appUrl }, now);

      const forTicket = mail.filter((message) =>
        message.text.includes(ticketId),
      );
      expect(forTicket.map((message) => message.to)).toEqual([
        "technician@streetproof.test",
      ]);
      expect(forTicket[0]?.subject).toContain("Due soon");
      expect(forTicket[0]?.text).toMatch(/\d{2}:\d{2} WIB/);
    });

    it("escalates a passed deadline to the site's operators and supervisors", async () => {
      const now = new Date();
      const ticketId = await ticketDueAt(new Date(now.getTime() - HOUR_MS));
      const { mail, sendMail } = outboxes();

      await runDeadlineSweep({ db, sendMail, sendTelegram: null, appUrl }, now);

      const recipients = mail
        .filter((message) => message.text.includes(ticketId))
        .map((message) => message.to)
        .sort();
      expect(recipients).toContain("technician@streetproof.test");
      expect(recipients).toContain("operator@streetproof.test");
      expect(recipients).toContain("supervisor@streetproof.test");
      expect(recipients).not.toContain("technician2@streetproof.test");
      expect(recipients).not.toContain("operator@kampus.streetproof.test");
    });

    it("tells a connected technician on Telegram in their language", async () => {
      const now = new Date();
      const ticketId = await ticketDueAt(new Date(now.getTime() + 2 * HOUR_MS));
      const chatId = String(7_000_000_000 + Math.floor(Math.random() * 1e6));
      chatIds.push(chatId);
      const technician = await userOf("technician@streetproof.test");
      await db
        .delete(telegramMembers)
        .where(eq(telegramMembers.userId, technician));
      await db
        .insert(telegramMembers)
        .values({ userId: technician, chatId, locale: "id" });
      const { chats, sendTelegram } = outboxes();

      await runDeadlineSweep({ db, sendMail: null, sendTelegram, appUrl }, now);

      const message = chats.find(
        (item) => item.chatId === chatId && item.text.includes(ticketId),
      );
      expect(message?.text).toContain("Tenggat kurang dari sehari");
    });

    it("tries again on the next sweep when sending fails", async () => {
      const now = new Date();
      const ticketId = await ticketDueAt(new Date(now.getTime() + HOUR_MS));
      const failing = async () => {
        throw new Error("smtp down");
      };

      await runDeadlineSweep(
        { db, sendMail: failing, sendTelegram: null, appUrl },
        now,
      );
      const claims = await db
        .select()
        .from(deadlineNotices)
        .where(
          and(
            eq(deadlineNotices.ticketId, ticketId),
            eq(deadlineNotices.kind, "due_soon"),
          ),
        );
      expect(claims).toEqual([]);

      const { mail, sendMail } = outboxes();
      await runDeadlineSweep({ db, sendMail, sendTelegram: null, appUrl }, now);
      expect(mail.some((message) => message.text.includes(ticketId))).toBe(
        true,
      );
    });

    it("leaves the technician alone once proof waits on a supervisor", async () => {
      const now = new Date();
      const soonId = await ticketDueAt(new Date(now.getTime() + HOUR_MS));
      const lateId = await ticketDueAt(new Date(now.getTime() - HOUR_MS));
      await db
        .update(tickets)
        .set({ status: "completion_submitted" })
        .where(inArray(tickets.id, [soonId, lateId]));
      const { mail, sendMail } = outboxes();

      await runDeadlineSweep({ db, sendMail, sendTelegram: null, appUrl }, now);

      expect(mail.some((message) => message.text.includes(soonId))).toBe(false);
      const late = mail
        .filter((message) => message.text.includes(lateId))
        .map((message) => message.to);
      // The demo admin holds the supervisor role too.
      expect(late.sort()).toEqual([
        "admin@streetproof.test",
        "supervisor@streetproof.test",
      ]);
    });

    it("sends nothing for work with no deadline soon, or when nothing is set up", async () => {
      const now = new Date();
      const ticketId = await ticketDueAt(
        new Date(now.getTime() + 72 * HOUR_MS),
      );
      const { mail, sendMail } = outboxes();

      await runDeadlineSweep({ db, sendMail, sendTelegram: null, appUrl }, now);
      expect(mail.some((message) => message.text.includes(ticketId))).toBe(
        false,
      );
      expect(
        await runDeadlineSweep(
          { db, sendMail: null, sendTelegram: null, appUrl },
          now,
        ),
      ).toBe(0);
    });
  },
);
