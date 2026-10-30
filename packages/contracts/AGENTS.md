# @streetproof/contracts

Schemas shared across units. Today that's the AI intake draft: the worker sends its JSON Schema to Meta and validates replies with it, and the web app parses stored drafts with it.

## Run

```bash
pnpm --filter @streetproof/contracts test
```

## Rules for this unit

- `intakeDraftSchema` follows the draft schema in `plan/en/04-technical/api-and-event-contracts.md`. Change both together, plus the Indonesian twin.
- Keep the schema inside Meta's strict subset; a test enforces it. Don't add `min`, `max`, `oneOf` or `allOf`.
- Never add a location field. Location comes only from the reporter.
- Bump `DRAFT_SCHEMA_VERSION` when the shape changes.
