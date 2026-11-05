# StreetProof

StreetProof turns facility damage reports into assigned repair work that only closes with photo proof. A tenant reports damage from a QR code without an account; operators triage it, technicians fix it and submit proof, and a supervisor verifies it. Meta's models draft, outline and compare along the way; people keep every decision.

Built for the [Meta Global AI Developer Hackathon](https://cerebralvalley.ai/e/meta-ai-developer-hackathon) (theme: Build for Your World). See [`docs/hackathon.md`](docs/hackathon.md).

- **Live demo:** https://streetproof.halmahera.site (synthetic data only)
- **Demo accounts:** `admin@`, `operator@`, `technician@`, `technician2@` and `supervisor@streetproof.test`, password `streetproof-demo`
- **Report form for the demo building:** https://streetproof.halmahera.site/en/report/graha-tower-a

## How it works

| Who                 | What they do                                                                                                                         | Where Meta's models help                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant (no account) | Scans the building's QR code, picks a location, describes the damage by text or voice, adds a photo, and keeps a private status link | **Muse Voice Transcribe** turns the voice note into text the tenant checks before sending                                                                          |
| Operator            | Works the queue: confirms triage, asks the reporter for missing details, links duplicates, assigns a technician with a deadline      | **Muse Spark** drafts the summary, category, priority, the reason and missing context, and lists possible duplicates; **SAM 3.1** outlines the damage on the photo |
| Technician          | Accepts the job, reports blockers, submits a checklist and after photos, in the browser or on Telegram                               | none                                                                                                                                                               |
| Supervisor          | Verifies the proof or sends it back with a written reason                                                                            | **Muse Spark** compares the before and after photos: same place or not, problem still visible or not, what the proof does not show                                 |
| Admin               | Manages buildings, locations, members, QR posters and per-site time zones (WIB, WITA, WIT); reads the dashboard and audit log        | none                                                                                                                                                               |

Every model output is labelled "Not verified". The worker that calls the models never changes a ticket's status, a failed draft leaves manual triage working, and only a supervisor with a photo can close work. Details in [`docs/meta-model-api.md`](docs/meta-model-api.md).

Also included: a Telegram bot for tenants, technicians and supervisors, deadline reminders and escalation, CSV export of the queue, English and Indonesian, rate limits, data retention and off-site backups.

## Repository layout

This is a monorepo: the web app, worker, Telegram bot, shared packages, Python evaluation, database migrations, docs and the plan all live here.

| Path                     | Contents                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `apps/`                  | Deployable apps (`web`, `worker`, `telegram-bot`)                                              |
| `packages/`              | Shared TypeScript packages (`ui`, `domain`, `db`, `contracts`, `media`)                        |
| `py/`                    | Python packages for AI evaluation and experiments                                              |
| `plan/en`, `plan/id`     | Research, business model, product requirements, technical design, delivery and marketing plans |
| `docs/hackathon.md`      | Hackathon reference: dates, tracks, models, rules                                              |
| `docs/meta-model-api.md` | Meta models and endpoints we consume, mapped to the plan                                       |
| `docs/deployment.md`     | Running the product from Docker images, backups, monitoring                                    |
| `docs/adr/`              | Accepted architecture decisions                                                                |
| `.agents/skills/`        | Skills for coding agents working on this repo                                                  |

Stack: Next.js (App Router), a Node worker on a Postgres outbox, a grammY Telegram bot, PostgreSQL, S3-compatible storage (MinIO locally, Cloudflare R2 in the live demo), Docker Compose deployed with Coolify.

## Getting started

Requires Node 22, pnpm 12, Docker, Python 3.12 and [uv](https://docs.astral.sh/uv/).

```bash
pnpm install
uv sync
cp .env.example .env   # one .env for the whole monorepo; fill in the Docker credentials and META_API_KEY
pnpm db:migrate        # Postgres in Docker
pnpm db:seed           # synthetic tenants, demo accounts, private MinIO bucket
pnpm db:seed:demo      # same, plus the demo tickets in docs/demo-scenarios.md
pnpm db:setup          # or instead: your own organisation, building and first admin
```

Common tasks run from the root: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, `uv run pytest`, `uv run ruff check .`

```bash
pnpm --filter @streetproof/web dev            # http://localhost:3000, design system at /design-system
pnpm --filter @streetproof/worker dev         # Meta model jobs; spends credits per report
pnpm --filter @streetproof/telegram-bot dev   # needs TELEGRAM_BOT_TOKEN, see docs/deployment.md
```

To run the whole product from Docker images, see [docs/deployment.md](docs/deployment.md).

## Working with coding agents

[`AGENTS.md`](AGENTS.md) holds the working rules and the skill index; `CLAUDE.md` imports it. New apps and packages are created with the [`streetproof-scaffold`](.agents/skills/streetproof-scaffold/SKILL.md) skill so each one ships with its own `AGENTS.md`, `CLAUDE.md` and tests.

## Data

The repository holds synthetic or permissioned example data only: no real reports, photos, personal data or credentials. The demo accounts share a password on purpose, so the live demo carries synthetic data only.
