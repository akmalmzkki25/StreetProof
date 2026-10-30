# @streetproof/db

Drizzle schema, SQL migrations, the demo seed and the S3 storage client. Postgres and MinIO run in Docker (decision D-11); connection details come from the root `.env`.

## Run

From the repo root:

```bash
pnpm db:generate -- --name <change>   # write a migration from src/schema.ts
pnpm db:migrate                       # apply migrations to DATABASE_URL
pnpm db:seed                          # wipe and reseed synthetic demo data, create the bucket
pnpm --filter @streetproof/db test    # constraint and command tests against the seeded database
```

The database tests skip when `DATABASE_URL` is missing (as in CI). Locally they run against the seeded database and delete what they create.

## Ticket commands

`transitionTicket(db, command)` in `src/ticket-commands.ts` is the only way a ticket changes status. In one transaction it locks the ticket row (`FOR UPDATE`), re-runs `checkTransition` from `@streetproof/domain` against the locked row, calls the command's `apply` for side rows and field changes, bumps the revision, and writes one `ticket_events` row and one `outbox` row. A second command racing on the same revision is rejected as `stale_revision`. Never call a model, upload a file or do other slow I/O inside `apply`.

## Env

`DATABASE_URL`, `S3_ENDPOINT_URL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, all from the root `.env`. Scripts load it through `scripts/load-root-env.ts`; library code only reads `process.env`.

## Demo accounts

`pnpm db:seed` creates two synthetic tenants. Accounts in the first tenant: `operator@`, `technician@`, `technician2@`, `supervisor@` and `admin@streetproof.test`. The second tenant has `operator@kampus.streetproof.test`. Demo tenants, accounts and the shared local password live in `src/demo.ts`, which the seed and the `/login` demo buttons both read.

## Rules for this unit

- Change `src/schema.ts`, then generate a migration. Never edit an applied migration; add a new one.
- Every tenant-owned table carries `tenant_id`, and child rows point at parents through composite `(tenant_id, id)` foreign keys so a row cannot cross tenants.
- `user`, `session`, `account` and `verification` follow Better Auth's core schema. Keep their column names when changing them.
- The bucket is private. Hand out `signedReadUrl` links, never public object URLs.
