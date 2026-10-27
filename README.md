# StreetProof

StreetProof turns facility damage reports into assigned repair work with completion evidence and supervisor-controlled closure. AI drafts and flags missing context; operators, technicians and supervisors keep the decisions.

**Status:** planning. No application code yet. The planning package is in [`plan/`](plan/) in English and Indonesian; start with the [project charter](plan/en/00-foundation/project-charter.md) ([ID](plan/id/00-foundation/project-charter.md)).

## Repository layout

| Path                 | Contents                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `plan/en`, `plan/id` | Research, business model, product requirements, technical design, delivery and marketing plans |
| `apps/`              | Deployable apps (planned: Next.js web, Node worker)                                            |
| `packages/`          | Shared TypeScript packages                                                                     |
| `py/`                | Python packages for AI evaluation and experiments                                              |
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

This repository is public. It holds synthetic or permissioned example data only: no real reports, photos, personal data or credentials.
