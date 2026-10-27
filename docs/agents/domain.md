# Domain Docs

How the engineering skills (`to-spec`, `to-tickets`, `triage`, `domain-modeling`) should consume this repo's domain documentation.

## Before exploring, read these

- **Glossary**: `plan/en/00-foundation/glossary.md` (Indonesian twin: `plan/id/00-foundation/glossary.md`). This repo is single-context; there is no root `GLOSSARY.md` or `GLOSSARY-MAP.md`.
- **Proposed decisions**: `plan/en/04-technical/architecture-decisions.md` (ADR-001 to ADR-008) and `plan/en/00-foundation/decision-register.md` (D-01 onward).
- **Accepted decisions**: `docs/adr/`. An ADR moves here once the spike or pilot confirms it.
- **Domain model and state machine**: `plan/en/04-technical/domain-and-data-model.md` and `plan/en/04-technical/state-machine-and-permissions.md`.

If a file doesn't exist, proceed silently.

## Use the glossary's vocabulary

When your output names a domain concept (ticket, report, receipt, verification, site, organization, technician, supervisor), use the term as defined in the glossary. Don't drift to synonyms it avoids. A missing term is a signal for `/domain-modeling`; add it to both language versions of the glossary.

## Flag ADR conflicts

If your output contradicts an ADR, proposed or accepted, surface it explicitly rather than silently overriding:

> _Contradicts ADR-001 (modular monolith), but worth reopening because…_
