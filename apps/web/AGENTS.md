# @streetproof/web

Next.js App Router UI and `/api/v1` for StreetProof. Dark-default theme and components come from `@streetproof/ui`.

## Run

From the repo root:

```bash
pnpm --filter @streetproof/web dev
pnpm --filter @streetproof/web build
pnpm --filter @streetproof/web typecheck
pnpm --filter @streetproof/web lint
pnpm --filter @streetproof/web test
```

Dev server defaults to http://localhost:3000. Design system live showcase: `/design-system`.

## Env

Uses root `.env` / `.env.example`. No web-only vars yet beyond the shared `APP_URL` and `AUTH_SECRET`. Database and storage access go through `@streetproof/db`.

## Rules for this unit

- Import UI from `@streetproof/ui/components/*`, not local copies of shadcn primitives.
- Tokens live in `packages/ui/src/styles/globals.css`. When they change, update root `design.md` in the same change.
- Keep the Next.js managed agent-rules block below. `next dev` rewrites only that block.
- Prefer App Router Server Components. Mark client boundaries only for theme, menus, and interactive controls.
- Read version-matched docs under `node_modules/next/dist/docs/` before using unfamiliar Next.js APIs (this app is on Next.js 16.4 with Cache Components and Partial Prefetching enabled).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
