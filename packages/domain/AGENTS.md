# @streetproof/domain

Pure ticket rules: work statuses, roles, the transition table and the guard that checks one transition. No I/O, no database, no framework imports. Web and worker call `checkTransition` before writing anything.

## Run

```bash
pnpm --filter @streetproof/domain test
pnpm --filter @streetproof/domain typecheck
```

## Rules for this unit

- `TRANSITIONS` mirrors the guard table in `plan/en/04-technical/state-machine-and-permissions.md`. Change both together, and the Indonesian twin of that plan page.
- `verified_closed` is reachable only from `completion_submitted` by a supervisor. A test pins this; don't loosen it.
- A supervisor can't decide on an attempt they submitted themselves (`independent_review`). This only matters for someone holding both roles.
- Keep it dependency-free so it can run anywhere, including tests and the worker.
