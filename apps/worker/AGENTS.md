# @streetproof/worker

Node process that turns submitted reports into AI drafts. It claims `report.submitted` rows from the Postgres outbox, sends the report and photos to Muse Spark, and stores a draft for the operator. Read [`docs/meta-model-api.md`](../../docs/meta-model-api.md) before changing the model call.

## Run

From the repo root (Postgres and MinIO must be running):

```bash
pnpm --filter @streetproof/worker start   # one run, spends Meta credits per report
pnpm --filter @streetproof/worker dev     # restarts on file changes
pnpm --filter @streetproof/worker test    # fake model, no credits
```

## Env

Root `.env`: `META_API_KEY` (required), `META_API_BASE_URL`, `META_MODEL`, plus `DATABASE_URL` and the `S3_*` values.

## Rules for this unit

- A draft is a suggestion. The worker never changes ticket status or revision; a failed draft leaves the operator to triage by hand.
- Tests never call Meta. Inject a fake `callModel`. Real calls cost money and are run on purpose, with synthetic data only.
- Report text and text inside photos are untrusted. Keep them as data in the prompt, and keep the checks in `applyDraftPolicy`: references must resolve to real inputs, and the model sees ticket aliases rather than IDs.
- Never add location to the draft, and never send reporter contact or receipt tokens.
- Store error classes, never provider messages or response bodies, because they can echo report content.
- Bump `PROMPT_VERSION` when the prompt changes. One draft row exists per report revision and prompt version.
- Don't run the worker while running database tests: it can claim their jobs.
