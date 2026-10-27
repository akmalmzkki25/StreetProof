# Reliability and observability

TECH-09 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/04-technical/reliability-and-observability.md)

Contents: [Proposed service objectives](#proposed-service-objectives) · [Durable jobs and concurrency](#durable-jobs-and-concurrency) · [Telemetry and alerts](#telemetry-and-alerts) · [Recovery and deployment runbooks](#recovery-and-deployment-runbooks) · [Dependencies and next action](#dependencies-and-next-action)

## Proposed service objectives

Prioritize durable intake and correct state transitions over model availability. These are pilot planning targets, not an SLA or observed performance. Agree support hours and a recovery budget with the customer before live data.

| Indicator | Proposed target | Measurement boundary |
| --- | --- | --- |
| API availability | >=99% during agreed pilot operating hours | Valid eligible API requests; report dependency failures separately |
| Durable report acknowledgement | p95 <=2 seconds | After ready evidence; excludes network upload and AI |
| AI draft readiness | p95 <=60 seconds under agreed load | From committed job; include queue wait and failures in separate rate |
| Queue staleness | Alert if oldest eligible job >5 minutes | Per job class and tenant; exclude scheduled future work |
| Recovery | RPO <=24 hours; RTO <=4 business hours | DB and required media together, demonstrated before live data |
| Deletion cleanup | Orphans within 24 hours; other classes per agreed schedule | Count failures and retry age, not just scheduler success |

A daily DB backup alone cannot establish end-to-end media recovery. [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups) (T-08) describes database recovery and Pro's seven-day window. Inventory object backup, encryption, retention and deletion behavior separately. If the proposed RPO/RTO cannot be rehearsed, reduce or defer live scope rather than publish an unsupported promise.

## Durable jobs and concurrency

Use transactional domain mutation + immutable event + outbox. Dispatch to validated pgmq/Supabase Queues, with periodic reconciliation of undispatched rows. Each job includes eventId, tenantId, inputRevision, attempt, nextAttemptAt and lease metadata. Worker side effects use a unique result key and checkpoint; a crash after provider success can still cause a repeat bill, which must be measured.

[Supabase's visibility-window delivery claim](https://supabase.com/docs/guides/queues) (T-05) does not prove exactly-once external side effects. Use bounded retries, jitter, Retry-After, poison-job quarantine and an operator retry action with audit. Proposed three attempts for AI and five for notifications are configurable. Long jobs renew leases; expired leases permit recovery without overwriting a newer human revision. Apply tenant fairness and limits to prevent one upload storm starving others.

## Telemetry and alerts

| Signal | Minimum fields/measure | Action owner |
| --- | --- | --- |
| Request log | requestId, route template, actor type, tenant opaque ID, code, duration | E investigates errors; no tokens/contact/images |
| Trace correlation | reportId, ticketId, eventId, jobId, provider request ID | E/A follows one incident across API/worker |
| Domain metrics | Status counts, evidence completeness, rejection/reopen, assignment changes | P/Q checks workflow health and denominators |
| Queue metrics | Due depth, oldest age, retries, terminal failure, lease expiry | E restarts/reconciles safely |
| AI metrics | Schema validity, timeout, corrections, tokens/cost, stale draft | A disables/reverts model or prompt |
| Security/retention | Denied cross-scope requests, revoked credentials, deletion age | E escalates potential leaks, Q verifies cleanup |
| Capacity | Memory/OOM, DB connections, disk, storage/egress, spend | E sizes after evidence; P approves budget |

Alert on intake write failure, growing queue, repeated terminal validation failure, missed backup/cleanup and unexpected spend. Rate-limit alerts and assign one accountable responder plus backup. A dashboard without a responder/runbook is insufficient. Do not emit raw reporter tokens, signed URLs, prompts or photos into logging systems by default.

## Recovery and deployment runbooks

Before pilot: create a known fixture with ticket/event/evidence counts, back up both database and required objects, restore into an isolated environment, reapply deletion ledger, verify tenant permissions and object hashes/references, and record elapsed time plus actual loss window. Disable outbound notifications/model calls until reconciliation finishes. Document any missing objects and restore limitations. Rehearse once before launch and after a material storage/schema change; propose monthly rehearsal during the pilot if capacity permits.

For releases, use small reviewed migrations with expand/contract sequencing. Back up and rehearse rollback before destructive changes. Deploy worker-compatible event/schema changes before producers where needed. Application rollback must not reverse real completed work or invent an older revision; use compensating events. Keep health/readiness endpoints minimal and secret-free. Drain workers on deployment; do not acknowledge a job before its result is committed.

During outage, show a clear pending/failed state and recovery guidance. Do not claim submission success before persistence. If AI fails, leave manual triage available. If DB fails, pause new acceptance; a local draft is not a server ticket. Customer emergency procedures remain outside service availability.

## Dependencies and next action

E owns telemetry, restore rehearsal and runbooks; A owns model/error budgets; P names support coverage and customer escalation. Q validates outage and retry messages with the operator. Acceptance requires recorded rehearsal evidence and failure scenarios from [quality](../05-delivery/quality-and-acceptance.md), not merely vendor feature claims.
