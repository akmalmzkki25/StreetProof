# Working in this repo

Notes for agents (Claude Code, Codex and the like) working on StreetProof.
These are working agreements. The product plan and architecture live in
`plan/` (EN and ID versions), not here.

## Repo status

What exists: the planning package in `plan/`, a JavaScript (pnpm + Turborepo)
and Python (uv) monorepo skeleton, agent skills in `.agents/skills/`, plus the
first app units `apps/web` (Next.js) and `packages/ui` (shared design system).
`py/` stays empty until evaluation work starts; further packages follow the
scaffold skill as the spike needs them.

Proposed technical direction (see `plan/en/04-technical/architecture-decisions.md`):

- **Next.js + TypeScript** for the UI and `/api/v1` (modular monolith).
- **A separate Node worker** for slow jobs (AI, media), fed by an outbox in PostgreSQL.
- **PostgreSQL and MinIO in Docker** (D-11, superseding ADR-002): Drizzle ORM
  schema and SQL migrations in `packages/db`, report and completion photos in a
  private S3-compatible bucket, authentication inside the app.
- **Python** only for work that is genuinely Python-shaped: AI evaluation,
  model experiments, data scripts. Not a second API runtime (ADR-001, D-05).

Every ADR in `plan/` is still _proposed_. If your work contradicts one, say so
explicitly instead of silently overriding it.

## Hackathon

StreetProof is being built for the Meta Global AI Developer Hackathon. The
event page is the reference for dates, tracks, themes, allowed models and
submission rules; [`docs/hackathon.md`](docs/hackathon.md) summarizes it and
lists what it means for this project. Submissions are due **Nov 4, 9:00 PM
ET (Nov 5, 9:00 AM WIB)**. Scope every task against that deadline: the target
is one working report-to-`verified_closed` flow built on Meta's models, using
synthetic data. Before touching AI code, read
[`docs/meta-model-api.md`](docs/meta-model-api.md): which Meta models to use or
avoid, the request shape, and how errors map to the plan's AI states.

## Standing rules

1. **Everything lives in this monorepo.** Frontend, API, worker, shared
   packages, Python evaluation, database migrations, infrastructure config,
   docs and the plan all go in this repository. Don't create separate repos
   or split services out; add a new unit under `apps/`, `packages/` or `py/`
   with the `streetproof-scaffold` skill instead.
2. **Edit files directly.** Don't wrap changes in Python or shell scripts that
   rewrite files. The diff should show the code change, not a script change.
3. **No multi-agent work unless asked.** No subagents, Workflows, or skills
   that hand tasks to other agents. If a task seems to need that, ask first.
4. **Push only when told.** Committing per step is fine; `git push` waits for
   an explicit instruction from the repo owner.
5. **Every service has its own `AGENTS.md` and `CLAUDE.md`** in its folder
   (`apps/*`, `packages/*`, `py/*`). `CLAUDE.md` contains only `@AGENTS.md`.
   A new service gets both from the start; follow the `streetproof-scaffold` skill.
6. **Write in English.** Repo docs, `AGENTS.md`/`CLAUDE.md` files, code
   comments, commit messages and PR text are in English. The one exception is
   `plan/id/`, the Indonesian twin of the plan.
7. **Keep the bilingual plan in sync.** Changing `plan/en/...` means changing
   the matching `plan/id/...` in the same commit, and vice versa. New
   decisions go in `plan/*/00-foundation/decision-register.md`.
8. **No real data in the repo.** The repo is private, but it can be cloned,
   shared with collaborators or made public later. Report photos, reporter
   names, phone numbers and tenant data must be synthetic. Secrets live only
   in `.env` (git-ignored); `.env.example` holds variable names only.
9. **One `.env` at the repo root.** Every unit reads the root `.env`; don't
   create per-app or per-package env files. `next.config.ts` and Node scripts
   load it with `process.loadEnvFile`. New variables go in the root
   `.env.example`.
10. **Check the references before you build.** Every task follows `AGENTS.md`,
    `CLAUDE.md`, the unit's own `AGENTS.md` and the matching skill in
    `.agents/skills/`. UI work also follows `design.md`, plus the
    `antislop:antislop-ui` and `taste-skill:design-taste-frontend` skills where
    available; user-facing text also follows `antislop:antislop-copywriting`.
    `design.md` wins when a skill disagrees, for example on pills, Inter and
    Geist Mono, which it chose on purpose.

## Engineering preferences

- Pragmatic over perfect. Solve the problem at hand.
- Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration, and indirection.
- Grow the system in layers. Start from the smallest version that works end-to-end, and add each new capability on top of a product that already works. Never trade a working product for unfinished complexity.
- Keep components modular and concerns clearly separated.
- Minimal abstractions. Extract only when a pattern appears 3+ times.
- Explicit over clever. Prefer clear names over comments. Avoid long comments that explain what the code does.
- Write expressive, readable code in React and backend code. Prefer clear names and explicit control flow over shorthand expressions.
- DRY in data-fetching and shared components. Not in one-off pages.
- No unnecessary files. Only create helpers/utils if used in 2+ places.
- Prefer regular functions over arrow functions. Use arrow functions only when passed as an argument or the functions are defined inside a component.
- Keep comments short and limited to intent that clear code cannot express.
- Keep values in the narrowest scope that uses them. Promote a value to a module constant only when it is shared, configurable, or a stable domain concept.

## Layout

```
.agents/skills/   agent skills for this stack (see the index below)
apps/             deployable apps (Next.js web, Node worker)
packages/         shared TypeScript packages (domain, contracts, db, ui, config)
py/               Python packages (AI evaluation, experiments, data scripts)
plan/en, plan/id  planning package, two languages
docs/hackathon.md hackathon reference (dates, tracks, models, rules)
docs/meta-model-api.md  what we consume from Meta, mapped to the plan
docs/adr/         accepted ADRs (proposed ones are still in plan/)
docs/agents/      config for the to-spec, to-tickets and triage skills
```

## Commands

JavaScript (Node 22, pnpm 12), run from the root:

```bash
pnpm install          # always from the root, never with --filter
pnpm dev              # turbo run dev
pnpm build            # turbo run build
pnpm typecheck
pnpm lint
pnpm test
```

Database and storage (Docker services must be running; see `.env.example`):

```bash
pnpm db:generate      # write a SQL migration from packages/db/src/schema.ts
pnpm db:migrate       # apply migrations to DATABASE_URL
pnpm db:seed          # reset demo data: synthetic tenant, site, users, bucket
```

Python (3.12, uv), also from the root:

```bash
uv sync               # create .venv and install the workspace + dev tools
uv run ruff check .
uv run ruff format .
uv run pytest
```

## Before calling it done

- JS: `pnpm typecheck && pnpm lint && pnpm test`, then `pnpm build` if you
  touched the Next.js app. Some breakage only shows up during prerender.
- Python: `uv run ruff check . && uv run ruff format --check . && uv run pytest`.
- Any change to behavior, names or contracts: `grep` the old names and phrases
  across the repo (including `plan/`) and update stragglers in the same commit.
- Commit messages follow conventional commits (`feat:`, `fix:`, `docs:`, ...).

## Agent skills index

Skills live in `.agents/skills/<name>/SKILL.md`. Codex reads them directly.
Other agents: read the relevant `SKILL.md` before starting, not after the
draft is done.

| Need                                       | Skill                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| Add an app, package or Python package      | `streetproof-scaffold`                                                                  |
| Next.js App Router, RSC, Suspense, caching | `nextjs-app-architecture`, `vercel-react-best-practices`, `vercel-composition-patterns` |
| UI: components, styling, accessibility     | `shadcn`, `tailwind-design-system`, `web-design-guidelines`, `frontend-patterns`        |
| Monorepo, task pipelines, caching          | `turborepo`                                                                             |
| Authentication and sessions                | `better-auth-best-practices`                                                            |
| Schema, migrations, indexes, locking       | `database-migrations`, `supabase-postgres-best-practices` (plain Postgres guidance)     |
| API and service layer                      | `api-design`, `backend-patterns`, `error-handling`                                      |
| Python                                     | `python-patterns`, `python-testing`, `fastapi-patterns`                                 |
| Testing and verification                   | `tdd-workflow`, `e2e-testing`, `verification-loop`                                      |
| Security (auth, input, tenant data)        | `security-review`                                                                       |
| Docker, CI/CD, deployment                  | `docker-patterns`, `deployment-patterns`                                                |
| Research before writing new code           | `search-first`                                                                          |
| Architecture decisions                     | `architecture-decision-records`, `domain-modeling`                                      |
| Specs, tickets, issue triage               | `to-spec`, `to-tickets`, `triage`                                                       |
| Git and PR flow                            | `git-workflow`                                                                          |
| Handing off to another session, onboarding | `handoff`, `codebase-onboarding`                                                        |
| General code standards                     | `coding-standards`                                                                      |

## Agent skills

### Issue tracker

Issues and specs live in this repo's GitHub Issues, via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: glossary at `plan/en/00-foundation/glossary.md`, ADRs in `docs/adr/`. See `docs/agents/domain.md`.
