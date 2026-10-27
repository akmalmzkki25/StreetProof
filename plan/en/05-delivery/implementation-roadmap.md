# Implementation roadmap

DEL-01 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/05-delivery/implementation-roadmap.md)

Contents: [Recommendation and clock](#recommendation-and-clock) · [Ten-day demo sequence](#ten-day-demo-sequence) · [Ninety-day decision horizon](#ninety-day-decision-horizon) · [Twelve-month path](#twelve-month-path) · [Dependencies and next action](#dependencies-and-next-action)

## Recommendation and clock

Use a ten-day focused demo effort, then readiness work, then an eight-week pilot. The 90-day horizon is relative to project start, not an official event deadline. No hackathon acceptance, team availability, customer access or budget is established. Ten demo days mean ten available working days; a sample calendar allocates the first 14 elapsed days for them. Do not convert inconsistent EST/ET event displays without confirming the organizer's timezone.

## Ten-day demo sequence

| Available work day | Deliverable | Exit condition and dependency |
| --- | --- | --- |
| 1 | Scope, synthetic fixtures, roles, architecture probe | Site/category scenario and authority rules agreed |
| 2 | Domain/API skeleton and private upload probe | Report persists and unauthorized media denied |
| 3 | Photo + text + manual location intake | Receipt survives retry without duplicate work |
| 4 | Manual triage, assignment and progress | Current-assignee and revision guards demonstrated |
| 5 | Completion, supervisor accept/reject/reopen | Proof required; rejected attempt preserved |
| 6 | Async structured AI draft and manual fallback | Provider probe/evaluation or explicit simulation label |
| 7 | Human duplicate linking and scoped reporter status | Original reports retained; token does not expose others |
| 8 | Minimum dashboard/event audit and failure scenarios | Queued/failed AI, network/upload and stale revision visible |
| 9 | End-to-end rehearsal and corrections | Core acceptance recorded; deferred features remain deferred |
| 10 | Demonstration and evidence pack | Script, limits, sources and next pilot gate ready |

Workstreams overlap only where dependencies permit. E cannot implement upload, state guards and integration simultaneously simply because other roles are available. In a two-person team, use the reduced [work breakdown](work-breakdown-and-estimates.md): manual duplicate selection, seeded synthetic scenario and minimal dashboard; production restore, broad integration and automated duplicate ranking follow the demo. If core authority/evidence behavior cannot fit, present a narrower labelled prototype and do not call it pilot-ready.

## Ninety-day decision horizon

| Elapsed period | Milestone | Gate |
| --- | --- | --- |
| Days 1-14 | Ten available demo work days | Synthetic/permissioned end-to-end slice with known limitations |
| Days 15-30 | Pilot readiness and sponsor qualification | Named buyer/operator/supervisor; roles, privacy, timing, recovery, support and budget agreed |
| Days 31-44 | Pilot weeks 1-2: matched baseline | Observe current work; comparable categories and active-time measurement |
| Days 45-58 | Weeks 3-4: shadow | AI drafts hidden from live decisions; labels and corrections logged |
| Days 59-72 | Weeks 5-6: limited live | One site, 2-4 categories; stop rules operational |
| Days 73-86 | Weeks 7-8: evaluation | Freeze cohorts, reconcile evidence, analyze burden and cost |
| Days 87-90 | Initial decision/readout | Descriptive results, paid decision request, mature-window follow-up named |

This calendar is a planning assumption. Sponsor delay or low volume moves the pilot, not the definition of readiness. Fourteen-day resolution/reopen cohorts started late in the pilot will not all mature by day 90; show censored cases and schedule the final readout after follow-up. Paid conversion uses a 30-day decision window, so do not claim its outcome prematurely.

## Twelve-month path

| Relative horizon | Intended learning | Release boundary |
| --- | --- | --- |
| Month 1 | Can the team demonstrate the complete core and prepare safely? | Demo plus readiness, no broad launch promise |
| Months 2-3 | Does assisted intake reduce active burden without worse routing/reopens? | Eight-week pilot and lagged follow-up |
| Months 4-6 | Will a named buyer pay and repeat the workflow? | Paid continuation only after gates; standard onboarding/export |
| Months 7-9 | Can another comparable site adopt without founder-heavy setup? | Repeatable permissions, training, support and unit-cost evidence |
| Months 10-12 | Can operations support an early ten-site workload? | Capacity scenario, not sales forecast; expand only if retention/value hold |

Voice, segmentation, maps, WhatsApp Business, broad offline sync, MCP and bidirectional CMMS remain optional later decisions. Each needs a demonstrated user problem, owner, cost and acceptance test. Campus may replace the recommended commercial segment if a committed sponsor gives better access and usable baseline data.

## Dependencies and next action

P confirms available work days and sponsor path; E/A run the architecture/provider probes; Q prepares timing and acceptance. Re-estimate at days 2, 5 and 8 using completed evidence, not percent-complete claims. Stop adding scope when the critical path loses its reserve. See [pilot](pilot-and-roi-validation.md), [quality](quality-and-acceptance.md) and [risk register](risk-register.md).
