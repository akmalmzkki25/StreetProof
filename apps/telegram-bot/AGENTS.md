# @streetproof/telegram-bot

Long-polling Telegram bot. Reporters file reports and check status; technicians accept work and send proof; supervisors review and decide. Status messages are sent by `apps/worker`, not from here.

## Run

From the repo root (Postgres and MinIO must be running):

```bash
pnpm --filter @streetproof/telegram-bot start   # exits straight away without a token
pnpm --filter @streetproof/telegram-bot dev
pnpm --filter @streetproof/telegram-bot test    # fake Telegram, no network
```

Only one process can poll a token at a time. Telegram answers a second one with 409.

## Env

Root `.env`: `TELEGRAM_BOT_TOKEN`, `META_API_KEY` and `META_API_BASE_URL` for voice notes, `APP_URL`, `DATABASE_URL` and the `S3_*` values. Web also reads `TELEGRAM_BOT_USERNAME` to build `t.me` links.

## How a chat gets access

- `/start l_<code>`: a one-time code from the web app. It links a staff account, or follows one report when it came from a status page.
- `/start s_<intake code>`: starts a report for that site. The code is the same public one in the site's report link, and grants intake only.

## Rules for this unit

- Private chats only. Every other chat type is ignored.
- Never trust a button. Look up the member from the chat on every action, then go through `getTicketDetail`, `canViewTicket` and the commands in `@streetproof/db`. Buttons carry the revision they were sent with, so a stale one is refused.
- Plain text only, with no `parse_mode`, so report text can't be read as markup. Never put `localhost` in a URL button, because Telegram refuses it. Addresses go in the text.
- A reporter sees the collapsed stage only: never who is working on a ticket, or why it was rejected.
- A transcript is a suggestion. The sender confirms it before it becomes the description (D-13).
- Every photo goes through `sanitizePhoto` before it's stored.
- Log status codes and error classes, never a Telegram address: it contains the token.
- Tests never call Telegram or Meta.
