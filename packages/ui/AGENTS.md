# @streetproof/ui

Shared shadcn/ui (Base UI + Luma) components and design tokens for StreetProof. Icons are Hugeicons. Dark is the source scheme; light is derived. CSS and restyled variants follow the Halmahera design language documented in the repo-root `design.md`.

## Run

From the repo root:

```bash
pnpm --filter @streetproof/ui typecheck
pnpm --filter @streetproof/ui test
```

Add or update components with the project runner:

```bash
pnpm dlx shadcn@latest add <component> --cwd packages/ui
```

## Structure

- `src/styles/globals.css` + `typeset.css` — tokens, type scale, motion
- `src/components/*` — shadcn primitives restyled to DESIGN.md
- `src/lib/utils.ts` — `cn()` with type-scale conflict groups
- `components.json` — style `base-luma`, icon library `hugeicons`

## Rules for this unit

- Prefer semantic tokens (`bg-card`, `text-brand-text`) over raw colors.
- Keep pill controls and 12px panels. Do not introduce drop shadows on flat panels.
- After changing tokens, update root `design.md` in the same change.
- Consumers import via package exports: `@streetproof/ui/components/button`, `@streetproof/ui/globals.css`.
