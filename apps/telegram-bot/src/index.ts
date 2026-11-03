import { getDb, logEvent } from "@streetproof/db";
import { createStorage, storageConfigFromEnv } from "@streetproof/db/storage";
import { Bot } from "grammy";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { installHandlers } from "./bot";
import { transcribeOgg } from "./voice";

const DOWNLOAD_TIMEOUT_MS = 30_000;

// The monorepo has one .env at the root. Values already set win.
const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  logEvent("info", "No TELEGRAM_BOT_TOKEN, so the Telegram bot isn't running");
  process.exit(0);
}

const storage = createStorage(storageConfigFromEnv());
const metaKey = process.env.META_API_KEY;
const metaBaseUrl = process.env.META_API_BASE_URL || "https://api.meta.ai/v1";

async function downloadFile(filePath: string) {
  const response = await fetch(
    `https://api.telegram.org/file/bot${token}/${filePath}`,
    { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) },
  );
  // The address holds the token, so only the status goes into the error.
  if (!response.ok) throw new Error(`Telegram answered ${response.status}.`);
  return new Uint8Array(await response.arrayBuffer());
}

const bot = new Bot(token);
installHandlers(bot, {
  db: getDb(),
  putObject: storage.putObject,
  getObjectBytes: storage.getObjectBytes,
  downloadFile,
  transcribe: metaKey
    ? (ogg) => transcribeOgg(ogg, { apiKey: metaKey, baseUrl: metaBaseUrl })
    : null,
  appUrl: process.env.APP_URL ?? "",
});

function stop() {
  void bot.stop();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await bot.api.setMyCommands([
  { command: "status", description: "Reports you follow" },
  { command: "work", description: "Your assigned work" },
  { command: "reviews", description: "Proof waiting for a decision" },
  { command: "cancel", description: "Stop what you're doing" },
  { command: "stop", description: "Disconnect this chat" },
  { command: "help", description: "What this bot does" },
]);
await bot.api.setMyCommands(
  [
    { command: "status", description: "Laporan yang Anda ikuti" },
    { command: "work", description: "Tugas Anda" },
    { command: "reviews", description: "Bukti yang menunggu keputusan" },
    { command: "cancel", description: "Hentikan yang sedang berjalan" },
    { command: "stop", description: "Putuskan chat ini" },
    { command: "help", description: "Fungsi bot ini" },
  ],
  { language_code: "id" },
);

logEvent("info", "Telegram bot started", { voice: metaKey !== undefined });
await bot.start({
  allowed_updates: ["message", "callback_query"],
});
logEvent("info", "Telegram bot stopped");
process.exit(0);
