// Null when no bot is set, and callers then show nothing about Telegram.
export function telegramUrl(startPayload: string) {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) return null;
  return `https://t.me/${username}?start=${encodeURIComponent(startPayload)}`;
}

export function isTelegramEnabled() {
  return Boolean(process.env.TELEGRAM_BOT_USERNAME);
}
