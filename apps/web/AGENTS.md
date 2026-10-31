# @streetproof/web

Next.js App Router UI and Server Actions for StreetProof. Dark-default theme and components come from `@streetproof/ui`.

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

Uses the root `.env`; `next.config.ts` loads it with `process.loadEnvFile`. Web reads `APP_URL`, `AUTH_SECRET`, `SMTP_URL` and `MAIL_FROM` (email stays off without them), `MONITORING_TOKEN` (`/api/monitoring` answers 404 without it) and `META_API_KEY` (voice notes only). One-click demo accounts appear on `/login` only under `next dev`, never in a production build. Database and storage access go through `@streetproof/db`.

## Auth

- Better Auth with email and password, Drizzle adapter, `nextCookies` plugin. Config in `src/lib/auth.ts`; the instance is created on first request, so `next build` needs no database. Self sign-up is off; accounts come from the seed or a tenant admin.
- `src/lib/member.ts` is the data access layer. Pages and actions call `requireMember()` or `requireRole(role)`; never read the session or memberships anywhere else. `requireRole` answers 404 for the wrong role so pages don't reveal what exists.
- With Cache Components, anything that reads the session sits inside `<Suspense>`. Keep the page shell static and push the session read into a child component (see `src/app/app/page.tsx`).
- Ticket state changes go through `transitionTicket` from `@streetproof/db` or a command built on it, never a direct `update tickets`. Actions also confirm the ticket is in the member's site scope, because the command only checks the tenant.

## Language

The interface is English and Indonesian. The locale comes from the `streetproof_locale` cookie, then a browser whose first language is Indonesian, then English.

- Wrap every sentence in `t()`, from `getI18n()` on the server or `useI18n()` in a client component. The English sentence is the key. Action errors stay English in the action and are translated where they're displayed.
- Add the Indonesian to `src/lib/i18n/messages-id.ts`, or `messages-id-errors.ts` for an action error. `messages.test.ts` scans the source and fails on a sentence without one.
- Page `<title>`s, the home illustration and `/design-system` stay English.

## Routes

- `/`: public home. Its "Try the report form" button points at the seeded synthetic site, so replace `DEMO_INTAKE_CODE` before real data.
- `/app/*`: shares the floating navbar in `app/app/layout.tsx`. `navLinksFor` decides its links from the member's roles. Panels use `components/panel.tsx`.
- `/report/[code]`: public report form for one site, no account. Photos are checked by their bytes, re-encoded by `sanitizePhoto` so no metadata or hidden data survives, then stored before the database transaction. Completion proof takes the same path.
- `/status`: reporter status. The receipt arrives in the URL fragment (`#t=`), then moves into an HttpOnly cookie scoped to `/status`, and the fragment is removed. Every failure shows the same generic message.
- `/status/recover`: a reporter who left an email asks for new status links. The answer is the same whether or not a report matches.
- `/forgot-password`, `/reset-password`: password reset by email.
- `/app/members`, `/app/audit`: member and team management and the audit log, tenant admins only.
- `/api/monitoring`: health details for an uptime checker, behind `MONITORING_TOKEN`.
- `/app/queue`: operator queue, operators only.
- `/app/work`: a technician's assigned work.
- `/app/reviews`: a supervisor's pending verifications and closed work.
- `/app/dashboard`: backlog, age, owners and outcomes, for everyone except technicians. Figures come from `computeDashboard` in `@streetproof/domain`, so definitions live in one tested place. A rate shows numerator, denominator and pending, never a bare percentage, and a missing value is a dash, not a zero.
- `/app/tickets/[id]`: one page for every role. Forms come from `availableTransitions`, so each person sees only what they may do. Technicians can open only work currently assigned to them (`canViewTicket`). Operators and supervisors link or unlink duplicates here. An AI duplicate candidate only prefills the form; a person submits the link. Operators ask the reporter a question here too; the reporter answers on `/status`, and the queue marks the ticket until an operator reviews the answer.

End-to-end tests live in `e2e/` and run with `pnpm test:e2e` from the repo root. Each run makes a production build on port 3100 and resets its own `streetproof_e2e` database, so it can't touch demo data, a dev server or a worker. The first run on a machine needs `pnpm --filter @streetproof/web exec playwright install chromium`. It needs Postgres and MinIO running, and it never calls the model. Use `visibleText` from `e2e/helpers.ts` for text lookups: while a page streams, React briefly holds a hidden copy of its content.

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
