import { describe, expect, it } from "vitest";

import { createTelegramSender } from "./telegram-send";

const env = { TELEGRAM_BOT_TOKEN: "123:secret" };

function senderAnswering(response: Response) {
  const seen: { url: string; body: Record<string, unknown> }[] = [];
  const send = createTelegramSender(env, async (url, init) => {
    seen.push({
      url: String(url),
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return response;
  });
  if (!send) throw new Error("Expected a sender.");
  return { send, seen };
}

describe("createTelegramSender", () => {
  it("is null without a token", () => {
    expect(createTelegramSender({})).toBeNull();
  });

  it("sends plain text with no preview, and buttons when given", async () => {
    const { send, seen } = senderAnswering(Response.json({ ok: true }));

    const result = await send({
      chatId: "42",
      text: "Hello <b>",
      buttons: [{ text: "Accept", callbackData: "accept:1:2" }],
    });

    expect(result).toBe("sent");
    expect(seen[0]?.url).toContain("/sendMessage");
    expect(seen[0]?.body.parse_mode).toBeUndefined();
    expect(seen[0]?.body.link_preview_options).toEqual({ is_disabled: true });
    expect(seen[0]?.body.reply_markup).toEqual({
      inline_keyboard: [[{ text: "Accept", callback_data: "accept:1:2" }]],
    });
  });

  it("reports a blocked bot or a missing chat as unreachable", async () => {
    const blocked = senderAnswering(new Response("{}", { status: 403 }));
    expect(await blocked.send({ chatId: "42", text: "x" })).toBe("unreachable");

    const missing = senderAnswering(
      Response.json(
        { description: "Bad Request: chat not found" },
        { status: 400 },
      ),
    );
    expect(await missing.send({ chatId: "42", text: "x" })).toBe("unreachable");
  });

  it("throws on anything else, without the token in the error", async () => {
    const limited = senderAnswering(new Response("{}", { status: 429 }));
    await expect(limited.send({ chatId: "42", text: "x" })).rejects.toThrow(
      /^Telegram answered 429\.$/,
    );

    const malformed = senderAnswering(
      Response.json(
        { description: "Bad Request: text is empty" },
        { status: 400 },
      ),
    );
    await expect(malformed.send({ chatId: "42", text: "x" })).rejects.toThrow(
      "400",
    );
  });
});
