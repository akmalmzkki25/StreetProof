import {
  createDb,
  linkDuplicate,
  requestClarification,
  schema,
  submitReport,
  subscribeChatToReport,
  transitionTicket,
  type OutboxJob,
} from "@streetproof/db";
import type { Mail } from "@streetproof/db/mail";
import type { TelegramMessage } from "@streetproof/db/telegram-send";
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

const { clarifications, duplicateLinks, idempotencyKeys } = schema;
const { memberships, outbox } = schema;
const { reporterCredentials, reporterNotifications, reports } = schema;
const { sites, telegramMembers, tenants, ticketEvents, tickets, user } = schema;

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

    describe("on Telegram", () => {
      const chatIds: string[] = [];
      let nextChat = 8_000_000_000 + Math.floor(Math.random() * 1_000_000);

      afterEach(async () => {
        if (chatIds.length === 0) return;
        await db
          .delete(telegramMembers)
          .where(inArray(telegramMembers.chatId, chatIds));
        chatIds.length = 0;
      });

      function newChat() {
        nextChat += 1;
        const chatId = String(nextChat);
        chatIds.push(chatId);
        return chatId;
      }

      function chats() {
        const sent: TelegramMessage[] = [];
        return {
          sent,
          sendTelegram: async (message: TelegramMessage) => {
            sent.push(message);
            return "sent" as const;
          },
        };
      }

      async function userOf(email: string) {
        const [row] = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, email));
        if (!row) throw new Error("Run pnpm db:seed first.");
        return row.id;
      }

      async function linkStaff(email: string, locale = "en") {
        const chatId = newChat();
        const userId = await userOf(email);
        await db
          .delete(telegramMembers)
          .where(eq(telegramMembers.userId, userId));
        await db.insert(telegramMembers).values({ userId, chatId, locale });
        return chatId;
      }

      async function follow(
        report: { reportId: string; tenantId: string },
        locale: "en" | "id" = "en",
      ) {
        const chatId = newChat();
        await subscribeChatToReport(db, {
          tenantId: report.tenantId,
          reportId: report.reportId,
          chatId,
          locale,
        });
        return chatId;
      }

      function jobFor(job: OutboxJob, from: string, to: string, revision = 1) {
        return { ...job, payload: { ...job.payload, from, to, revision } };
      }

      it("tells a follower in their language, without staff details, once", async () => {
        const report = await newReport(null);
        const chatId = await follow(report, "id");
        const job = await askQuestion(report.ticketId, report.tenantId);
        const { sent, sendTelegram } = chats();
        const deps = { db, sendMail: null, sendTelegram, appUrl };

        expect(await runNotificationJob(deps, job)).toBe("succeeded");
        await runNotificationJob(deps, job);

        expect(sent).toHaveLength(1);
        expect(sent[0]?.chatId).toBe(chatId);
        expect(sent[0]?.text).toContain("pertanyaan");
        expect(sent[0]?.buttons).toBeUndefined();
        expect(sent[0]?.text).not.toContain(report.reporterToken);
        expect(sent[0]?.text).not.toContain(report.ticketId);
      });

      it("puts the question and an Answer button in front of its reporter", async () => {
        const report = await newReport(null);
        const chatId = await follow(report);
        const operator = await operatorOf(report.tenantId);
        const asked = await requestClarification(db, {
          tenantId: report.tenantId,
          ticketId: report.ticketId,
          actor: operator,
          expectedRevision: 0,
          question: "Which floor is the sink on?",
        });
        expect(asked.ok).toBe(true);
        const [job] = await db
          .select()
          .from(outbox)
          .where(
            and(
              eq(outbox.topic, NOTIFICATION_TOPIC),
              eq(sql`${outbox.payload}->>'ticketId'`, report.ticketId),
            ),
          );
        if (!job) throw new Error("no job");
        const { sent, sendTelegram } = chats();

        await runNotificationJob(
          { db, sendMail: null, sendTelegram, appUrl },
          job,
        );

        const message = sent.find((item) => item.chatId === chatId);
        expect(message?.text).toContain('"Which floor is the sink on?"');
        expect(message?.buttons?.[0]?.callbackData).toBe(
          `answer:${report.reportId}`,
        );
        await db
          .delete(clarifications)
          .where(eq(clarifications.ticketId, report.ticketId));
      });

      it("offers the assigned technician a button with the current revision", async () => {
        const report = await newReport(null);
        const chatId = await linkStaff("technician@streetproof.test");
        const job = await askQuestion(report.ticketId, report.tenantId);
        await db
          .update(tickets)
          .set({
            currentAssigneeId: await userOf("technician@streetproof.test"),
          })
          .where(eq(tickets.id, report.ticketId));
        const { sent, sendTelegram } = chats();

        await runNotificationJob(
          { db, sendMail: null, sendTelegram, appUrl },
          jobFor(job, "triaged", "assigned", 7),
        );

        const message = sent.find((item) => item.chatId === chatId);
        expect(message?.text).toContain("New work for you");
        expect(message?.text).toContain(`/app/tickets/${report.ticketId}`);
        expect(message?.buttons?.[0]?.callbackData).toBe(
          `accept:${report.ticketId}:7`,
        );
      });

      it("tells the technician why proof was rejected, and never the reporter", async () => {
        const report = await newReport(null);
        const follower = await follow(report);
        const technician = await linkStaff("technician@streetproof.test");
        const job = await askQuestion(report.ticketId, report.tenantId);
        await db
          .update(tickets)
          .set({
            currentAssigneeId: await userOf("technician@streetproof.test"),
          })
          .where(eq(tickets.id, report.ticketId));
        const { sent, sendTelegram } = chats();

        await runNotificationJob(
          { db, sendMail: null, sendTelegram, appUrl },
          {
            ...jobFor(job, "completion_submitted", "rejected_with_reason", 6),
            payload: {
              ...jobFor(job, "completion_submitted", "rejected_with_reason", 6)
                .payload,
              reason: "The seal is not visible",
            },
          },
        );

        expect(sent.map((item) => item.chatId)).toEqual([technician]);
        expect(sent[0]?.text).toContain("The seal is not visible");
        expect(sent.some((item) => item.chatId === follower)).toBe(false);
      });

      it("asks a site's supervisors to review, with a button", async () => {
        const report = await newReport(null);
        const chatId = await linkStaff("supervisor@streetproof.test", "id");
        const job = await askQuestion(report.ticketId, report.tenantId);
        const { sent, sendTelegram } = chats();

        await runNotificationJob(
          { db, sendMail: null, sendTelegram, appUrl },
          jobFor(job, "in_progress", "completion_submitted", 5),
        );

        const message = sent.find((item) => item.chatId === chatId);
        expect(message?.text).toContain("menunggu keputusan");
        expect(message?.buttons?.[0]?.callbackData).toBe(
          `review:${report.ticketId}`,
        );
      });

      it("counts a blocked chat as told, so the job finishes", async () => {
        const report = await newReport(null);
        const chatId = await follow(report);
        const job = await askQuestion(report.ticketId, report.tenantId);
        const attempts: string[] = [];
        const sendTelegram = async (message: TelegramMessage) => {
          attempts.push(message.chatId);
          return "unreachable" as const;
        };
        const deps = { db, sendMail: null, sendTelegram, appUrl };

        expect(await runNotificationJob(deps, job)).toBe("succeeded");
        await runNotificationJob(deps, job);

        expect(attempts).toEqual([chatId]);
      });

      it("still sends email when Telegram is down, then retries", async () => {
        const report = await newReport("reporter@example.test");
        await follow(report);
        const job = await askQuestion(report.ticketId, report.tenantId);
        const { sent: mail, sendMail } = inbox();
        const sendTelegram = async () => {
          throw new Error("Telegram answered 502.");
        };

        await expect(
          runNotificationJob({ db, sendMail, sendTelegram, appUrl }, job),
        ).rejects.toThrow("502");

        expect(mail).toHaveLength(1);
        const [row] = await db
          .select()
          .from(tickets)
          .where(eq(tickets.id, report.ticketId));
        expect(row?.status).toBe("needs_clarification");
      });

      it("sends nothing when nobody is connected", async () => {
        const report = await newReport(null);
        const job = await askQuestion(report.ticketId, report.tenantId);
        const { sent, sendTelegram } = chats();

        expect(
          await runNotificationJob(
            { db, sendMail: null, sendTelegram, appUrl },
            job,
          ),
        ).toBe("succeeded");
        expect(sent).toEqual([]);
      });
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
