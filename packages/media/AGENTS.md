# @streetproof/media

Photo and voice handling shared by every way in: the web forms and the Telegram bot. `photos` and `wav` are safe in a browser bundle; `photo-sanitize` needs `sharp` and `transcribe` calls Meta, so both stay on the server.

## Run

```bash
pnpm --filter @streetproof/media test   # fake model, no credits
```

## Env

None. Callers pass the Meta key and address to `transcribeWav`.

## Rules for this unit

- Every stored photo goes through `sanitizePhoto`, so only pixels survive.
- Tests never call Meta. Inject `fetchImpl`.
- Audio is sent once and never stored.
