# Quality and acceptance

DEL-05 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/05-delivery/quality-and-acceptance.md)

Contents: [Recommendation and evidence standard](#recommendation-and-evidence-standard) · [Acceptance scenario matrix](#acceptance-scenario-matrix) · [Release gates](#release-gates) · [Defect and regression policy](#defect-and-regression-policy) · [Acceptance record and next action](#acceptance-record-and-next-action)

## Recommendation and evidence standard

Use scenario-based acceptance tied to [product AC-01..AC-20](../03-product/product-requirements.md). The table below is a proposed verification plan; no application tests have been run by creating these documents. A pass requires observed behavior on a named build/environment, steps, expected/actual result, timestamp, reviewer and defect link. A mock screenshot cannot prove server authorization or persistence.

## Acceptance scenario matrix

| ID | Scenario and expected result | Product coverage | Owner |
| --- | --- | --- | --- |
| QA-01 | Photo/text/manual location on a phone; missing input shows specific error; hazard guidance precedes AI | AC-01/11 | Q/E |
| QA-02 | Direct API, Server Action and SQL/Storage access with two tenants and revoked membership denied; no shared-cache session leak | AC-12/17 | E/Q |
| QA-03 | Disconnect during upload, resume, expired lease, wrong MIME, oversized/decoder-bomb image, scanner outage; no unready proof accepted | AC-06/15 | E/Q |
| QA-04 | Lost report response and same-key retry create one work item; changed payload/key conflict is explicit; no raw receipt token stored | AC-09/15 | E |
| QA-05 | AI timeout, 429, bad credentials, invalid schema, malicious image text and stale input revision leave manual triage usable | AC-02/13 | A/E |
| QA-06 | Operator edits fields while original facts, user context and inference remain inspectable; priority rationale uses impact rules | AC-03/19 | Q/A |
| QA-07 | Human link/merge/unlink preserves all reports and reporter scopes; no silent cancellation; cyclic/cross-tenant links rejected | AC-04 | E/Q |
| QA-08 | Concurrent assignment/transition with same revision yields one result and one 409; former assignee cannot write | AC-05/06 | E |
| QA-09 | Completion requires current assignee and category proof/checklist; exception request remains pending until acceptable alternate proof | AC-07 | E/Q |
| QA-10 | Technician cannot verify; two supervisors accept/reject concurrently; one decision wins; reject reason and revised attempt retained | AC-08 | E/Q |
| QA-11 | Supervisor reopens with reason; prior verification remains, new cycle measured and reporter update minimized | AC-18 | E/Q |
| QA-12 | Random/expired/revoked reporter credential leaks no existence or internal fields; rotation invalidates old session; signed media TTL documented | AC-09/12 | E/Q |
| QA-13 | Crash after commit/before queue acknowledgement recovers; events and dashboard reconcile without fake closure or duplicate send | AC-10/14 | E/A |
| QA-14 | Governed deletion removes active objects/derivatives/export/contact; restored isolated backup reapplies deletion ledger before release | AC-17 | E/Q |
| QA-15 | Measurement sheet matches events; active time excludes waiting; missing/censored cohorts disclosed; actual cost records retained | AC-16 | Q/A |
| QA-16 | Offer/readout states scope, price, limits, support, access, exit and buyer decision; interest is not payment | AC-20 | P/Q |

Add export tests for scope, expiry and spreadsheet-formula injection. Test critical text in Indonesian, keyboard-only operation, labels/error focus, screen-reader status announcements, contrast and usable touch targets. WCAG 2.2 AA is a proposed design target, not a conformance claim. Include slow mobile networks and interrupted technician sessions; full offline synchronization is deferred.

## Release gates

| Level | Minimum evidence | Cannot be inferred |
| --- | --- | --- |
| Synthetic demo | Complete report-to-supervisor scenario, manual AI failure, duplicate preservation, private/scoped access, labelled synthetic data | Production recovery, customer value or validated model accuracy |
| Real-data pilot | All relevant security/authority/upload cases, privacy signoff, restore/deletion rehearsal, support and baseline protocol | Statutory compliance from feature presence |
| Paid continuation | Pilot gates, mature cohort readout, agreed support/exit and concrete buyer commitment | Repeatable demand from one interested user |

The pilot may accept a documented minor defect with a safe usable workaround and owner/date. No open critical/high defect affecting tenant isolation, unauthorized state transitions, evidence integrity, data loss or emergency guidance is acceptable. A reasoned proof exception requests supervisor review; it does not convert a failed upload into evidence or permit AI closure.

## Defect and regression policy

P0: confirmed private-data exposure, unauthorized verified closure or dangerous emergency behavior. Stop affected live use, contain, preserve minimized evidence and escalate. P1: core path cannot complete or persistence/recovery is unreliable; block release until fixed or scope safely removed. P2: noncritical usability/reporting defect with a viable workaround; record effect and owner. Severity is impact, not how easy the fix appears.

Automate domain guards, schema validation, tenant access and idempotency where meaningful. Use integration tests for real auth/storage/queue boundaries and a small end-to-end core journey. Do not substitute large numbers of shallow tests for failure scenarios. Re-run affected checks after a change; broaden only when dependencies or failures justify it. Load checks must document request mix, concurrent users/files, object sizes, duration and error rates.

## Acceptance record and next action

Q maintains a ledger: scenario ID, AC links, build/environment, fixture/data permission, reviewer, actual result, evidence, defect and retest. E/A supply failure-injection fixtures; P/customer approve remaining pilot limitations and data use. Before saying ready, check [state guards](../04-technical/state-machine-and-permissions.md), contracts and retention against this ledger. Documentation completion is not product acceptance.
