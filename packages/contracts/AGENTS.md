# @streetproof/contracts

Schemas shared across units. Today that's the AI intake draft and the AI proof check: the worker sends their JSON Schema to Meta and validates replies with it, and the web app parses what's stored with it.

## Run

```bash
pnpm --filter @streetproof/contracts test
```

## Rules for this unit

- `intakeDraftSchema` and `proofCheckSchema` follow `plan/en/04-technical/api-and-event-contracts.md`. Change both together, plus the Indonesian twin.
- `proofCheckSchema` never gets a field that says a repair is done or should be accepted (D-12).
- Keep the schema inside Meta's strict subset; a test enforces it. Don't add `min`, `max`, `oneOf` or `allOf`.
- Never add a location field. Location comes only from the reporter. `damagePhrase` names what is damaged, never where.
- Bump `DRAFT_SCHEMA_VERSION` when the shape changes.
