---
name: streetproof-scaffold
description: Add a new deployable app, shared TypeScript package, or Python package to the StreetProof monorepo with the files every unit must carry (package manifest, tsconfig or pyproject, AGENTS.md, CLAUDE.md, README, test setup). Use when creating anything under apps/, packages/, or py/, or when the user asks to bootstrap the web app, the worker, or an AI evaluation package.
---

# StreetProof scaffold

StreetProof is one repository with two toolchains:

- **JavaScript/TypeScript**: pnpm workspaces + Turborepo. Units live in `apps/*` (deployable) and `packages/*` (shared, not deployed on their own).
- **Python**: a uv workspace. Units live in `py/*`. Python is for AI evaluation, experiments and data scripts, not a second API runtime (ADR-001 / D-05 in `plan/`).

Before scaffolding, read `AGENTS.md` at the repo root and the ADRs in `plan/en/04-technical/architecture-decisions.md`. If the requested unit contradicts an ADR (for example a FastAPI service for the main API), say so and ask before building it.

## Every unit gets

| File | Content |
|---|---|
| `AGENTS.md` | What this unit does, how to run it, its env vars, and rules that apply only here |
| `CLAUDE.md` | Exactly `@AGENTS.md` |
| `README.md` | One paragraph for humans, plus the run command |
| Tests | At least one passing test so `pnpm test` / `uv run pytest` exercises the unit |

Add any new env var to the root `.env.example` with an empty value and a one-line comment. Never commit a real value.

## JavaScript app or package

Names are scoped: `@streetproof/<name>`. Use the CLI that generates the framework's own boilerplate rather than hand-writing it, then trim:

```bash
# Next.js app (web UI + /api/v1)
pnpm create next-app@latest apps/web --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-pnpm --skip-install

# Plain TS package or Node worker: create the folder by hand
mkdir -p packages/<name>/src
```

Then for each unit:

1. Set `"name": "@streetproof/<name>"` and `"private": true` in its `package.json`.
2. Provide the scripts Turborepo expects, only the ones that apply: `dev`, `build`, `typecheck` (`tsc --noEmit`), `lint`, `test` (Vitest).
3. Extend the shared config: `tsconfig.json` with `"extends": "../../tsconfig.base.json"`.
4. Depend on internal packages with `"@streetproof/<dep>": "workspace:*"`.
5. Run `pnpm install` **from the repo root**, never with `--filter` (a filtered install prunes other units' dependencies).
6. If the unit needs a new Turborepo task or outputs, add it to `turbo.json` (see the `turborepo` skill).
7. Verify: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

Node entry points that run with `node --experimental-strip-types` (or Node 22's type stripping) cannot use enums, namespaces or constructor parameter properties. Boot the entry point once with `node` after building; Vitest alone will not catch this.

Suggested first units, matching the high-level design in `plan/`:

- `apps/web`: Next.js App Router, Supabase SSR auth, `/api/v1` Route Handlers.
- `apps/worker`: Node process that claims outbox jobs and calls the AI adapter.
- `packages/domain`: ticket state machine, permissions, pure functions, no I/O.
- `packages/db`: generated types and the data-access layer. SQL migrations stay in the root `supabase/migrations` folder, where the Supabase CLI expects them.
- `packages/contracts`: request/response schemas (Zod) shared by web and worker.

## Python package

```bash
uv init --package --name streetproof-<name> py/<name>
```

Then:

1. Keep `requires-python = ">=3.12"`. Ruff and pytest settings are inherited from the root `pyproject.toml`; don't duplicate them.
2. Put tests in `py/<name>/tests/` and code in `py/<name>/src/streetproof_<name>/`.
3. Add runtime dependencies with `uv add --package streetproof-<name> <dep>`; dev tools stay in the root `dev` group.
4. Run `uv sync` from the root, then `uv run ruff check . && uv run ruff format --check . && uv run pytest`.
5. Commit `uv.lock`.

Suggested first unit: `py/ai-eval`, the offline evaluation harness from `plan/en/04-technical/ai-pipeline-and-evaluation.md`, run against synthetic or permissioned fixtures only.

## Finish

- Add the unit to the structure list in the root `AGENTS.md` if it introduces a new kind of folder.
- Update `README.md` at the root if the run instructions changed.
- Commit with `feat: scaffold <unit>`; push only when the owner says so.
