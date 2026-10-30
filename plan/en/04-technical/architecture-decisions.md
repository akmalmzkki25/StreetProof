# Architecture decisions

TECH-10 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/04-technical/architecture-decisions.md)

Contents: [Decision register](#decision-register) · [ADR-001 Modular monolith with separate worker](#adr-001-modular-monolith-with-separate-worker) · [ADR-002 Managed PostgreSQL, Auth and private Storage](#adr-002-managed-postgresql-auth-and-private-storage) · [ADR-003 Durable jobs and outbox before model calls](#adr-003-durable-jobs-and-outbox-before-model-calls) · [ADR-004 Human authority and separate AI state](#adr-004-human-authority-and-separate-ai-state) · [ADR-005 Scoped reporter receipt without account](#adr-005-scoped-reporter-receipt-without-account) · [ADR-006 Standard-mode server AI adapter](#adr-006-standard-mode-server-ai-adapter) · [ADR-007 Standalone workflow and export companion](#adr-007-standalone-workflow-and-export-companion) · [ADR-008 Configurable retention and conditional region](#adr-008-configurable-retention-and-conditional-region) · [Acceptance and next action](#acceptance-and-next-action)

## Decision register

All records below are proposed on 2026-10-20. They document tradeoffs for review, not founder acceptance or implementation. P owns product boundaries, E technical acceptance, A model evaluation, and Q workflow/quality. A change records its reason and superseding ID; do not silently rewrite history. Vocabulary follows [domain model](domain-and-data-model.md): report means observation, ticket means managed work, and verification means a supervisor decision.

## ADR-001 Modular monolith with separate worker

A 2-4 person team needs a complete evidence workflow before infrastructure specialization. Propose Next.js + TypeScript/Node modules with separate app/worker deployment, rather than microservices or a dual Next.js/FastAPI runtime. Shared validation and fewer operations outweigh Python convenience for the initial scope. Consequence: CPU-heavy media work needs worker resource limits. Revisit when a validated Python-only requirement or measured scaling bottleneck outweighs the extra runtime.

## ADR-002 Managed PostgreSQL, Auth and private Storage

Status: superseded on 2026-10-30 by D-11 in the [decision register](../00-foundation/decision-register.md): self-hosted PostgreSQL and MinIO in Docker, with authentication in the application.

Propose Supabase to reduce identity/storage integration work while retaining a relational domain model. Alternatives are independently managed PostgreSQL/Auth/object storage or self-hosting, which increase operations for this team. Consequence: service keys, storage APIs, region availability and backups create vendor-specific obligations. Portability requires SQL migrations, exported data/media manifests and an explicit recovery plan. Accept only after two-tenant access and restore/deletion rehearsal. [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) (T-03) supports mechanisms, not proof of our configuration.

## ADR-003 Durable jobs and outbox before model calls

Propose transactionally committed events/outbox and validated Supabase Queues/pgmq rather than in-memory tasks or custom Redis infrastructure. An accepted report must survive worker/provider failure. Consequence: retries can duplicate external work, so result keys, delivery records and bounded retry are mandatory. The vendor's [visibility-window guarantee](https://supabase.com/docs/guides/queues) (T-05) is narrower than exactly-once business effects. Revisit the queue if extension/transaction behavior fails the spike.

## ADR-004 Human authority and separate AI state

Keep AI drafts outside the work-status machine. Human duplicate linking preserves original reports; only supervisor verification closes work. Automatic AI assignment/closure would reduce clicks but creates unsupported authority and obscures error measurement. Consequence: operator review and technician input cost must be measured honestly. Revisit assistance scope only after pre-agreed evaluation, never by turning an AI success response into verified_closed.

## ADR-005 Scoped reporter receipt without account

Use a random revocable hashed token and restricted session rather than public sequential-ID lookup or mandatory reporter registration. This lowers submission burden while limiting disclosure. Consequence: lost-token recovery and residual signed-link TTL require explicit policies. Access is limited to sanitized own-report status/clarification. [Security design](security-privacy-and-governance.md) defines expiry, rotation and no-log rules. Account login can be added when a customer has a real identity requirement.

## ADR-006 Standard-mode server AI adapter

Use a provider adapter and propose Meta Standard mode for real data. Contributor discounts trade permission to train on submitted content, according to [Meta pricing terms](https://dev.meta.ai/docs/pricing-rate-limits) (T-11). Consequence: budget uses Standard rates and privacy review must still resolve retention, processing location and account terms. No access or compliance is assumed. Exact model ID is pinned after account/evaluation checks, with manual fallback if unavailable.

## ADR-007 Standalone workflow and export companion

Start with one site, a few categories and reviewed CSV. A full CMMS replacement or bidirectional integration would expand ownership/conflict problems before value is measured. Consequence: some customers will be a poor fit and bespoke integrations require separate pricing. Revisit when a named buyer provides a usable API/sample and agrees the authoritative record. See [migration](integrations-and-migration.md).

## ADR-008 Configurable retention and conditional region

Propose 90-day operational media and 365-day minimized audit, plus a separately inventoried backup lifecycle. Propose Singapore only after availability/transfer approval. Alternatives of indefinite retention or unconditional region selection simplify setup but create unjustified privacy/cost assumptions. Consequence: deletion ledger and restored-data cleanup are required. The data owner and counsel determine actual periods; these values are not statutory claims.

## Acceptance and next action

E records spike evidence against ADR-001/002/003/005; A probes model/terms and evaluation for ADR-006; P/Q validate customer authority, workflow and retention for ADR-004/007/008. Mark accepted only with reviewer, date, evidence and unresolved limits. If a decision fails, record a superseding proposal and update both language versions plus [contracts](api-and-event-contracts.md), costs and delivery estimates together.
