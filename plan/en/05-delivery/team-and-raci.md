# Team and RACI

DEL-03 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/05-delivery/team-and-raci.md)

Contents: [Recommendation and roles](#recommendation-and-roles) · [Project RACI](#project-raci) · [Handoffs and review rhythm](#handoffs-and-review-rhythm) · [Coverage and decision boundaries](#coverage-and-decision-boundaries) · [Dependencies and next action](#dependencies-and-next-action)

## Recommendation and roles

Plan by named responsibility and available hours, not assumed employees. P is product/commercial lead; E application/backend engineer; A AI/evaluation engineer; Q UX/QA/customer enablement. These are roles, not four confirmed full-time hires. Customer roles remain separate: buyer/data owner, operator, technician and supervisor. No sponsor, employment or customer participation has been established.

| Team size | Allocation | Required tradeoff |
| --- | --- | --- |
| Two people | Person 1 P+Q; Person 2 E+A | Narrow synthetic demo, manual duplicate selection and minimum dashboard; protect review time |
| Three people | P+Q, E, A with shared QA support | Assign one explicit acceptance owner; don't assume shared means owned |
| Four people | P, E, A, Q | Parallel discovery/evaluation/QA; E remains technical critical path |

Use [workload estimates](work-breakdown-and-estimates.md) to verify availability. Two-person full demo totals 68 and 76 hours per person against 50-hour assumed capacity; the reduced option is 40 and 44. Do not solve this gap with implicit overtime. If the engineer lacks security/operations experience, fund specialist review or delay real data; a role label is not proof of competence.

## Project RACI

R = performs work, Ac = one accountable decision owner, C = consulted, I = informed. The A column names the AI role; Ac avoids confusing role A with accountability. Customer means the named customer owner for the relevant decision, not an assumed participant.

| Decision or deliverable | P | E | A | Q | Customer |
| --- | --- | --- | --- | --- | --- |
| ICP/scope and commercial test | Ac/R | C | C | C | C |
| Architecture, access boundaries, recovery | C | Ac/R | C | R | C |
| AI adapter, labels and evaluation | C | R | Ac/R | R | C |
| Workflow/UX and acceptance evidence | C | R | C | Ac/R | C |
| Customer notice, retention and transfer decision | R | R | C | C | Ac |
| Pilot readiness recommendation | Ac | R | R | R | C |
| Customer permission to start/stop pilot | R | C | C | R | Ac |
| Operator/technician assignment and verification authority | I | C | I | C | Ac/R |
| Incident containment and restoration | C | Ac/R | R when AI involved | R | I |
| Customer support and agreed communications | Ac | R | C | R | C |
| Pilot measurement and readout | R | C | R | Ac/R | C |
| Paid continuation/purchase decision | R | I | I | C | Ac |

For an internal product decision, P decides scope; for a customer-owned data or purchase decision, the customer owner decides. Supervisor authority is operational and comes from the customer, not the project RACI. Independent close-out is preferred; staffing exceptions must be recorded and analyzed separately.

## Handoffs and review rhythm

E hands Q a runnable scenario, expected outcome and known failure cases, not a screenshot alone. A hands E a versioned schema, timeout/retry behavior and test fixtures; Q reviews AI limitations in the interface. P hands E/Q the agreed site roles, categories, retention and notification recipients. Q hands P an evidence pack separating observed results from assumptions and open defects.

During the ten-day effort, keep a brief daily blocker/owner check and fuller reviews on days 2, 5 and 8. During pilot, hold one weekly workflow/measurement review with permission and availability agreed in advance. Reserve time for support and recovery. Written handoffs should include current revision, evidence link, next action and escalation owner.

## Coverage and decision boundaries

Before live data, name a primary and backup for operational incidents, an operator who can work manually, and a supervisor who can reject/reopen. In a two-person project, the same engineer may be primary and sole technical responder; limit support hours and scope accordingly. No 24/7 support is promised.

The plan authorizes no external outreach or account access by itself. P prepares a reviewable pilot agreement and commercial proposal; actual customer communications follow the user's instructions and agreed channels. Product changes with new personal-data processing, autonomous decisions or procurement requirements reopen the relevant readiness gate.

## Dependencies and next action

P fills actual names, availability, decision authority and backup coverage. E/A identify skill gaps; Q confirms review capacity independently of implementation. Customer roles remain unassigned until a real sponsor agrees. Use [operations](operations-and-support.md) and [pilot](pilot-and-roi-validation.md) to turn this responsibility map into a working agreement.
