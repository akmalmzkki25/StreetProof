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

Uses the root `.env`; `next.config.ts` loads it with `process.loadEnvFile`. Web reads `APP_URL`, `AUTH_SECRET` and `SHOW_DEMO_LOGINS` (set `true` to show one-click demo accounts on `/login`; `/login` is prerendered, so this is read at build time). Database and storage access go through `@streetproof/db`.

## Auth

- Better Auth with email and password, Drizzle adapter, `nextCookies` plugin. Config in `src/lib/auth.ts`; the instance is created on first request, so `next build` needs no database. Self sign-up is off; accounts come from the seed or a tenant admin.
- `src/lib/member.ts` is the data access layer. Pages and actions call `requireMember()` or `requireRole(role)`; never read the session or memberships anywhere else. `requireRole` answers 404 for the wrong role so pages don't reveal what exists.
- With Cache Components, anything that reads the session sits inside `<Suspense>`. Keep the page shell static and push the session read into a child component (see `src/app/app/page.tsx`).
- Ticket state changes go through `transitionTicket` from `@streetproof/db` or a command built on it, never a direct `update tickets`. Actions also confirm the ticket is in the member's site scope, because the command only checks the tenant.

## Routes

- `/report/[code]`: public report form for one site, no account. Photos are checked by their bytes, then stored before the database transaction.
- `/status`: reporter status. The receipt arrives in the URL fragment (`#t=`), then moves into an HttpOnly cookie scoped to `/status`, and the fragment is removed. Every failure shows the same generic message.
- `/app/queue`, `/app/tickets/[id]`: operator queue, triage, assignment and cancellation. Other roles get 404.

Testing in the desktop app's browser pane: a hidden pane stalls client navigation, so bring it to the front before concluding a click did nothing.

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
