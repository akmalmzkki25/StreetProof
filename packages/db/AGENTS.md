# @streetproof/db

Drizzle schema, SQL migrations, the demo seed and the S3 storage client. Postgres and MinIO run in Docker (decision D-11); connection details come from the root `.env`.

## Run

From the repo root:

```bash
pnpm db:generate -- --name <change>   # write a migration from src/schema.ts
pnpm db:migrate                       # apply migrations to DATABASE_URL
pnpm db:seed                          # wipe and reseed synthetic demo data, create the bucket
pnpm db:seed:demo                     # same, plus the demo tickets in docs/demo-scenarios.md
pnpm --filter @streetproof/db test    # constraint and command tests against the seeded database
```

The database tests skip when `DATABASE_URL` is missing (as in CI). Locally they run against the seeded database and delete what they create.

## Ticket commands

`transitionTicket(db, command)` in `src/ticket-commands.ts` is the only way a ticket changes status. In one transaction it locks the ticket row (`FOR UPDATE`), re-runs `checkTransition` from `@streetproof/domain` against the locked row, calls the command's `apply` for side rows and field changes, bumps the revision, and writes one `ticket_events` row and one `outbox` row. A second command racing on the same revision is rejected as `stale_revision`. Never call a model, upload a file or do other slow I/O inside `apply`. `triageTicket`, `assignTicket`, `acceptWork`, `submitCompletion` and `decideCompletion` are built on it. A completion attempt is immutable: a rejection keeps it, and the technician submits a new one.

## Duplicate links

A duplicate is a relationship, not a status. `linkDuplicate` and `unlinkDuplicate` in `src/duplicate-commands.ts` lock both tickets in ID order, re-check `duplicateLinkProblem` from `@streetproof/domain`, and write an event on both tickets. Reports stay on their own ticket, and links are one level deep. Only the source's revision moves. While linked, the source leaves `listQueue`, rejects every transition (`linked_as_duplicate`) and gets no AI draft, and `getReporterStatus` reports the target's progress. A target with active links can't be cancelled (`has_linked_duplicates`). A partial unique index allows one active link per source. Linking closes any open question on the source.

## Clarifications

`requestClarification` moves a ticket to `needs_clarification` and stores the question beside the report, which never changes. `answerClarification` is the only write a reporter receipt can make. It works only while that receipt's own report has this question open and the ticket is still waiting, and every refusal returns the same `unavailable`. It leaves status and revision alone, because an operator reviews first. `resumeAfterClarification` returns the ticket to triage. With an answer it bumps the report revision and queues a new draft; without one it needs a reason. There is no stored clarify scope on the credential: the open question is what grants the write, which is narrower than a flag on the receipt. One open question per ticket, enforced by a partial unique index.

## Dashboard

`getDashboard` reads open tickets of any age plus anything created or changed in the last 30 days, then hands the rows to `computeDashboard` in `@streetproof/domain`, which owns every metric definition. `tenants.is_synthetic` marks demo tenants so their figures are labelled in the UI.

## Report intake

`submitReport(db, input)` in `src/reports.ts` creates the ticket, report, photo rows, first event, outbox row and receipt in one transaction. A retry with the same idempotency key and digest returns the same report, revokes the old receipt and issues a new one, up to the rotation limit; a changed digest is rejected. The raw receipt token is returned once and only its SHA-256 is stored. `getReporterStatus` returns null for any invalid receipt, so callers can't tell why it failed.

## Env

`DATABASE_URL`, `S3_ENDPOINT_URL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, all from the root `.env`. Scripts load it through `scripts/load-root-env.ts`; library code only reads `process.env`.

## Demo accounts

`pnpm db:seed` creates two synthetic tenants. Accounts in the first tenant: `operator@`, `technician@`, `technician2@`, `supervisor@` and `admin@streetproof.test`. The second tenant has `operator@kampus.streetproof.test`. Demo tenants, accounts and the shared local password live in `src/demo.ts`, which the seed and the `/login` demo buttons both read.

## Rules for this unit

- Change `src/schema.ts`, then generate a migration. Never edit an applied migration; add a new one.
- Every tenant-owned table carries `tenant_id`, and child rows point at parents through composite `(tenant_id, id)` foreign keys so a row cannot cross tenants.
- `user`, `session`, `account` and `verification` follow Better Auth's core schema. Keep their column names when changing them.
- The bucket is private. Hand out `signedReadUrl` links, never public object URLs.
