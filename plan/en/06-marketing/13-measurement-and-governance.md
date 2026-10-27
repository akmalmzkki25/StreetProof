# 13. Measurement and governance

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-13

[Versi Bahasa Indonesia](../../id/06-marketing/13-measurement-and-governance.md)

## Contents

- [North star and guardrails](#north-star-and-guardrails)
- [Metric contracts and matured windows](#metric-contracts-and-matured-windows)
- [Auditable collection](#auditable-collection)
- [RACI and cadence](#raci-and-cadence)
- [Open decisions by impact](#open-decisions-by-impact)
- [Action index](#action-index)

## North star and guardrails

The proposed north star is paying accounts using a verified workflow in a matured 28-day window, read alongside eligible workload. Before paying accounts exist, report pilot accounts reaching that value separately. Do not combine free pilots with paying customers to manufacture growth. Closed ticket counts cannot stand alone because they may encourage closure without evidence.

Proposed pilot guardrails: at least 95% required evidence, at most 20% AI correction, no increase in false routing/reopen against comparable baseline, no critical privacy/safety incidents, and no added technician/supervisor burden without agreed benefit. The target of at least 20% less operator time uses active minutes rather than calendar time. Agree definitions, exclusions, and minimum samples before the pilot. With small samples, show distributions, `x/n`, and limitations; claim neither significance nor causality.

## Metric contracts and matured windows

| Metric | Numerator and denominator | Window/source | Use |
|---|---|---|---|
| Qualified conversations | Unique accounts with role, recent problem, access, and next step | Calendar week; CRM | ACQ-01 indicator; duplicate contacts do not duplicate accounts |
| TimeToLive | org.onboarded_at - pilot.prepared_at per account; median among live accounts | pilot.prepared before baseline until limited live is ready after baseline and shadow | Show accounts not yet live with waiting age and reason; a success-only median cannot hide long preparation |
| Activation14 | org.onboarded accounts reaching first verified workflow and reporter receipt/status within 14 days / org.onboarded accounts whose 14 days elapsed | org.onboarded-date cohort when limited live is enabled after baseline and shadow; events and checklist | Site, roles, real-data permission, technician, and supervisor ready; pilot.prepared is outside the cohort; separate pending and accounts without eligible tickets |
| OperationalRetention28 | Activated accounts repeating the workflow on days 22-28 / activated accounts reaching day 28 | Activation cohort; events | Report overall and opportunity subsets separately |
| VerifiedResolution14 | Eligible tickets supervisor-closed within 14 days of submission / eligible tickets with the full 14 days matured | Submission cohort; immutable events | Show backlog/pending and categories; exclude young tickets from denominator |
| Reopen14 | Verified_closed tickets reopened within 14 days / verified_closed tickets with 14 follow-up days | Closure cohort; events | Yesterday's closure is not a non-reopen |
| RequiredEvidence | Completion submissions satisfying all required proof / all completion submissions reviewed in the same window | Weekly review; same checklist version | Rejected attempts remain visible rather than selecting successes |
| CorrectionRate | Reviewed AI drafts needing substantial change / all reviewed AI drafts | Separate shadow/live; revision log | Define substantial; spelling changes need not equal wrong location |
| CashConversion30 | Evaluated pilots paying within 30 days / evaluated pilots whose 30 days elapsed | Evaluation cohort; contract and payment ledger | Show signed-only separately; pending is not failure |
| Referral30 | Requested accounts giving a permissioned introduction within 30 days / requested accounts whose 30 days elapsed | Request cohort; CRM | One primary source with assisted sources recorded |
| Blended CAC | All complete acquisition costs / new paid accounts in the matching cohort | Cohort and sales lag; cost ledger | Unknown without inputs; no finite value/undefined for zero conversions |
| NRR | (Starting MRR + expansion - contraction - churn) for same cohort / cohort starting MRR | Monthly paying accounts; billing ledger | N/A without starting MRR; exclude pilot fees |

Synthetic example: three accounts reached org.onboarded at the start of limited live after baseline and shadow; two are beyond 14 days from that event and one is only five days old. If one of the two matured accounts activated within the window, Activation14 is 1/2 with one pending. Using 1/3 mixes windows. Accounts only at pilot.prepared are outside this example's denominator; report their wait for limited live separately. For tickets, of ten submissions only six are at least 14 days old and four closed on time; VerifiedResolution14 is 4/6 with four pending rather than 4/10. Preserve all excluded rows and reasons.

## Auditable collection

E supplies internal tenant/account IDs, event ID, timestamp, actor role, event type, before/after status, and revision. Marketing receives only a minimum export without photos, report content, reporter identity, precise locations, or reporter tokens. Q links timing observations to work categories and conditions; P joins account sources to offers and payments. Record timezone and day boundaries consistently. Do not equate `verified_closed` with AI confidence.

Google Analytics prohibits sending PII, including through URLs or campaign parameters. Marketing trackers therefore stay off receipt/token pages, and UTMs contain no buyer email or identity. This bounds a candidate service's use rather than declaring legal compliance. [M-02: Google Analytics PII](https://support.google.com/analytics/answer/6366371?hl=en)

## RACI and cadence

| Domain | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| ICP, channels, offers, budget | P | P | Q | E, A |
| Onboarding and assistance log | Q | P | E, A, customer users | Team |
| AI evaluation definitions/quality | A | P | Q, operator | E |
| Events, exports, data access | E | P | A, Q, customer data owner | Team |
| Baseline, retention, user burden | Q | P | A, customer supervisor | E |
| Case/referral permission | Q | P | Customer data/communications owner | Team |
| Pilot stop/revision | P | P | Q, E, A, customer sponsor | Affected users |

P owns StreetProof decisions; the customer retains its own internal approvals. Weekly: 30 minutes for the `x/n` scoreboard, pending, cost, support, and one decision. Monthly: 60 minutes to inspect sources, margin, loss reasons, and budget. Quarterly: 90 minutes to reselect ICP, channels, scope, and capacity. Two months of increasing effort without additional ICP conversations trigger channel change; support over two hours/site/week for two weeks holds new accounts. A critical incident stops live use and claim publication pending review.

## Open decisions by impact

| Rank | Decision and owner | Blocked work | Next evidence |
|---|---|---|---|
| 1 | Fully loaded CAC and available cash, P | Budget, payback, channel scale | Time/cash ledger and matured paid cohort |
| 2 | Sponsor, access, buyer, P | Every pilot and willingness to pay | Six conversations and a named decision process |
| 3 | Problem volume/value, Q | ROI and ICP | Comparable baseline including technician burden |
| 4 | Data permission, hosting, retention, P+E | Real data | Data-owner approval and control review |
| 5 | Team time/skills, P | Delivery and service promises | Person-level allocation and capability gaps |
| 6 | Meta/provider and product access, E+A | Demo and live AI | Account, terms, quota, fallback tests |
| 7 | Price, tax, scope, renewal, P | Offers/contracts | REV-01 and commercial review |
| 8 | Channels, domain, email, analytics, P+E | Distribution and instrumentation | Actual inventory and minimum tests |
| 9 | Publication/hackathon, Q+P | PR, logos, cases | Permission and verified official results |

## Action index

Start with the [summary](01-executive-summary.md), use the [90-day roadmap](09-roadmap-90-days.md) for execution, the [outlook](10-outlook-12-months.md) for funding sensitivity, and [139 ideas](12-tactical-idea-bank.md) for an inventory that is not all executed. P updates decisions and sources when evidence arrives. This document is research-based and proposed rather than a customer results report.

The shared product cohort/event contract is in [metrics-and-events](../03-product/metrics-and-events.md). Use product definitions as the shared reference; FirstPassRouting7 uses seven follow-up days for the initial routing decision. Organization activation at 14 days, the paid decision at 30 days after pilot evaluation, ticket resolution at 14 days, and reopen at 14 days are distinct windows.

MET-14 counts the agreed signed paid contract/invoice as a paid commitment. CashConversion30 here is a stricter submetric requiring actual payment evidence. Report both separately using the 30-day cohort after pilot completion; do not combine interest, signatures, invoices, and cash. Record marketing preparation before baseline as pilot.prepared. Record org.onboarded only when limited live is enabled after baseline and shadow, with site, roles, real-data permission, technician, and supervisor ready; in this proposed schedule that is the start of pilot week 5. Do not start Activation14 from preparation. Record TimeToLive separately so preparation delays remain visible.

