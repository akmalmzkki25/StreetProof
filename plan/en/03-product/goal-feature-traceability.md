# Repaired goal-to-feature traceability

Document ID: PRD-03  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/03-product/goal-feature-traceability.md)

Contents

- [Method and interpretation limits](#method-and-interpretation-limits)
- [Original goals and treatment](#original-goals-and-treatment)
- [Testable child goals](#testable-child-goals)
- [Catalog of 71 feature groups](#catalog-of-71-feature-groups)
- [Reassessment of the 121 original pairs](#reassessment-of-the-121-original-pairs)
- [Supporting score-2 relationships](#supporting-score-2-relationships)
- [Explicit additions and safeguards](#explicit-additions-and-safeguards)
- [Per-goal coverage](#per-goal-coverage)
- [Conclusions and self-review](#conclusions-and-self-review)

## Method and interpretation limits

This document repairs OR-02 without equating specification coverage with product success. It retains 27 goal IDs, 71 feature IDs and provenance for the 210 OR-01 §7 bullets. Scores are author judgements about described capabilities, not user measurements. A score of 5 means one capability satisfies a narrow outcome; 4 means direct fulfillment with one supporting capability; 3 is partial contribution; 2 is enabling support; 1 is a weak connection; 0 is unrelated. No pilot outcomes are available.

Compound goals are reviewed as chains of outcomes. Parent goals do not receive high scores merely because one part is covered. High confidence indicates clear source text rather than an AI probability or adoption guarantee. Unlisted pairs are unassessed separately or at most 1; zero is not assigned automatically. Additional score-2 relationships are shown explicitly.

## Original goals and treatment


| Goal | Original outcome | Original priority | Source | Treatment |
| --- | --- | --- | --- | --- |
| G-01 | Submit an actionable report quickly without knowing the category or team | Must | §3.3, §3.2A, §8.1 | Split outcomes; see child goals |
| G-02 | Know receipt and follow status without repeated questions | Must | §3.3, §3.2D | Retain outcome; test dependencies |
| G-03 | Trust that the problem was actually resolved | Should | §3.2D, §8.1 langkah 9 | Retain outcome; test dependencies |
| G-04 | Protect reporter identity and bystanders' personal data | Must | §3.2A, §3.2D, §14.1 | Split outcomes; see child goals |
| G-05 | Receive immediate emergency-channel guidance without waiting for AI | Must | §8.5, §3.2B, §2.3 | Retain outcome; test dependencies |
| G-06 | Turn raw reports into structured actionable tickets quickly | Must | §3.3, §3.2B, §3.5 H1 | Retain outcome; test dependencies |
| G-07 | Handle one incident reported by many people while retaining each report | Must | §3.2B, §3.5 H2, §8.2 | Retain outcome; test dependencies |
| G-08 | Route to the right team on the first attempt | Must | §3.2B, §3.3, §15.2 | Retain outcome; test dependencies |
| G-09 | Prioritize by impact rather than complaint intensity | Should | §3.2B | Retain outcome; test dependencies |
| G-10 | Collect reports from all relevant channels in one queue | Should | §3.3, §4.2 Persona A | Split outcomes; see child goals |
| G-11 | Understand the problem, location and asset before a field visit | Must | §3.3, §3.2C | Retain outcome; test dependencies |
| G-12 | Record work with little effort, including weak connectivity | Must | §3.3, §15.3, §17.1 | Split outcomes; see child goals |
| G-13 | Accept work, submit acceptable proof and report blockers consistently | Should | §3.3 | Split outcomes; see child goals |
| G-14 | Check work against standard proof before closure | Must | §3.3, §3.2C, §8.4 | Retain outcome; test dependencies |
| G-15 | Reconstruct who changed what, when and why | Must | §3.3 | Retain outcome; test dependencies |
| G-16 | Ensure ownership and deadlines and identify overdue work | Must | §3.2C, §3.3, §4.2 Persona A | Split outcomes; see child goals |
| G-17 | Compare SLA and evidence quality across vendors, teams and sites | Should | §3.2E, §4.2 Persona B | Split outcomes; see child goals |
| G-18 | Identify recurring faults and plan maintenance from asset history | Could | §3.2E, §4.2 Persona A | Split outcomes; see child goals |
| G-19 | Deliver a periodic management report without manual assembly | Should | §4.2 Persona A | Retain outcome; test dependencies |
| G-20 | See operational performance and maintenance cost connected to proof | Should | §3.3, §3.2E | Split outcomes; see child goals |
| G-21 | Demonstrate administrative/rework/delay ROI before purchase | Must | §4.1, §3.5 H6, §12.3, §20.5 | Split outcomes; see child goals |
| G-22 | Approve access controls, hosting, audit and data governance | Must | §4.1, §14 | Split outcomes; see child goals |
| G-23 | Buy with clear scope, price and contract | Should | §4.1, §13.2 | Retain outcome; test dependencies |
| G-24 | Fit existing SOP without increasing staff workload | Must | §4.1, §15.3 | Split outcomes; see child goals |
| G-25 | Avoid automatic AI punishment and excessive migration burden | Should | §4.1, §7.10, §7.6 | Split outcomes; see child goals |
| G-26 | Route cross-channel public reports correctly and monitor backlog | Could | §4.2 Persona C, §3.3 | Split outcomes; see child goals |
| G-27 | Refer to official channels through an authorized non-duplicating process | Could | §5, §10.2, §20.4 | Split outcomes; see child goals |

## Testable child goals

| ID | Single outcome | Candidate capabilities |
| --- | --- | --- |
| G-01a | Report has actionable location | F-04/F-05 |
| G-01b | Required evidence and context are complete | F-02/F-07 |
| G-04a | Only authorized roles access identity | F-63 |
| G-04b | Bystander media is minimized/redacted | F-18 |
| G-04c | Data is deleted under agreed policy | F-65 |
| G-10a | Pilot channels enter one queue | F-01/F-10 |
| G-10b | External channels connect with permission | F-11/F-68 |
| G-12a | Technicians record results with little input | F-38 |
| G-12b | Draft survives connectivity loss | F-40 |
| G-13a | Vendor accepts/declines work with a reason | F-61 |
| G-13b | Proof meets category standard | F-38/F-42 |
| G-13c | Blockers can be escalated for decision | F-39 |
| G-16a | Ticket has an accountable owner | F-29 |
| G-16b | Deadline follows service policy | F-22/F-29 |
| G-16c | Overdue work is visible and escalated | F-50/F-23 |
| G-17a | SLA compared within comparable groups | F-51/F-53 |
| G-17b | Evidence quality compared with one definition | F-52/F-53 |
| G-18a | Repeatedly failing assets identified | F-57/F-59 |
| G-18b | Inspections scheduled under human decisions | F-58 |
| G-20a | Operational performance links to ticket events | F-50/F-51 |
| G-20b | Work costs link to evidence | F-56/F-71 |
| G-21a | Active handling time compared to matched baseline | N-02 |
| G-21b | Costs/benefits calculated transparently | N-02/F-55 |
| G-21c | Buyer decides an actual offer | N-03 |
| G-22a | Access follows roles and tenant | F-63/F-66 |
| G-22b | Access/changes are auditable | F-33/F-64 |
| G-22c | Hosting/subprocessors approved by owner | N-04/F-66 |
| G-22d | Retention/deletion can be executed | F-65 |
| G-22e | Incident and support access are controlled | N-05 |
| G-24a | Workflow fits agreed SOP | F-16/F-20/N-06 |
| G-24b | Input burden does not rise without benefit | N-02/F-38 |
| G-25a | AI score triggers no automatic penalties | F-62 |
| G-25b | Migration can be staged | F-10/F-68 |
| G-25c | Monitoring/process-change impact is discussed | N-06 |
| G-26a | Referrals follow institutional jurisdiction | F-15/F-69 |
| G-26b | Cross-channel backlog can be monitored | F-50/F-10 |
| G-27a | Data sent through an authorized path | F-69/F-55 |
| G-27b | Handoff can be reconciled | F-67/N-06 |

## Catalog of 71 feature groups

The stage column refers to the required minimum slice, not every capability in a group. F-02 in the demo is photo upload, not video/voice. Demo F-63 includes basic roles/tenant access rather than SSO; F-66 includes isolation/private media, not a completed penetration test.


| ID | OR-02 capability | Origin | Original external dependency | Proposed stage |
| --- | --- | --- | --- | --- |
| F-01 | Responsive web/PWA, accessibility and Indonesian | §7.1 | None stated | Demo minimum |
| F-02 | Multimodal evidence upload | §7.1 | None stated | Demo minimum |
| F-03 | Voice/audio transcription | §7.1, §7.2 | None stated | Conditional experiment after core |
| F-04 | Manual/GPS location and building/room selection | §7.1, §7.12 | Map provider | Demo minimum |
| F-05 | Asset/room QR context | §7.1, §7.9 | None stated | Pilot |
| F-06 | Categories and report templates | §7.1 | None stated | Demo minimum |
| F-07 | Adaptive clarification and missing-field detection | §7.1, §7.2 | None stated | Demo minimum |
| F-08 | Preview and saved drafts | §7.1 | None stated | Demo minimum |
| F-09 | Ticket reference and receipt | §7.1, §7.7 | None stated | Demo minimum |
| F-10 | Email intake and historical CSV import | §7.1, §7.12 | None stated | Later / validate |
| F-11 | WhatsApp Business channel | §7.1, §7.12, §10.4 | Platform permission | Later / validate |
| F-12 | Visual summary, captioning and OCR | §7.2 | None stated | Demo minimum |
| F-13 | Structured field extraction | §7.2 | None stated | Demo minimum |
| F-14 | Category suggestion, explanation and confidence | §7.2 | None stated | Demo minimum |
| F-15 | Organization-based team suggestion | §7.2 | None stated | Later / validate |
| F-16 | Approved SOP/checklist retrieval | §7.2 | None stated | Pilot |
| F-17 | Queue moderation, anti-spam and rate limits | §7.2, §7.3 | None stated | Before public intake: rate limits; AI moderation later |
| F-18 | Image personal-data redaction with human review | §7.2 | None stated | Before real data: minimize/manual redact; automatic blur conditional |
| F-19 | Operator correction feedback | §7.2 | None stated | Pilot |
| F-20 | Routing rules, manual assignment and capacity | §7.3 | None stated | Demo minimum |
| F-21 | Emergency category escalation and early guidance | §7.3, §8.5 | None stated | Demo minimum |
| F-22 | Category SLA and service calendars | §7.3 | None stated | Pilot |
| F-23 | Escalation for unaccepted/late tickets or failed messages | §7.3, §7.7 | None stated | Pilot |
| F-24 | Duplicate candidates and retained report links | §7.3, §7.4 | None stated | Demo minimum |
| F-25 | Wrong-team detection and reasoned reassignment | §7.3 | None stated | Later / validate |
| F-26 | Low-confidence review queue | §7.3 | None stated | Demo minimum |
| F-27 | Contract/area-based vendor suggestion | §7.3 | None stated | Later / validate |
| F-28 | Validated ticket state machine | §7.4, §11.4 | None stated | Demo minimum |
| F-29 | Owner, team, priority and due information | §7.4 | None stated | Demo minimum |
| F-30 | Checklist, subtasks, material and scope changes | §7.4 | None stated | Later / validate |
| F-31 | Internal notes and reporter-visible comments | §7.4 | None stated | Demo minimum |
| F-32 | Ticket links to assets, locations and vendors | §7.4 | None stated | Later / validate |
| F-33 | Append-only ticket event history | §7.4 | None stated | Demo minimum |
| F-34 | Reasoned reopen | §7.4, §7.6 | None stated | Demo minimum |
| F-35 | Search, filtering and supervisor bulk actions | §7.4 | None stated | Demo minimum |
| F-36 | Daily jobs and visit ordering | §7.5 | None stated | Pilot |
| F-37 | Field location/asset context and approved safety notes | §7.5 | None stated | Demo minimum |
| F-38 | Field checklist, before/after evidence and work notes | §7.5 | None stated | Demo minimum |
| F-39 | Waiting/blocker states and supervisor assistance | §7.5 | None stated | Demo minimum |
| F-40 | Offline drafts and synchronization | §7.1, §7.5 | None stated | Pilot: durable drafts; full offline conditional |
| F-41 | Site representative confirmation and time/location signals | §7.5 | None stated | Pilot |
| F-42 | Category verification checklist and required proof | §7.6 | None stated | Demo minimum |
| F-43 | Before/after comparison assistance | §7.6 | None stated | Later / validate |
| F-44 | Supervisor review and separate claimed/verified completion | §7.6, §8.4 | None stated | Demo minimum |
| F-45 | Reporter confirmation and feedback | §7.6, §8.1 | Organization policy | Pilot |
| F-46 | Audit sampling and suspicious-evidence review | §7.6 | None stated | Pilot |
| F-47 | Reporter lifecycle notifications | §7.7 | None stated | Demo minimum |
| F-48 | Internal assignment/SLA notifications | §7.7 | None stated | Pilot |
| F-49 | Notification templates, frequency and history | §7.7 | None stated | Pilot |
| F-50 | Operational queue, backlog and workload dashboard | §7.8 | None stated | Demo minimum |
| F-51 | Elapsed-time and SLA metrics | §7.8 | None stated | Demo minimum |
| F-52 | Evidence completeness, reopen and duplicate metrics | §7.8 | None stated | Demo minimum |
| F-53 | Contextual vendor-performance comparison | §7.8, §7.10 | None stated | Later / validate |
| F-54 | Asset/location trends and period comparisons | §7.8 | None stated | Later / validate |
| F-55 | CSV/PDF export and scheduled reports | §7.8 | None stated | Pilot |
| F-56 | Conditional cost and root-cause analytics | §7.8 | Cost data | Later / validate |
| F-57 | Asset register and maintenance history | §7.9 | None stated | Later / validate |
| F-58 | Preventive inspection schedule and reminders | §7.9 | None stated | Later / validate |
| F-59 | Repeatedly failing asset analysis | §7.9 | None stated | Later / validate |
| F-60 | Vendor directory, contracts and service coverage | §7.10 | None stated | Later / validate |
| F-61 | Vendor acceptance, disputes and supervisor approval | §7.10 | None stated | Later / validate |
| F-62 | No automatic AI penalties, blacklisting or biometrics | §7.10, §7.6 | None stated | Demo minimum |
| F-63 | RBAC, scoped access, SSO and admin MFA | §7.11 | Identity provider (SSO) | Demo minimum |
| F-64 | Security access/export audit logs | §7.11 | None stated | Demo minimum |
| F-65 | Retention, deletion, classification and tenant export | §7.11 | None stated | Demo minimum |
| F-66 | Tenant isolation, encryption, backup and security assurance | §7.11 | None stated | Demo minimum |
| F-67 | REST API and webhooks | §7.12 | None stated | Later / validate |
| F-68 | Customer CMMS/helpdesk/asset-system integration | §7.12 | Customer system | Later / validate |
| F-69 | Authorized official complaint/Open311 adapter | §7.12, §10.2 | Institutional authorization | Later / validate |
| F-70 | Scoped external-agent MCP server | §7.12, §10.5 | None stated | Later / validate |
| F-71 | BI and read-only finance/ERP integration | §7.12 | Customer system | Later / validate |

## Reassessment of the 121 original pairs

Per-row evidence refers to OR-01. Scores are retained or lowered from OR-02 after testing the complete parent outcome. Medium confidence means text is clear but fulfillment needs integration/process/validation; high applies only to narrow capability fit. Reasons describe contribution and remaining dependencies.


| Goal | Feature | OR-02 score | Revised score | Confidence | Rationale and boundary | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| G-01 | F-07 | 4 | 3 | medium | Adaptive clarification and missing-field detection contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.1, §3.5 H3, §8.1 langkah 5 |
| G-01 | F-04 | 4 | 3 | medium | Manual/GPS location and building/room selection contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.1, §3.2A |
| G-01 | F-05 | 4 | 3 | medium | Asset/room QR context contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.1, §8.1 langkah 1 |
| G-01 | F-02 | 4 | 3 | medium | Multimodal evidence upload contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.1 |
| G-01 | F-14 | 4 | 3 | medium | Category suggestion, explanation and confidence contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.2, §3.2A, §8.1 langkah 4 |
| G-01 | F-13 | 3 | 3 | medium | Structured field extraction contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.2 |
| G-01 | F-03 | 3 | 3 | medium | Voice/audio transcription contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.1 |
| G-01 | F-01 | 3 | 3 | medium | Responsive web/PWA, accessibility and Indonesian contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.1 |
| G-01 | F-08 | 3 | 3 | medium | Preview and saved drafts contributes; the parent outcome still requires location, evidence, clarification and review together. | §8.1 langkah 6 |
| G-01 | F-06 | 3 | 3 | medium | Categories and report templates contributes; the parent outcome still requires location, evidence, clarification and review together. | §7.1 |
| G-02 | F-47 | 5 | 4 | high | Reporter lifecycle notifications contributes; the parent outcome still requires status events, reporter authorization and reliable delivery. | §7.7, §3.2D |
| G-02 | F-09 | 4 | 3 | medium | Ticket reference and receipt contributes; the parent outcome still requires status events, reporter authorization and reliable delivery. | §7.1, §8.1 langkah 7 |
| G-02 | F-28 | 3 | 3 | medium | Validated ticket state machine contributes; the parent outcome still requires status events, reporter authorization and reliable delivery. | §7.4 |
| G-02 | F-31 | 3 | 3 | medium | Internal notes and reporter-visible comments contributes; the parent outcome still requires status events, reporter authorization and reliable delivery. | §7.4 |
| G-02 | F-49 | 3 | 3 | medium | Notification templates, frequency and history contributes; the parent outcome still requires status events, reporter authorization and reliable delivery. | §7.7 |
| G-03 | F-45 | 4 | 3 | medium | Reporter confirmation and feedback contributes; the parent outcome still requires field evidence, supervisor review and a dispute path. | §7.6, §8.1 langkah 9 |
| G-03 | F-47 | 3 | 3 | medium | Reporter lifecycle notifications contributes; the parent outcome still requires field evidence, supervisor review and a dispute path. | §7.7 |
| G-03 | F-44 | 3 | 3 | medium | Supervisor review and separate claimed/verified completion contributes; the parent outcome still requires field evidence, supervisor review and a dispute path. | §7.6 |
| G-03 | F-34 | 3 | 3 | medium | Reasoned reopen contributes; the parent outcome still requires field evidence, supervisor review and a dispute path. | §7.4 |
| G-04 | F-18 | 4 | 3 | medium | Image personal-data redaction with human review contributes; the parent outcome still requires minimization, access, retention and governance together. | §7.2, §3.2A |
| G-04 | F-63 | 4 | 3 | medium | RBAC, scoped access, SSO and admin MFA contributes; the parent outcome still requires minimization, access, retention and governance together. | §7.11 |
| G-04 | F-65 | 4 | 3 | medium | Retention, deletion, classification and tenant export contributes; the parent outcome still requires minimization, access, retention and governance together. | §7.11, §14.1 |
| G-04 | F-31 | 3 | 3 | medium | Internal notes and reporter-visible comments contributes; the parent outcome still requires minimization, access, retention and governance together. | §7.4 |
| G-05 | F-21 | 5 | 4 | high | Emergency category escalation and early guidance contributes; the parent outcome still requires pre-AI guidance and organization contacts/SOP. | §7.3, §8.5 |
| G-05 | F-23 | 3 | 3 | medium | Escalation for unaccepted/late tickets or failed messages contributes; the parent outcome still requires pre-AI guidance and organization contacts/SOP. | §7.3 |
| G-06 | F-13 | 4 | 4 | medium | Structured field extraction contributes; the parent outcome still requires valid schema, category and operator confirmation. | §7.2, §3.5 H1 |
| G-06 | F-12 | 4 | 3 | medium | Visual summary, captioning and OCR contributes; the parent outcome still requires valid schema, category and operator confirmation. | §7.2, §3.2A |
| G-06 | F-14 | 4 | 3 | medium | Category suggestion, explanation and confidence contributes; the parent outcome still requires valid schema, category and operator confirmation. | §7.2 |
| G-06 | F-03 | 3 | 3 | medium | Voice/audio transcription contributes; the parent outcome still requires valid schema, category and operator confirmation. | §3.2A |
| G-06 | F-26 | 3 | 3 | medium | Low-confidence review queue contributes; the parent outcome still requires valid schema, category and operator confirmation. | §7.3 |
| G-06 | F-19 | 3 | 3 | medium | Operator correction feedback contributes; the parent outcome still requires valid schema, category and operator confirmation. | §7.2, §15.2 |
| G-06 | F-07 | 3 | 3 | medium | Adaptive clarification and missing-field detection contributes; the parent outcome still requires valid schema, category and operator confirmation. | §7.1 |
| G-07 | F-24 | 5 | 4 | high | Duplicate candidates and retained report links contributes; the parent outcome still requires operator decisions and individual report provenance. | §7.3, §3.5 H2, §8.2 langkah 6 |
| G-08 | F-20 | 4 | 4 | medium | Routing rules, manual assignment and capacity contributes; the parent outcome still requires correct category/jurisdiction and assignment review. | §7.3 |
| G-08 | F-15 | 4 | 3 | medium | Organization-based team suggestion contributes; the parent outcome still requires correct category/jurisdiction and assignment review. | §7.2 |
| G-08 | F-25 | 4 | 3 | medium | Recovers incorrect routing; does not establish first-attempt correctness. | §7.3, §15.2 |
| G-08 | F-14 | 3 | 3 | medium | Category suggestion, explanation and confidence contributes; the parent outcome still requires correct category/jurisdiction and assignment review. | §7.2 |
| G-08 | F-27 | 3 | 3 | medium | Contract/area-based vendor suggestion contributes; the parent outcome still requires correct category/jurisdiction and assignment review. | §7.3 |
| G-08 | F-19 | 3 | 3 | medium | Operator correction feedback contributes; the parent outcome still requires correct category/jurisdiction and assignment review. | §7.2 |
| G-09 | F-20 | 4 | 3 | medium | Routing rules, manual assignment and capacity contributes; the parent outcome still requires approved impact rules and operator judgement. | §7.3, §3.2B |
| G-09 | F-22 | 3 | 3 | medium | Category SLA and service calendars contributes; the parent outcome still requires approved impact rules and operator judgement. | §7.3 |
| G-09 | F-13 | 3 | 3 | medium | Structured field extraction contributes; the parent outcome still requires approved impact rules and operator judgement. | §7.2 |
| G-09 | F-21 | 3 | 3 | medium | Emergency category escalation and early guidance contributes; the parent outcome still requires approved impact rules and operator judgement. | §3.2B |
| G-10 | F-10 | 4 | 3 | medium | Email intake and historical CSV import contributes; the parent outcome still requires connectors for each channel and identity reconciliation. | §7.1, §7.12 |
| G-10 | F-11 | 3 | 3 | medium | WhatsApp Business channel contributes; the parent outcome still requires connectors for each channel and identity reconciliation. | §7.1, §10.4 |
| G-10 | F-05 | 3 | 3 | medium | Asset/room QR context contributes; the parent outcome still requires connectors for each channel and identity reconciliation. | §7.1 |
| G-10 | F-01 | 3 | 3 | medium | Responsive web/PWA, accessibility and Indonesian contributes; the parent outcome still requires connectors for each channel and identity reconciliation. | §7.1 |
| G-10 | F-68 | 3 | 3 | medium | Customer CMMS/helpdesk/asset-system integration contributes; the parent outcome still requires connectors for each channel and identity reconciliation. | §7.12 |
| G-11 | F-37 | 5 | 3 | medium | Field location/asset context and approved safety notes contributes; the parent outcome still requires problem summary plus complete location/asset context. | §7.5 |
| G-11 | F-32 | 3 | 3 | medium | Ticket links to assets, locations and vendors contributes; the parent outcome still requires problem summary plus complete location/asset context. | §7.4 |
| G-11 | F-12 | 3 | 3 | medium | Visual summary, captioning and OCR contributes; the parent outcome still requires problem summary plus complete location/asset context. | §7.2 |
| G-11 | F-57 | 3 | 3 | medium | Asset register and maintenance history contributes; the parent outcome still requires problem summary plus complete location/asset context. | §7.9 |
| G-11 | F-36 | 3 | 3 | medium | Daily jobs and visit ordering contributes; the parent outcome still requires problem summary plus complete location/asset context. | §7.5 |
| G-12 | F-38 | 4 | 3 | medium | Field checklist, before/after evidence and work notes contributes; the parent outcome still requires low-effort input UX and durable persistence/synchronization. | §7.5 |
| G-12 | F-40 | 4 | 3 | medium | Offline drafts and synchronization contributes; the parent outcome still requires low-effort input UX and durable persistence/synchronization. | §7.1, §7.5 |
| G-12 | F-39 | 3 | 3 | medium | Waiting/blocker states and supervisor assistance contributes; the parent outcome still requires low-effort input UX and durable persistence/synchronization. | §7.5 |
| G-12 | F-03 | 3 | 3 | medium | Voice/audio transcription contributes; the parent outcome still requires low-effort input UX and durable persistence/synchronization. | §7.1 |
| G-12 | F-36 | 3 | 3 | medium | Daily jobs and visit ordering contributes; the parent outcome still requires low-effort input UX and durable persistence/synchronization. | §7.5 |
| G-13 | F-61 | 4 | 3 | medium | Vendor acceptance, disputes and supervisor approval contributes; the parent outcome still requires acceptance, proof and blocker reporting in one flow. | §7.10 |
| G-13 | F-38 | 4 | 3 | medium | Field checklist, before/after evidence and work notes contributes; the parent outcome still requires acceptance, proof and blocker reporting in one flow. | §7.5 |
| G-13 | F-39 | 3 | 3 | medium | Waiting/blocker states and supervisor assistance contributes; the parent outcome still requires acceptance, proof and blocker reporting in one flow. | §7.5 |
| G-13 | F-30 | 3 | 3 | medium | Checklist, subtasks, material and scope changes contributes; the parent outcome still requires acceptance, proof and blocker reporting in one flow. | §7.4 |
| G-13 | F-42 | 3 | 3 | medium | Category verification checklist and required proof contributes; the parent outcome still requires acceptance, proof and blocker reporting in one flow. | §7.6 |
| G-14 | F-44 | 5 | 4 | high | Supervisor review and separate claimed/verified completion contributes; the parent outcome still requires checklist, evidence and supervisor authorization. | §7.6, §8.4 |
| G-14 | F-42 | 4 | 3 | medium | Category verification checklist and required proof contributes; the parent outcome still requires checklist, evidence and supervisor authorization. | §7.6 |
| G-14 | F-43 | 3 | 3 | medium | Before/after comparison assistance contributes; the parent outcome still requires checklist, evidence and supervisor authorization. | §7.6 |
| G-14 | F-46 | 3 | 3 | medium | Audit sampling and suspicious-evidence review contributes; the parent outcome still requires checklist, evidence and supervisor authorization. | §7.6 |
| G-14 | F-41 | 3 | 3 | medium | Site representative confirmation and time/location signals contributes; the parent outcome still requires checklist, evidence and supervisor authorization. | §7.5 |
| G-14 | F-38 | 3 | 3 | medium | Field checklist, before/after evidence and work notes contributes; the parent outcome still requires checklist, evidence and supervisor authorization. | §7.5 |
| G-15 | F-33 | 5 | 4 | high | Append-only ticket event history contributes; the parent outcome still requires complete event coverage and mandatory change reasons. | §7.4, §8.4 langkah 4 |
| G-15 | F-64 | 4 | 3 | medium | Security access/export audit logs contributes; the parent outcome still requires complete event coverage and mandatory change reasons. | §7.11 |
| G-15 | F-25 | 3 | 3 | medium | Wrong-team detection and reasoned reassignment contributes; the parent outcome still requires complete event coverage and mandatory change reasons. | §7.3 |
| G-15 | F-46 | 3 | 3 | medium | Audit sampling and suspicious-evidence review contributes; the parent outcome still requires complete event coverage and mandatory change reasons. | §7.6 |
| G-16 | F-29 | 5 | 3 | medium | Owner, team, priority and due information contributes; the parent outcome still requires ownership, deadline calendars and backlog visibility. | §7.4, §3.2C |
| G-16 | F-50 | 4 | 3 | medium | Operational queue, backlog and workload dashboard contributes; the parent outcome still requires ownership, deadline calendars and backlog visibility. | §7.8 |
| G-16 | F-23 | 4 | 3 | medium | Escalation for unaccepted/late tickets or failed messages contributes; the parent outcome still requires ownership, deadline calendars and backlog visibility. | §7.3 |
| G-16 | F-28 | 3 | 3 | medium | Validated ticket state machine contributes; the parent outcome still requires ownership, deadline calendars and backlog visibility. | §7.4 |
| G-16 | F-48 | 3 | 3 | medium | Internal assignment/SLA notifications contributes; the parent outcome still requires ownership, deadline calendars and backlog visibility. | §7.7 |
| G-16 | F-35 | 3 | 3 | medium | Search, filtering and supervisor bulk actions contributes; the parent outcome still requires ownership, deadline calendars and backlog visibility. | §7.4 |
| G-16 | F-22 | 3 | 3 | medium | Category SLA and service calendars contributes; the parent outcome still requires ownership, deadline calendars and backlog visibility. | §7.3 |
| G-17 | F-53 | 5 | 3 | medium | Contextual vendor-performance comparison contributes; the parent outcome still requires comparable data, team/site segmentation and vendor context. | §7.8, §7.10, §4.2 Persona B |
| G-17 | F-51 | 4 | 3 | medium | Elapsed-time and SLA metrics contributes; the parent outcome still requires comparable data, team/site segmentation and vendor context. | §7.8 |
| G-17 | F-52 | 4 | 3 | medium | Evidence completeness, reopen and duplicate metrics contributes; the parent outcome still requires comparable data, team/site segmentation and vendor context. | §7.8 |
| G-17 | F-60 | 3 | 3 | medium | Vendor directory, contracts and service coverage contributes; the parent outcome still requires comparable data, team/site segmentation and vendor context. | §7.10 |
| G-18 | F-59 | 4 | 3 | medium | Repeatedly failing asset analysis contributes; the parent outcome still requires quality history and inspection scheduling decisions. | §7.9 |
| G-18 | F-54 | 4 | 3 | medium | Asset/location trends and period comparisons contributes; the parent outcome still requires quality history and inspection scheduling decisions. | §7.8 |
| G-18 | F-58 | 4 | 3 | medium | Preventive inspection schedule and reminders contributes; the parent outcome still requires quality history and inspection scheduling decisions. | §7.9 |
| G-18 | F-57 | 4 | 3 | medium | Asset register and maintenance history contributes; the parent outcome still requires quality history and inspection scheduling decisions. | §7.9, §3.2E |
| G-18 | F-56 | 3 | 3 | medium | Conditional cost and root-cause analytics contributes; the parent outcome still requires quality history and inspection scheduling decisions. | §7.8 |
| G-19 | F-55 | 5 | 4 | high | CSV/PDF export and scheduled reports contributes; the parent outcome still requires complete source data and an agreed report template. | §7.8 |
| G-19 | F-50 | 3 | 3 | medium | Operational queue, backlog and workload dashboard contributes; the parent outcome still requires complete source data and an agreed report template. | §7.8 |
| G-19 | F-51 | 3 | 3 | medium | Elapsed-time and SLA metrics contributes; the parent outcome still requires complete source data and an agreed report template. | §7.8 |
| G-20 | F-50 | 4 | 3 | medium | Operational queue, backlog and workload dashboard contributes; the parent outcome still requires cost data and authorized evidence links. | §7.8 |
| G-20 | F-52 | 4 | 3 | medium | Evidence completeness, reopen and duplicate metrics contributes; the parent outcome still requires cost data and authorized evidence links. | §7.8 |
| G-20 | F-51 | 4 | 3 | medium | Elapsed-time and SLA metrics contributes; the parent outcome still requires cost data and authorized evidence links. | §7.8 |
| G-20 | F-56 | 3 | 3 | medium | Conditional cost and root-cause analytics contributes; the parent outcome still requires cost data and authorized evidence links. | §7.8 |
| G-20 | F-55 | 3 | 3 | medium | CSV/PDF export and scheduled reports contributes; the parent outcome still requires cost data and authorized evidence links. | §7.8 |
| G-21 | F-51 | 3 | 3 | medium | Elapsed-time and SLA metrics contributes; the parent outcome still requires baseline, active time, costs and buyer decision. | §7.8, §15.3 |
| G-21 | F-52 | 3 | 3 | medium | Evidence completeness, reopen and duplicate metrics contributes; the parent outcome still requires baseline, active time, costs and buyer decision. | §7.8 |
| G-21 | F-54 | 3 | 3 | medium | Asset/location trends and period comparisons contributes; the parent outcome still requires baseline, active time, costs and buyer decision. | §7.8 |
| G-21 | F-55 | 3 | 3 | medium | CSV/PDF export and scheduled reports contributes; the parent outcome still requires baseline, active time, costs and buyer decision. | §7.8 |
| G-22 | F-63 | 5 | 3 | medium | RBAC, scoped access, SSO and admin MFA contributes; the parent outcome still requires technical controls, hosting, contracts and owner approval. | §7.11 |
| G-22 | F-64 | 5 | 3 | medium | Security access/export audit logs contributes; the parent outcome still requires technical controls, hosting, contracts and owner approval. | §7.11 |
| G-22 | F-65 | 5 | 3 | medium | Retention, deletion, classification and tenant export contributes; the parent outcome still requires technical controls, hosting, contracts and owner approval. | §7.11, §14.5 |
| G-22 | F-66 | 4 | 3 | medium | Tenant isolation, encryption, backup and security assurance contributes; the parent outcome still requires technical controls, hosting, contracts and owner approval. | §7.11 |
| G-24 | F-16 | 3 | 3 | medium | Approved SOP/checklist retrieval contributes; the parent outcome still requires SOP configuration, training and workload observation. | §7.2 |
| G-24 | F-20 | 3 | 3 | medium | Routing rules, manual assignment and capacity contributes; the parent outcome still requires SOP configuration, training and workload observation. | §7.3 |
| G-24 | F-49 | 3 | 3 | medium | Notification templates, frequency and history contributes; the parent outcome still requires SOP configuration, training and workload observation. | §7.7 |
| G-24 | F-10 | 3 | 3 | medium | Email intake and historical CSV import contributes; the parent outcome still requires SOP configuration, training and workload observation. | §7.1 |
| G-24 | F-68 | 3 | 3 | medium | Customer CMMS/helpdesk/asset-system integration contributes; the parent outcome still requires SOP configuration, training and workload observation. | §7.12 |
| G-25 | F-62 | 5 | 3 | medium | No automatic AI penalties, blacklisting or biometrics contributes; the parent outcome still requires assessment policy, migration and measured input burden. | §7.10, §7.6 |
| G-25 | F-10 | 3 | 3 | medium | Email intake and historical CSV import contributes; the parent outcome still requires assessment policy, migration and measured input burden. | §7.1 |
| G-25 | F-61 | 3 | 3 | medium | Vendor acceptance, disputes and supervisor approval contributes; the parent outcome still requires assessment policy, migration and measured input burden. | §7.10 |
| G-26 | F-14 | 4 | 3 | medium | Category suggestion, explanation and confidence contributes; the parent outcome still requires jurisdiction rules, connectors and backlog dashboard. | §7.2, §4.2 Persona C |
| G-26 | F-12 | 4 | 3 | medium | Visual summary, captioning and OCR contributes; the parent outcome still requires jurisdiction rules, connectors and backlog dashboard. | §7.2 |
| G-26 | F-24 | 4 | 3 | medium | Duplicate candidates and retained report links contributes; the parent outcome still requires jurisdiction rules, connectors and backlog dashboard. | §7.3 |
| G-26 | F-50 | 4 | 3 | medium | Operational queue, backlog and workload dashboard contributes; the parent outcome still requires jurisdiction rules, connectors and backlog dashboard. | §7.8 |
| G-26 | F-15 | 3 | 3 | medium | Organization-based team suggestion contributes; the parent outcome still requires jurisdiction rules, connectors and backlog dashboard. | §7.2, §5.2 |
| G-27 | F-69 | 3 | 3 | medium | Authorized official complaint/Open311 adapter contributes; the parent outcome still requires authorization, data agreement and handoff reconciliation. | §7.12, §20.4 |
| G-27 | F-55 | 3 | 3 | medium | CSV/PDF export and scheduled reports contributes; the parent outcome still requires authorization, data agreement and handoff reconciliation. | §1, §7.8 |
| G-27 | F-67 | 3 | 3 | medium | REST API and webhooks contributes; the parent outcome still requires authorization, data agreement and handoff reconciliation. | §7.12 |

## Supporting score-2 relationships

| Goal | Feature | Score | Confidence | Rationale | Evidence |
| --- | --- | --- | --- | --- | --- |
| G-06 | F-17 | 2 | medium | Prevents queue spam; does not structure the report | §7.2/§7.3/§7.11 |
| G-22 | F-70 | 2 | medium | Tool scopes need audit but do not establish hosting/data approval | §10.5 |
| G-20 | F-71 | 2 | medium | Retrieves external cost data when access exists | §7.12 |
| G-14 | F-28 | 2 | medium | State machine blocks illegal jumps but does not inspect proof itself | §11.4 |
| G-21 | F-33 | 2 | medium | Events measure elapsed process time, not active operator effort | §7.4/§15.2 |
| G-04 | F-66 | 2 | medium | Encryption/isolation support privacy but do not establish processing purpose | §7.11/§14 |

## Explicit additions and safeguards

N-01 is a new design for closing the reporter loop. N-02/N-03/N-04/N-06 are mainly operational processes and artifacts. N-05 restores visibility to security bullets already present in OR-01 §7.11 but poorly represented in OR-02's 71 units; it is not wholly new functionality.

| ID | Capability/process | Goal | Stage |
| --- | --- | --- | --- |
| N-01 | Random, minimized, revocable reporter-status link | G-02/G-04 | Demo |
| N-02 | Baseline, active-effort and cost instrumentation; controlled spreadsheet allowed | G-21/G-24 | Before pilot |
| N-03 | Offer, scope, contract and vendor-eligibility pack | G-23/G-21 | Commercial |
| N-04 | Hosting/subprocessor review and data-owner approval | G-22c | Before real data |
| N-05 | Credential/service-account, file-scanning, incident-response and support-access controls | G-22e/G-04 | Before real data |
| N-06 | SOP configuration, training and integration reconciliation | G-24/G-25/G-27 | Pilot |

## Per-goal coverage

| Goal | Highest parent score | Original pairs assessed | Action |
| --- | --- | --- | --- |
| G-01 | 3 | 10 | Complete and test the specification chain |
| G-02 | 4 | 5 | Complete and test the specification chain |
| G-03 | 3 | 4 | Complete and test the specification chain |
| G-04 | 3 | 4 | Complete and test the specification chain |
| G-05 | 4 | 2 | Complete and test the specification chain |
| G-06 | 4 | 7 | Complete and test the specification chain |
| G-07 | 4 | 1 | Complete and test the specification chain |
| G-08 | 4 | 6 | Complete and test the specification chain |
| G-09 | 3 | 4 | Complete and test the specification chain |
| G-10 | 3 | 5 | Complete and test the specification chain |
| G-11 | 3 | 5 | Complete and test the specification chain |
| G-12 | 3 | 5 | Complete and test the specification chain |
| G-13 | 3 | 5 | Complete and test the specification chain |
| G-14 | 4 | 6 | Complete and test the specification chain |
| G-15 | 4 | 4 | Complete and test the specification chain |
| G-16 | 3 | 7 | Complete and test the specification chain |
| G-17 | 3 | 4 | Complete and test the specification chain |
| G-18 | 3 | 5 | Complete and test the specification chain |
| G-19 | 4 | 3 | Complete and test the specification chain |
| G-20 | 3 | 5 | Complete and test the specification chain |
| G-21 | 3 | 4 | N-02/N-03: baseline and an actual offer |
| G-22 | 3 | 4 | Complete and test the specification chain |
| G-23 | 0 | 0 | N-03: commercial process rather than feature gap |
| G-24 | 3 | 5 | Complete and test the specification chain |
| G-25 | 3 | 3 | Complete and test the specification chain |
| G-26 | 3 | 5 | Outside initial ICP; authorization required |
| G-27 | 3 | 3 | Outside initial ICP; authorization required |

## Conclusions and self-review

The matrix now includes confidence, score changes, evidence and chain boundaries. Compound parents receive no score of 5; narrow outcomes are handled through child goals and acceptance tests. No replacement product-health percentage is published because specification fit is not a user outcome. F-17 remains an operational/security control; F-70 waits for an external-agent use case; F-71 waits unless the buyer needs cost reconciliation. Low direct-user scores do not automatically remove these controls.

G-23 receives N-03 treatment despite having no original feature row. All 71 units are examined through the catalog and crosswalk; overlooked security bullets regain visibility through N-05. All 121 pairs were reassessed once under the complete-outcome rule, then checked for broad-goal consistency. This does not claim three stable rounds or an independent evaluation that did not occur.

See [source-feature-crosswalk](source-feature-crosswalk.md) for all 210 original bullets, [product-requirements](product-requirements.md) for acceptance criteria, and [mvp-and-release-scope](mvp-and-release-scope.md) for stage slices. Scores do not replace readiness decisions.
