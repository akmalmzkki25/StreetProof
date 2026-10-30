# Deployment

`compose.production.yaml` runs the whole product on one host: PostgreSQL, MinIO, the web app and the worker. A one-shot `prepare` service applies migrations and creates the bucket on every start.

## Run it

1. Copy `.env.production.example` to a file git ignores, such as `.env.production`, and fill it in. Every value comes from this file. Nothing is baked into an image.
2. Start everything:

   ```bash
   docker compose -f compose.production.yaml --env-file .env.production up -d --build
   ```

3. Load the synthetic demo once. This wipes the database, and it refuses if any tenant isn't synthetic:

   ```bash
   docker compose -f compose.production.yaml --env-file .env.production run --rm demo-seed
   ```

   It prints the reporter status links, which are shown only once. It also queues two real drafts, so the worker spends about $0.02 of model credits straight away.

`GET /api/health` answers `{"ok":true}` when the web app can reach the database. The image's health check uses it.

## What needs a public address

- `APP_URL`: the address people open. Sign-in cookies are secure only when it is `https`.
- `S3_PUBLIC_ENDPOINT_URL`: where browsers load photos from, so MinIO's port 9000 needs its own domain or open port. The bucket stays private. Only short-lived signed URLs work, and they are signed for this address, so changing it needs a restart of `web`.

Keep PostgreSQL off the public internet. The compose file publishes no port for it.

## Behind a proxy that routes by domain

On Coolify or similar, use the Docker Compose build pack with `compose.production.yaml`, and route one domain to `web:3000` and another to `minio:9000`. Set the variables above in the platform's environment settings. Host port mappings can stay, or be removed if they clash with something else on the server.

## Sizing

The first build took over 10 minutes on a desktop, mostly downloads. Later builds reuse that layer until `pnpm-lock.yaml` changes. The plan warns that 512 MB isn't enough for builds or photo decoding, so allow at least 2 GB of memory.

## Check a deployment

Run the end-to-end tests against it. They need the base seed, not the demo one, and they create tickets, so don't aim them at a tenant you care about:

```bash
E2E_BASE_URL=https://your-domain pnpm test:e2e
```

## Not covered yet

Backups and restore practice, monitoring, and a security review of the proxy setup. Demo accounts share a password in the repository, so only synthetic data belongs on a public demo.
