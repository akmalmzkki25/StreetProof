export type TelegramButton = { text: string; callbackData: string };

export type TelegramMessage = {
  chatId: string;
  text: string;
  buttons?: readonly TelegramButton[];
};

// "unreachable" means the person blocked the bot or the chat is gone. Trying again
// won't help, so a job shouldn't retry over it.
export type SendTelegram = (
  message: TelegramMessage,
) => Promise<"sent" | "unreachable">;

const REQUEST_TIMEOUT_MS = 15_000;

// Null when no bot is set. Callers then skip Telegram, and nothing else depends on
// it. Plain text only, so report text can't be read as markup.
export function createTelegramSender(
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): SendTelegram | null {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  return async function sendTelegram(message) {
    const response = await fetchImpl(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chatId,
          text: message.text,
          link_preview_options: { is_disabled: true },
          ...(message.buttons?.length
            ? {
                reply_markup: {
                  inline_keyboard: [
                    message.buttons.map((button) => ({
                      text: button.text,
                      callback_data: button.callbackData,
                    })),
                  ],
                },
              }
            : {}),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
    if (response.ok) return "sent";
    if (response.status === 403) return "unreachable";
    if (response.status === 400) {
      const body = (await response.json().catch(() => null)) as {
        description?: unknown;
      } | null;
      if (String(body?.description).includes("chat not found")) {
        return "unreachable";
      }
    }
    // The address holds the token, so only the status goes into the error.
    throw new Error(`Telegram answered ${response.status}.`);
  };
}
