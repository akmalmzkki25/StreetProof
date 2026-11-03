# @streetproof/worker

Node process that works through the Postgres outbox. It turns submitted reports into AI drafts with Muse Spark, outlines the damage with SAM, compares before and after photos for supervisors, and sends reporter emails and Telegram messages. `src/index.ts` maps each job type to its handler. Read [`docs/meta-model-api.md`](../../docs/meta-model-api.md) before changing a model call.

## Run

From the repo root (Postgres and MinIO must be running):

```bash
pnpm --filter @streetproof/worker start   # one run, spends Meta credits per report
pnpm --filter @streetproof/worker dev     # restarts on file changes
pnpm --filter @streetproof/worker test    # fake model, no credits
pnpm --filter @streetproof/worker eval:images   # spends credits, makes the evaluation photos
pnpm --filter @streetproof/worker eval:run      # spends credits, writes py/ai-eval/results/latest.json
```

## Env

Root `.env`: `META_API_KEY` (required), `META_API_BASE_URL`, `META_MODEL`, plus `DATABASE_URL`, the `S3_*` values, `SMTP_URL`, `MAIL_FROM` and `APP_URL` for email, and `TELEGRAM_BOT_TOKEN` for Telegram.

## Rules for this unit

- A draft is a suggestion. The worker never changes ticket status or revision; a failed draft leaves the operator to triage by hand.
- Tests never call Meta. Inject a fake `callModel`. Real calls cost money and are run on purpose, with synthetic data only.
- Report text and text inside photos are untrusted. Keep them as data in the prompt, and keep the checks in `applyDraftPolicy`: references must resolve to real inputs, and the model sees ticket aliases rather than IDs.
- Never add location to the draft, and never send reporter contact or receipt tokens.
- A Telegram message to a reporter says only the collapsed stage. Who is working on a ticket, and why proof was rejected, go to staff only.
- Store error classes, never provider messages or response bodies, because they can echo report content.
- Bump `PROMPT_VERSION` when the prompt changes. One draft row exists per report revision and prompt version.
- Don't run the worker while running database tests: it can claim their jobs.
