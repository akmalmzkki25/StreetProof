# @streetproof/db

Drizzle schema, SQL migrations, the demo seed and the S3 storage client. Postgres and MinIO run in Docker (decision D-11); connection details come from the root `.env`.

## Run

From the repo root:

```bash
pnpm db:generate -- --name <change>   # write a migration from src/schema.ts
pnpm db:migrate                       # apply migrations to DATABASE_URL
pnpm db:seed                          # wipe and reseed synthetic demo data, create the bucket
pnpm --filter @streetproof/db test    # constraint tests against the seeded database
```

The constraint tests skip when `DATABASE_URL` is missing (as in CI) and run inside rolled-back transactions locally.

## Env

`DATABASE_URL`, `S3_ENDPOINT_URL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, all from the root `.env`. Scripts load it through `scripts/load-root-env.ts`; library code only reads `process.env`.

## Demo accounts

`pnpm db:seed` creates two synthetic tenants. Accounts in the first tenant: `operator@`, `technician@`, `technician2@`, `supervisor@` and `admin@streetproof.test`. The second tenant has `operator@kampus.streetproof.test`. The shared local password is in `scripts/seed.ts`.

## Rules for this unit

- Change `src/schema.ts`, then generate a migration. Never edit an applied migration; add a new one.
- Every tenant-owned table carries `tenant_id`, and child rows point at parents through composite `(tenant_id, id)` foreign keys so a row cannot cross tenants.
- `user`, `session`, `account` and `verification` follow Better Auth's core schema. Keep their column names when changing them.
- The bucket is private. Hand out `signedReadUrl` links, never public object URLs.
