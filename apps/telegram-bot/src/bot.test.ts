import {
  assignTicket,
  createDb,
  createMemberLinkCode,
  createReportLinkCode,
  listChatReports,
  schema,
  submitReport,
  transitionTicket,
  triageTicket,
} from "@streetproof/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Bot } from "grammy";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { installHandlers } from "./bot";
import type { BotDeps } from "./context";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
const url = process.env.DATABASE_URL;

const { assignments, completionSubmissions, idempotencyKeys } = schema;
const { memberships, outbox, proofChecks, reporterCredentials } = schema;
const { reports, sites, telegramConversations, telegramLinkCodes } = schema;
const { telegramMembers, telegramReportSubscriptions, tenants } = schema;
const { ticketEvents, tickets, uploads, user, verifications } = schema;

type Sent = { method: string; payload: Record<string, unknown> };

const APP_URL = "https://app.example.test";

describe.skipIf(!url)("Telegram bot (needs the seeded local database)", () => {
  const { db, pool } = createDb(url ?? "");
  const stored = new Map<string, Uint8Array>();
  const chatIds = new Set<string>();
  const ticketIds = new Set<string>();
  const submissionKeys = new Set<string>();
  let jpeg: Uint8Array;
  let tenantId = "";
  let siteId = "";
  let nextChat = 9_000_000_000 + Math.floor(Math.random() * 1_000_000);
  let nextUpdate = 1;

  beforeAll(async () => {
    jpeg = new Uint8Array(
      await sharp({
        create: {
          width: 32,
          height: 32,
          channels: 3,
          background: { r: 90, g: 90, b: 90 },
        },
      })
        .jpeg()
        .toBuffer(),
    );
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
    const ids = [...ticketIds];
    if (ids.length > 0) {
      const attempts = await db
        .select({ id: completionSubmissions.id })
        .from(completionSubmissions)
        .where(inArray(completionSubmissions.ticketId, ids));
      const attemptIds = attempts.map((attempt) => attempt.id);
      if (attemptIds.length > 0) {
        await db
          .delete(verifications)
          .where(inArray(verifications.completionId, attemptIds));
        await db
          .delete(proofChecks)
          .where(inArray(proofChecks.completionId, attemptIds));
        await db
          .delete(uploads)
          .where(inArray(uploads.completionId, attemptIds));
      }
      await db
        .delete(completionSubmissions)
        .where(inArray(completionSubmissions.ticketId, ids));
      await db.delete(assignments).where(inArray(assignments.ticketId, ids));

      const ticketReports = await db
        .select({ id: reports.id })
        .from(reports)
        .where(inArray(reports.canonicalTicketId, ids));
      const reportIds = ticketReports.map((report) => report.id);
      await db
        .delete(reporterCredentials)
        .where(inArray(reporterCredentials.reportId, reportIds));
      await db.delete(uploads).where(inArray(uploads.reportId, reportIds));
      await db.delete(reports).where(inArray(reports.id, reportIds));
      await db
        .delete(outbox)
        .where(inArray(sql`${outbox.payload}->>'ticketId'`, ids));
      await db.delete(ticketEvents).where(inArray(ticketEvents.ticketId, ids));
      await db.delete(tickets).where(inArray(tickets.id, ids));
    }
    if (submissionKeys.size > 0) {
      await db
        .delete(idempotencyKeys)
        .where(inArray(idempotencyKeys.key, [...submissionKeys]));
    }
    await db
      .delete(telegramMembers)
      .where(inArray(telegramMembers.chatId, [...chatIds]));
    await db
      .delete(telegramConversations)
      .where(inArray(telegramConversations.chatId, [...chatIds]));
    await pool.end();
  });

  function newChat() {
    nextChat += 1;
    chatIds.add(String(nextChat));
    return nextChat;
  }

  // A real bot and real handlers, with Telegram replaced at the API layer.
  function harness(overrides: Partial<BotDeps> = {}) {
    const sent: Sent[] = [];
    const bot = new Bot("123:test", {
      botInfo: {
        id: 123,
        is_bot: true,
        first_name: "StreetProof",
        username: "streetproof_test_bot",
        can_join_groups: false,
        can_read_all_group_messages: false,
        supports_inline_queries: false,
        can_connect_to_business: false,
        has_main_web_app: false,
        has_topics_enabled: false,
        allows_users_to_create_topics: false,
        can_manage_bots: false,
        supports_join_request_queries: false,
      },
    });
    bot.api.config.use(async function fakeTelegram(_prev, method, payload) {
      sent.push({ method, payload: payload as Record<string, unknown> });
      const result =
        method === "getFile"
          ? { file_id: "f", file_unique_id: "u", file_path: "files/f" }
          : method === "answerCallbackQuery"
            ? true
            : { message_id: 1, date: 0, chat: { id: 1, type: "private" } };
      return { ok: true, result } as never;
    });
    installHandlers(bot, {
      db,
      putObject: async (key, body) => {
        stored.set(key, body);
      },
      getObjectBytes: async () => jpeg,
      downloadFile: async () => jpeg,
      transcribe: async () => "Air menetes dari plafon lobi",
      appUrl: APP_URL,
      ...overrides,
    });
    return { bot, sent };
  }

  function messageBase(chat: number, type = "private", language = "en") {
    nextUpdate += 1;
    return {
      update_id: nextUpdate,
      message: {
        message_id: nextUpdate,
        date: 0,
        chat: { id: chat, type, first_name: "Test" },
        from: {
          id: chat,
          is_bot: false,
          first_name: "Test",
          language_code: language,
        },
      },
    };
  }

  function say(bot: Bot, chat: number, text: string, language = "en") {
    const base = messageBase(chat, "private", language);
    const entities = text.startsWith("/")
      ? [
          {
            type: "bot_command",
            offset: 0,
            length: text.split(" ")[0]?.length ?? 0,
          },
        ]
      : [];
    return bot.handleUpdate({
      ...base,
      message: { ...base.message, text, entities },
    } as never);
  }

  function sendPhoto(bot: Bot, chat: number) {
    const base = messageBase(chat);
    return bot.handleUpdate({
      ...base,
      message: {
        ...base.message,
        photo: [
          { file_id: "small", file_unique_id: "s", width: 1, height: 1 },
          { file_id: "large", file_unique_id: "l", width: 9, height: 9 },
        ],
      },
    } as never);
  }

  function sendVoice(bot: Bot, chat: number, duration = 5) {
    const base = messageBase(chat);
    return bot.handleUpdate({
      ...base,
      message: {
        ...base.message,
        voice: { file_id: "voice", file_unique_id: "v", duration },
      },
    } as never);
  }

  function shareLocation(bot: Bot, chat: number) {
    const base = messageBase(chat);
    return bot.handleUpdate({
      ...base,
      message: {
        ...base.message,
        location: { latitude: -6.1908, longitude: 106.7651 },
      },
    } as never);
  }

  function press(bot: Bot, chat: number, data: string, language = "en") {
    nextUpdate += 1;
    return bot.handleUpdate({
      update_id: nextUpdate,
      callback_query: {
        id: String(nextUpdate),
        chat_instance: "x",
        data,
        from: {
          id: chat,
          is_bot: false,
          first_name: "Test",
          language_code: language,
        },
        message: {
          message_id: 1,
          date: 0,
          chat: { id: chat, type: "private", first_name: "Test" },
        },
      },
    } as never);
  }

  function texts(sent: Sent[]) {
    return sent
      .filter((item) => item.method === "sendMessage")
      .map((item) => String(item.payload.text));
  }

  function lastText(sent: Sent[]) {
    return texts(sent).at(-1) ?? "";
  }

  function buttons(sent: Sent[]) {
    const last = sent.filter((item) => item.method === "sendMessage").at(-1);
    const markup = last?.payload.reply_markup as
      | { inline_keyboard: { text: string; callback_data: string }[][] }
      | undefined;
    return markup?.inline_keyboard.flat() ?? [];
  }

  async function memberIdOf(email: string) {
    const [row] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email));
    if (!row) throw new Error("Run pnpm db:seed first.");
    return row.id;
  }

  async function linkedChat(bot: Bot, email: string) {
    const chat = newChat();
    const code = await createMemberLinkCode(db, {
      userId: await memberIdOf(email),
      tenantId,
    });
    await say(bot, chat, `/start l_${code}`);
    return chat;
  }

  // A report that has reached the given technician, through the real commands.
  async function assignedTicket(technicianEmail: string) {
    const reportId = randomUUID();
    const idempotencyKey = randomUUID();
    submissionKeys.add(idempotencyKey);
    const report = await submitReport(db, {
      tenantId,
      siteId,
      reportId,
      locationId: null,
      locationText: "Floor 3",
      description: "Water below the sink",
      photos: [
        {
          objectKey: `tests/${reportId}.jpg`,
          contentType: "image/jpeg",
          bytes: 10,
          sha256: "x",
        },
      ],
      idempotencyKey,
      requestDigest: "digest",
    });
    if (!report.ok) throw new Error(report.code);
    ticketIds.add(report.ticketId);

    const operator = {
      userId: await memberIdOf("operator@streetproof.test"),
      roles: ["operator" as const],
    };
    const triaged = await triageTicket(db, {
      tenantId,
      ticketId: report.ticketId,
      actor: operator,
      expectedRevision: 0,
      summary: "Leak below the sink",
      category: "plumbing",
      priority: "normal",
      locationId: null,
    });
    if (!triaged.ok) throw new Error("Triage refused.");
    const assigned = await assignTicket(db, {
      tenantId,
      siteId,
      ticketId: report.ticketId,
      actor: operator,
      expectedRevision: 1,
      technicianId: await memberIdOf(technicianEmail),
    });
    if (!assigned.ok) throw new Error("Assignment refused.");
    return {
      ticketId: report.ticketId,
      revision: 2,
      token: report.reporterToken,
    };
  }

  async function ticketStatus(ticketId: string) {
    const [row] = await db
      .select({ status: tickets.status, revision: tickets.revision })
      .from(tickets)
      .where(eq(tickets.id, ticketId));
    return row;
  }

  async function fileReportInChat(bot: Bot, chat: number, language = "en") {
    await say(bot, chat, "/start s_graha-tower-a", language);
    await press(bot, chat, "loc:0", language);
    await say(bot, chat, "Water dripping from the ceiling", language);
    await sendPhoto(bot, chat);
    await press(bot, chat, "report:send", language);
    const [row] = await db
      .select({
        ticketId: reports.canonicalTicketId,
        reportId: telegramReportSubscriptions.reportId,
      })
      .from(telegramReportSubscriptions)
      .innerJoin(reports, eq(reports.id, telegramReportSubscriptions.reportId))
      .where(eq(telegramReportSubscriptions.chatId, String(chat)));
    if (!row) throw new Error("No report was filed.");
    ticketIds.add(row.ticketId);
    const [key] = await db
      .select({ key: idempotencyKeys.key })
      .from(idempotencyKeys)
      .where(eq(sql`${idempotencyKeys.response}->>'reportId'`, row.reportId));
    if (key) submissionKeys.add(key.key);
    return row;
  }

  it("ignores anything outside a private chat", async () => {
    const { bot, sent } = harness();
    const base = messageBase(newChat(), "group");
    await bot.handleUpdate({
      ...base,
      message: {
        ...base.message,
        text: "/help",
        entities: [{ type: "bot_command", offset: 0, length: 5 }],
      },
    } as never);
    expect(sent).toEqual([]);
  });

  it("files a report from a site link and follows it", async () => {
    const { bot, sent } = harness();
    const chat = newChat();

    const { ticketId, reportId } = await fileReportInChat(bot, chat);

    expect(texts(sent)[0]).toContain("Graha Contoh Tower A");
    expect(texts(sent)[0]).toContain("emergencies");
    const reply = lastText(sent);
    expect(reply).toContain(reportId.slice(0, 8).toUpperCase());
    expect(reply).toContain(`${APP_URL}/status#t=`);

    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId));
    expect(report?.description).toBe("Water dripping from the ceiling");
    expect(report?.locationId).not.toBeNull();
    const photos = await db
      .select()
      .from(uploads)
      .where(eq(uploads.reportId, reportId));
    expect(photos).toHaveLength(1);
    expect(stored.has(photos[0]?.objectKey ?? "")).toBe(true);
    expect((await ticketStatus(ticketId))?.status).toBe("submitted");

    const statuses = await listChatReports(db, String(chat));
    expect(statuses.map((item) => item.stage)).toEqual(["received"]);

    await say(bot, chat, "/status");
    expect(lastText(sent)).toContain("Received");
  });

  it("speaks Indonesian to an Indonesian Telegram", async () => {
    const { bot, sent } = harness();
    await say(bot, newChat(), "/start s_graha-tower-a", "id");
    expect(lastText(sent)).toContain("Laporkan kerusakan");
  });

  it("takes a typed location, and refuses text that's too short", async () => {
    const { bot, sent } = harness();
    const chat = newChat();
    await say(bot, chat, "/start s_graha-tower-a");
    await press(bot, chat, "loc:other");
    await say(bot, chat, "Roof, near the water tank");
    await say(bot, chat, "bad");
    expect(lastText(sent)).toContain("5 to 2,000");
    await say(bot, chat, "/cancel");
    expect(lastText(sent)).toBe("Stopped.");
  });

  it("needs a voice note's text confirmed before using it", async () => {
    const { bot, sent } = harness();
    const chat = newChat();
    await say(bot, chat, "/start s_graha-tower-a");
    await press(bot, chat, "loc:0");

    await sendVoice(bot, chat, 90);
    expect(lastText(sent)).toContain("under a minute");

    await sendVoice(bot, chat);
    expect(lastText(sent)).toContain("Air menetes dari plafon lobi");
    expect(buttons(sent).map((item) => item.callback_data)).toEqual([
      "voice:use",
    ]);

    await press(bot, chat, "voice:use");
    expect(lastText(sent)).toContain("photos");
    await say(bot, chat, "/cancel");
  });

  it("says so when a voice note can't be read or isn't available", async () => {
    const failing = harness({ transcribe: async () => null });
    const chat = newChat();
    await say(failing.bot, chat, "/start s_graha-tower-a");
    await press(failing.bot, chat, "loc:0");
    await sendVoice(failing.bot, chat);
    expect(lastText(failing.sent)).toContain("couldn't make that out");

    const off = harness({ transcribe: null });
    await sendVoice(off.bot, chat);
    expect(lastText(off.sent)).toContain("aren't available");
    await say(off.bot, chat, "/cancel");
  });

  it("refuses a file that isn't an image and files nothing without a photo", async () => {
    const { bot, sent } = harness({
      downloadFile: async () => new TextEncoder().encode("<script>"),
    });
    const chat = newChat();
    await say(bot, chat, "/start s_graha-tower-a");
    await press(bot, chat, "loc:0");
    await say(bot, chat, "Water dripping from the ceiling");
    await sendPhoto(bot, chat);
    expect(lastText(sent)).toContain("JPEG, PNG or WebP");

    await press(bot, chat, "report:send");
    expect(lastText(sent)).toContain("at least one photo");
    await say(bot, chat, "/cancel");
  });

  it("stops at the photo limit", async () => {
    const { bot, sent } = harness();
    const chat = newChat();
    await say(bot, chat, "/start s_graha-tower-a");
    await press(bot, chat, "loc:0");
    await say(bot, chat, "Water dripping from the ceiling");
    for (let index = 0; index < 4; index += 1) await sendPhoto(bot, chat);
    expect(lastText(sent)).toContain("most photos");
    await say(bot, chat, "/cancel");
  });

  it("takes a shared location in place of choosing one, and keeps the pin", async () => {
    const { bot, sent } = harness();
    const chat = newChat();
    await say(bot, chat, "/start s_graha-tower-a");

    await shareLocation(bot, chat);
    expect(texts(sent).some((text) => text.includes("pinned"))).toBe(true);
    expect(lastText(sent)).toContain("What did you see");

    await say(bot, chat, "Pothole by the car park gate");
    await sendPhoto(bot, chat);
    await press(bot, chat, "report:send");

    const [row] = await db
      .select({
        ticketId: reports.canonicalTicketId,
        latitude: reports.latitude,
        longitude: reports.longitude,
        locationText: reports.locationText,
        locationId: reports.locationId,
      })
      .from(telegramReportSubscriptions)
      .innerJoin(reports, eq(reports.id, telegramReportSubscriptions.reportId))
      .where(eq(telegramReportSubscriptions.chatId, String(chat)));
    if (!row) throw new Error("No report was filed.");
    ticketIds.add(row.ticketId);
    expect(row).toMatchObject({
      latitude: -6.1908,
      longitude: 106.7651,
      locationText: "Shared location",
      locationId: null,
    });
  });

  it("refuses an unknown site code", async () => {
    const { bot, sent } = harness();
    await say(bot, newChat(), "/start s_not-a-site");
    expect(lastText(sent)).toContain("isn't available");
  });

  it("links a member once, with a code that can't be reused", async () => {
    const { bot, sent } = harness();
    const userId = await memberIdOf("technician@streetproof.test");
    const code = await createMemberLinkCode(db, { userId, tenantId });
    const chat = newChat();

    await say(bot, chat, `/start l_${code}`);
    expect(lastText(sent)).toContain("Budi Technician");

    const other = newChat();
    await say(bot, other, `/start l_${code}`);
    expect(lastText(sent)).toContain("expired");
    await say(bot, other, "/work");
    expect(lastText(sent)).toContain("Connect your StreetProof account");
  });

  it("refuses an expired code", async () => {
    const { bot, sent } = harness();
    const code = await createMemberLinkCode(db, {
      userId: await memberIdOf("technician@streetproof.test"),
      tenantId,
    });
    await db
      .update(telegramLinkCodes)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(sql`${telegramLinkCodes.usedAt} is null`);

    await say(bot, newChat(), `/start l_${code}`);
    expect(lastText(sent)).toContain("expired");
  });

  it("follows a report from a status page's code, and only that", async () => {
    const { bot, sent } = harness();
    const { ticketId, token } = await assignedTicket(
      "technician@streetproof.test",
    );
    expect(await createReportLinkCode(db, "not-a-real-token")).toBeNull();
    const code = await createReportLinkCode(db, token);
    const chat = newChat();

    await say(bot, chat, `/start l_${code}`);
    expect(lastText(sent)).toContain("You'll get updates");

    await say(bot, chat, "/status");
    expect(lastText(sent)).toContain("Being repaired");
    expect(lastText(sent)).not.toContain("Budi");

    await press(bot, chat, `accept:${ticketId}:2`);
    expect(lastText(sent)).toContain("Connect your StreetProof account");
    expect((await ticketStatus(ticketId))?.status).toBe("assigned");

    await say(bot, chat, "/stop");
    expect(await listChatReports(db, String(chat))).toEqual([]);
  });

  it("takes work from assignment to verified, through a rejected proof", async () => {
    const { bot, sent } = harness();
    const { ticketId } = await assignedTicket("technician@streetproof.test");
    const technician = await linkedChat(bot, "technician@streetproof.test");
    const supervisor = await linkedChat(bot, "supervisor@streetproof.test");

    await say(bot, technician, "/work");
    expect(JSON.stringify(sent)).toContain(`accept:${ticketId}:2`);

    await press(bot, technician, `accept:${ticketId}:2`);
    expect(lastText(sent)).toContain("Accepted");
    expect(buttons(sent)[0]?.callback_data).toBe(`start:${ticketId}:3`);

    await press(bot, technician, `start:${ticketId}:3`);
    expect(buttons(sent)[0]?.callback_data).toBe(`proof:${ticketId}:4`);

    await press(bot, technician, `proof:${ticketId}:4`);
    expect(lastText(sent)).toContain("Check 1 of 3");

    // A note before the checks are done doesn't skip them.
    await say(bot, technician, "All fixed now");
    expect(lastText(sent)).toContain("one of the buttons");

    await press(bot, technician, "check:yes:0");
    await press(bot, technician, "check:yes:0");
    expect(lastText(sent)).toContain("Check 2 of 3");
    await press(bot, technician, "check:yes:1");
    await press(bot, technician, "check:yes:2");
    expect(lastText(sent)).toContain("What did you do");

    await say(bot, technician, "Replaced the trap seal");
    await press(bot, technician, "proof:send");
    expect(lastText(sent)).toContain("at least one photo");
    await sendPhoto(bot, technician);
    await press(bot, technician, "proof:send");
    expect(lastText(sent)).toContain("Proof sent");
    expect(await ticketStatus(ticketId)).toMatchObject({
      status: "completion_submitted",
      revision: 5,
    });

    const [attempt] = await db
      .select()
      .from(completionSubmissions)
      .where(eq(completionSubmissions.ticketId, ticketId));
    expect(attempt?.note).toBe("Replaced the trap seal");
    expect(attempt?.checklist.every((item) => item.checked)).toBe(true);
    const [check] = await db
      .select()
      .from(proofChecks)
      .where(eq(proofChecks.completionId, attempt?.id ?? ""));
    expect(check?.state).toBe("queued");

    await say(bot, supervisor, "/reviews");
    expect(JSON.stringify(sent)).toContain(`review:${ticketId}`);

    const before = sent.length;
    await press(bot, supervisor, `review:${ticketId}`);
    const photos = sent
      .slice(before)
      .filter((item) => item.method === "sendPhoto");
    expect(photos.map((item) => item.payload.caption)).toEqual([
      "Before",
      "After",
    ]);
    expect(lastText(sent)).toContain("Replaced the trap seal");
    expect(lastText(sent)).toContain("Budi Technician");
    expect(buttons(sent).map((item) => item.callback_data)).toEqual([
      `decide:a:${ticketId}:5`,
      `decide:r:${ticketId}:5`,
    ]);

    await press(bot, supervisor, `decide:r:${ticketId}:5`);
    await say(bot, supervisor, "no");
    expect(lastText(sent)).toContain("5 to 500");
    await say(bot, supervisor, "The seal is not visible");
    expect(lastText(sent)).toContain("back to the technician");
    expect((await ticketStatus(ticketId))?.status).toBe("rejected_with_reason");

    await say(bot, technician, "/work");
    await press(bot, technician, `resume:${ticketId}:6`);
    await press(bot, technician, `proof:${ticketId}:7`);
    await press(bot, technician, "check:yes:0");
    await press(bot, technician, "check:yes:1");
    await press(bot, technician, "check:yes:2");
    await say(bot, technician, "Photo shows the new seal");
    await sendPhoto(bot, technician);
    await press(bot, technician, "proof:send");

    await press(bot, supervisor, `decide:a:${ticketId}:8`);
    await say(bot, supervisor, "New seal visible and dry");
    expect(lastText(sent)).toContain("Verified and closed");
    expect((await ticketStatus(ticketId))?.status).toBe("verified_closed");
  });

  it("refuses a stale button, without changing the ticket", async () => {
    const { bot, sent } = harness();
    const { ticketId } = await assignedTicket("technician@streetproof.test");
    const technician = await linkedChat(bot, "technician@streetproof.test");

    await press(bot, technician, `accept:${ticketId}:2`);
    await press(bot, technician, `accept:${ticketId}:2`);

    expect(lastText(sent)).toContain("Someone else changed");
    expect((await ticketStatus(ticketId))?.revision).toBe(3);
  });

  it("keeps a technician out of someone else's work", async () => {
    const { bot, sent } = harness();
    const { ticketId } = await assignedTicket("technician@streetproof.test");
    const other = await linkedChat(bot, "technician2@streetproof.test");

    await press(bot, other, `accept:${ticketId}:2`);
    expect(lastText(sent)).toContain("isn't available");
    await press(bot, other, `proof:${ticketId}:2`);
    expect(lastText(sent)).toContain("isn't available");
    await press(bot, other, `review:${ticketId}`);
    expect(lastText(sent)).toContain("isn't allowed");
    expect((await ticketStatus(ticketId))?.status).toBe("assigned");
  });

  it("stops a technician from deciding on proof", async () => {
    const { bot, sent } = harness();
    const { ticketId } = await assignedTicket("technician@streetproof.test");
    const technician = await linkedChat(bot, "technician@streetproof.test");

    await press(bot, technician, `decide:a:${ticketId}:2`);
    expect(lastText(sent)).toContain("isn't allowed");
    await say(bot, technician, "Approve this please");
    expect(lastText(sent)).toContain("/help");
  });

  it("sends a can't-confirm answer to the web, with no attempt made", async () => {
    const { bot, sent } = harness();
    const { ticketId } = await assignedTicket("technician@streetproof.test");
    const technician = await linkedChat(bot, "technician@streetproof.test");
    await press(bot, technician, `accept:${ticketId}:2`);
    await press(bot, technician, `start:${ticketId}:3`);
    await press(bot, technician, `proof:${ticketId}:4`);

    await press(bot, technician, "check:no:0");

    expect(lastText(sent)).toContain(`${APP_URL}/app/tickets/${ticketId}`);
    expect((await ticketStatus(ticketId))?.status).toBe("in_progress");
  });

  it("cuts off a deactivated member at their next action", async () => {
    const { bot, sent } = harness();
    const { ticketId } = await assignedTicket("technician2@streetproof.test");
    const chat = await linkedChat(bot, "technician2@streetproof.test");
    const userId = await memberIdOf("technician2@streetproof.test");

    await db
      .update(memberships)
      .set({ active: false })
      .where(eq(memberships.userId, userId));
    try {
      await press(bot, chat, `accept:${ticketId}:2`);
      expect(lastText(sent)).toContain("Connect your StreetProof account");
      expect((await ticketStatus(ticketId))?.status).toBe("assigned");
    } finally {
      await db
        .update(memberships)
        .set({ active: true })
        .where(eq(memberships.userId, userId));
    }
  });

  it("drops the link and subscriptions when asked to stop", async () => {
    const { bot, sent } = harness();
    const chat = await linkedChat(bot, "technician@streetproof.test");

    await say(bot, chat, "/stop");

    expect(lastText(sent)).toContain("disconnected");
    const rows = await db
      .select()
      .from(telegramMembers)
      .where(and(eq(telegramMembers.chatId, String(chat))));
    expect(rows).toEqual([]);
  });

  it("logs the failure and tells the person when a step breaks", async () => {
    const { bot, sent } = harness({
      downloadFile: async () => {
        throw new Error("https://api.telegram.org/file/botSECRET/x");
      },
    });
    const chat = newChat();
    await say(bot, chat, "/start s_graha-tower-a");
    await press(bot, chat, "loc:0");
    await say(bot, chat, "Water dripping from the ceiling");

    const errors: string[] = [];
    const original = console.error;
    console.error = (line: string) => errors.push(line);
    try {
      // Polling hands a failed update to the error handler the same way.
      await sendPhoto(bot, chat).catch((error) => bot.errorHandler(error));
    } finally {
      console.error = original;
    }

    expect(lastText(sent)).toContain("Something went wrong");
    expect(errors.join("")).toContain("Telegram update failed");
    expect(errors.join("")).not.toContain("SECRET");
    await say(bot, chat, "/cancel");
  });
});
