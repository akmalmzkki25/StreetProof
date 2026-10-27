# StreetProof

StreetProof turns facility damage reports into assigned repair work with completion evidence and supervisor-controlled closure. AI drafts and flags missing context; operators, technicians and supervisors keep the decisions.

Built for the [Meta Global AI Developer Hackathon](https://cerebralvalley.ai/e/meta-ai-developer-hackathon); submissions are due Nov 4, 9:00 PM ET. See [`docs/hackathon.md`](docs/hackathon.md).

**Status:** planning. No application code yet. The planning package is in [`plan/`](plan/) in English and Indonesian; start with the [project charter](plan/en/00-foundation/project-charter.md) ([ID](plan/id/00-foundation/project-charter.md)).

## Repository layout

This is a monorepo: the web app, API, worker, shared packages, Python evaluation, database migrations, docs and the plan all live here.

| Path                 | Contents                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `plan/en`, `plan/id` | Research, business model, product requirements, technical design, delivery and marketing plans |
| `apps/`              | Deployable apps (planned: Next.js web, Node worker)                                            |
| `packages/`          | Shared TypeScript packages                                                                     |
| `py/`                | Python packages for AI evaluation and experiments                                              |
| `supabase/`          | Database migrations and Supabase config (once added)                                           |
| `docs/hackathon.md`  | Hackathon reference: dates, tracks, models, rules                                              |
| `docs/adr/`          | Accepted architecture decisions                                                                |
| `.agents/skills/`    | Skills for coding agents working on this repo                                                  |

## Getting started

Requires Node 22, pnpm 12, Python 3.12 and [uv](https://docs.astral.sh/uv/).

```bash
pnpm install
uv sync
cp .env.example .env
```

Common tasks run from the root: `pnpm dev`, `pnpm build`, `pnpm test`, `uv run pytest`, `uv run ruff check .`

## Working with coding agents

[`AGENTS.md`](AGENTS.md) holds the working rules and the skill index; `CLAUDE.md` imports it. New apps and packages are created with the [`streetproof-scaffold`](.agents/skills/streetproof-scaffold/SKILL.md) skill so each one ships with its own `AGENTS.md`, `CLAUDE.md` and tests.

## Data

This repository is private, but it may be cloned, shared with collaborators or made public later, so it holds synthetic or permissioned example data only: no real reports, photos, personal data or credentials.
