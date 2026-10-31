# Deployment

`compose.production.yaml` runs the whole product on one host: PostgreSQL, MinIO, the web app, the worker and a backup loop. A one-shot `prepare` service applies migrations and creates the bucket on every start.

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

   It prints the reporter status links, which are shown only once. It also queues two real drafts, their damage outlines and two proof comparisons, so the worker spends about $0.05 of model credits straight away.

`GET /api/health` answers `{"ok":true}` when the web app can reach the database. The image's health check uses it.

Both the web app and the worker need `META_API_KEY`: the worker for drafts, outlines and comparisons, the web app for voice notes.

## What needs a public address

- `APP_URL`: the address people open. Sign-in cookies are secure only when it is `https`.
- `S3_PUBLIC_ENDPOINT_URL`: where browsers load photos from, so MinIO's port 9000 needs its own domain or open port. The bucket stays private. Only short-lived signed URLs work, and they are signed for this address, so changing it needs a restart of `web`.

Keep PostgreSQL off the public internet. The compose file publishes no port for it.

## Security headers

`apps/web/src/proxy.ts` adds them at request time. Its content security policy allows images only from this app and `S3_PUBLIC_ENDPOINT_URL`, so a wrong value shows up as photos that don't load. Inline scripts stay allowed, because Next.js can't put a nonce in a prerendered shell, so the policy doesn't stop an injected inline script.

The app also sends `Strict-Transport-Security` for a year, without `includeSubDomains`. Once a browser opens the app over `https`, it refuses plain `http` on that domain until the year runs out.

## Behind a proxy that routes by domain

On Coolify or similar, use the Docker Compose build pack with `compose.production.yaml`, and route one domain to `web:3000` and another to `minio:9000`. Set the variables above in the platform's environment settings. Host port mappings can stay, or be removed if they clash with something else on the server.

## Sizing

The first build took over 10 minutes on a desktop, mostly downloads. Later builds reuse that layer until `pnpm-lock.yaml` changes. The plan warns that 512 MB isn't enough for builds or photo decoding, so allow at least 2 GB of memory.

## Check a deployment

Run the end-to-end tests against it. They need the base seed, not the demo one, and they create tickets, so don't aim them at a tenant you care about:

```bash
E2E_BASE_URL=https://your-domain pnpm test:e2e
```

## Email

Set `SMTP_URL` and `MAIL_FROM` to send status notices, receipts, recovered status links and password resets. With either one empty, nothing is sent: the password and link recovery pages say so and point people to their admin or building team, and the worker closes notification jobs without sending.

Emails have only been tested against Mailpit, so send one through the real provider before relying on it.

## Monitoring

Set `MONITORING_TOKEN`, then call:

```bash
curl -H "Authorization: Bearer $MONITORING_TOKEN" https://your-domain/api/monitoring
```

It answers with database and storage reachability, the worker's last heartbeat, and job counts. A missing or wrong token gets a 404, and so does every request when the variable is unset. Nothing polls it yet, so point an uptime checker at it. The web app and worker write one JSON line per event to stdout.

## Backups

The `backup` service dumps PostgreSQL and archives the photo files on a loop, into the `backups` volume. It sits on the same host as the data, so a lost host loses both: copy that volume somewhere else on a schedule.

To restore a backup, stop the app and MinIO first, because this replaces the database and the photos:

```bash
docker compose -f compose.production.yaml --env-file .env.production stop web worker minio
docker compose -f compose.production.yaml --env-file .env.production --profile restore run --rm restore <stamp>
docker compose -f compose.production.yaml --env-file .env.production up -d web worker minio
```

`<stamp>` is the name of a finished backup; run the restore without it to list them. A drill on the local stack brought back the tickets and a photo that loaded in the browser.

## Not covered yet

A security review of the proxy setup. Demo accounts share a password in the repository, so only synthetic data belongs on a public demo.
