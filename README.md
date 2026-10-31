# StreetProof

StreetProof turns facility damage reports into assigned repair work with completion evidence and supervisor-controlled closure. AI drafts and flags missing context; operators, technicians and supervisors keep the decisions.

Built for the [Meta Global AI Developer Hackathon](https://cerebralvalley.ai/e/meta-ai-developer-hackathon); submissions are due Nov 4, 9:00 PM ET. See [`docs/hackathon.md`](docs/hackathon.md).

**Status:** hackathon build on synthetic data. The flow from report to verified closure works in English and Indonesian, with Muse Spark drafting suggestions for the operator and comparing proof photos for the supervisor, SAM outlining the damage, and voice notes on the report form. Not ready for real data. The planning package is in [`plan/`](plan/) in English and Indonesian; start with the [project charter](plan/en/00-foundation/project-charter.md) ([ID](plan/id/00-foundation/project-charter.md)).

## Repository layout

This is a monorepo: the web app, API, worker, shared packages, Python evaluation, database migrations, docs and the plan all live here.

| Path                     | Contents                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `plan/en`, `plan/id`     | Research, business model, product requirements, technical design, delivery and marketing plans |
| `apps/`                  | Deployable apps (`web`, `worker`)                                                              |
| `packages/`              | Shared TypeScript packages (`ui`, `domain`, `db`, `contracts`)                                 |
| `py/`                    | Python packages for AI evaluation and experiments                                              |
| `docs/hackathon.md`      | Hackathon reference: dates, tracks, models, rules                                              |
| `docs/meta-model-api.md` | Meta models and endpoints we consume, mapped to the plan                                       |
| `docs/adr/`              | Accepted architecture decisions                                                                |
| `.agents/skills/`        | Skills for coding agents working on this repo                                                  |

## Getting started

Requires Node 22, pnpm 12, Python 3.12 and [uv](https://docs.astral.sh/uv/).

```bash
pnpm install
uv sync
cp .env.example .env   # one .env for the whole monorepo; fill in the Docker credentials
pnpm db:migrate        # Postgres in Docker
pnpm db:seed           # synthetic tenants, demo accounts, private MinIO bucket
pnpm db:seed:demo      # same, plus the demo tickets in docs/demo-scenarios.md
```

Common tasks run from the root: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, `uv run pytest`, `uv run ruff check .`

```bash
pnpm --filter @streetproof/web dev   # http://localhost:3000 — design system at /design-system
```

To run the whole product from Docker images, see [docs/deployment.md](docs/deployment.md).

## Working with coding agents

[`AGENTS.md`](AGENTS.md) holds the working rules and the skill index; `CLAUDE.md` imports it. New apps and packages are created with the [`streetproof-scaffold`](.agents/skills/streetproof-scaffold/SKILL.md) skill so each one ships with its own `AGENTS.md`, `CLAUDE.md` and tests.

## Data

This repository is private, but it may be cloned, shared with collaborators or made public later, so it holds synthetic or permissioned example data only: no real reports, photos, personal data or credentials.
