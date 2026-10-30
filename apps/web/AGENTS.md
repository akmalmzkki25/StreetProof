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

Uses the root `.env`; `next.config.ts` loads it with `process.loadEnvFile`. Web reads `APP_URL` and `AUTH_SECRET`. One-click demo accounts appear on `/login` only under `next dev`, never in a production build. Database and storage access go through `@streetproof/db`.

## Auth

- Better Auth with email and password, Drizzle adapter, `nextCookies` plugin. Config in `src/lib/auth.ts`; the instance is created on first request, so `next build` needs no database. Self sign-up is off; accounts come from the seed or a tenant admin.
- `src/lib/member.ts` is the data access layer. Pages and actions call `requireMember()` or `requireRole(role)`; never read the session or memberships anywhere else. `requireRole` answers 404 for the wrong role so pages don't reveal what exists.
- With Cache Components, anything that reads the session sits inside `<Suspense>`. Keep the page shell static and push the session read into a child component (see `src/app/app/page.tsx`).
- Ticket state changes go through `transitionTicket` from `@streetproof/db` or a command built on it, never a direct `update tickets`. Actions also confirm the ticket is in the member's site scope, because the command only checks the tenant.

## Routes

- `/report/[code]`: public report form for one site, no account. Photos are checked by their bytes, then stored before the database transaction.
- `/status`: reporter status. The receipt arrives in the URL fragment (`#t=`), then moves into an HttpOnly cookie scoped to `/status`, and the fragment is removed. Every failure shows the same generic message.
- `/app/queue`: operator queue, operators only.
- `/app/work`: a technician's assigned work.
- `/app/reviews`: a supervisor's pending verifications and closed work.
- `/app/tickets/[id]`: one page for every role. Forms come from `availableTransitions`, so each person sees only what they may do. Technicians can open only work currently assigned to them (`canViewTicket`). Operators and supervisors link or unlink duplicates here. An AI duplicate candidate only prefills the form; a person submits the link. Operators ask the reporter a question here too; the reporter answers on `/status`, and the queue marks the ticket until an operator reviews the answer.

Testing in the desktop app's browser pane: a hidden pane stalls client navigation and holds streamed content behind its skeleton, so take a screenshot or bring the pane forward before concluding a page is broken.

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
