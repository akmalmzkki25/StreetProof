# Metric definitions and event sources

Document ID: PRD-06  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/03-product/metrics-and-events.md)

Contents

- [Measurement rules](#measurement-rules)
- [Simulated calculations](#simulated-calculations)
- [Analytics contract and data quality](#analytics-contract-and-data-quality)
- [Activation clock and preparation time](#activation-clock-and-preparation-time)
- [Dashboards and decisions](#dashboards-and-decisions)

## Measurement rules

The product north star is verified resolution with a stable cohort definition. Business metrics track paid conversion and support cost, separate from model accuracy. Definitions below are proposed operating rules to agree before the pilot. Preserve numerator, denominator, window and pending counts beside every percentage.

| ID | Metric | Definition | Source | Cadence |
| --- | --- | --- | --- | --- |
| MET-01 | Completeness | Reports meeting required category/location/evidence policy / valid reports in intake cohort | report.submitted; triage.confirmed | Daily |
| MET-02 | AI correction | Drafts with material field edits / reviewed drafts; show failed/pending separately | ai.completed; triage.confirmed | Weekly |
| MET-03 | Active handling time | Sum active intake/clarification/draft-review/duplicate-check intervals through first assignment; exclude queue/idle; closure follow-up separate | Observed time log + report ID | Baseline/pilot |
| MET-04 | Time to triage | triage.confirmed_at - report.submitted_at; show distribution and untriaged cases | report.submitted; triage.confirmed | Daily |
| MET-05 | First-pass routing | First assignments judged correct by a reviewer against team/category policy / first assignments assessed and observed for a full 7-day window; show coverage and unassessed | ticket.assigned; routing.reviewed | Weekly matured reviewed cohort |
| MET-06 | Duplicate precision | Reviewer-confirmed duplicate candidates / labeled candidates; not a recall measure | duplicate.suggested; duplicate.reviewed | Weekly |
| MET-07 | Verified resolution | Intake-cohort tickets verified_closed within 14 days / valid tickets observed for a full 14 days; pending separate | report.submitted; ticket.verified_closed | Weekly matured cohort |
| MET-08 | Time to verified closure | verified_closed_at - submitted_at per cycle; median/p95 among closed with open backlog visible | ticket.verified_closed; ticket.reopened | Weekly |
| MET-09 | Evidence completeness | Submissions meeting category proof checklist / reviewed submissions; exceptions visible | completion.submitted; verification.decided | Weekly |
| MET-10 | Reopen rate | Closures reopened within 14 days / closures observed for a full 14 days | ticket.verified_closed; ticket.reopened | Weekly matured closure cohort |
| MET-11 | SLA compliance | Eligible tickets meeting versioned-calendar deadline / eligible tickets already due; disclose pauses/exclusions | ticket.assigned; sla.due; ticket.verified_closed | Weekly |
| MET-12 | Technician input burden | Active input/checklist/proof time per work order, not physical repair time | Observed task/time log | Baseline/pilot |
| MET-13 | Organizational activation | Organizations completing first reviewed workflow and reporter status within 14 days / onboarded organizations observed for 14 full days | org.onboarded; workflow.activated | Weekly matured cohort |
| MET-14 | Paid conversion | Pilots with signed paid contract/invoice under agreed definition / pilots whose 30-day decision window ended | pilot.completed; contract.signed | Monthly matured cohort |
| MET-15 | Cost per ticket | Period operating costs / valid period tickets; separate fixed, variable and labor | Billing export + valid tickets | Monthly |

## Simulated calculations

Of 20 onboarded organizations, 5 have not completed the 14-day window. If 9 of 15 mature organizations activate, activation = 9/15 = 60%; 5 remain pending rather than failed. Of 50 closures, 10 lack a full observation window and 4 of the remaining 40 reopen: reopen rate = 4/40 = 10%. Do not use 50 as the denominator.

If 100 tickets save 5 active minutes each, savings = 500 minutes = 8.333 hours. At IDR60,000/hour, the value is IDR500,000. This is below the IDR1,500,000/month price hypothesis. At the same assumptions, 300 tickets are required merely to match platform fees, before process-change/support costs. Do not claim positive ROI from reduced queue elapsed time.

## Analytics contract and data quality

Table event names are analytical semantics. Wire contracts, envelope, revisions and emission rights follow [api-and-event-contracts](../04-technical/api-and-event-contracts.md); an analytics adapter maps wire events to these names and emits no new business decisions. Server events are authoritative; client clicks are UX diagnostics only.

Each event includes tenant, appropriate ticket/report ID, UTC server timestamp, actor/role, cycle/revision and policy version. Display Asia/Jakarta local time without changing source time. Never send status tokens, media content, reporter identity or secrets to analytics tools. Deduplicate by event_id rather than ticket title. Duplicate links preserve report counts while canonical work orders count once.

Retain permissioned raw measurement data and an edit audit. Label synthetic demo periods so they cannot mix with pilot data. Missing costs/outcomes are unknown rather than zero. Category/difficulty, service hours, parts, weather and volume can confound baseline comparison.

MET-03 uses the same task boundary in baseline and intervention: active operator effort from intake through first assignment. Log operator closure follow-up separately; supervisor verification and technician input are excluded from operator savings. If one person holds several roles, label intervals by role and never count a minute twice. Additional burden in other roles still enters net-value calculations.

## Activation clock and preparation time

Record pilot.prepared when sponsorship, protocol and baseline readiness are agreed before week 1. For MET-13, record org.onboarded only when limited-live workflow is enabled after baseline and shadow mode, normally at the start of week 5, with site, roles, data permission and technician/supervisor readiness confirmed. Its 14-day activation window starts then. Separately measure time-to-live from pilot.prepared to org.onboarded so long preparation is not hidden. Preserve contract/pilot start dates rather than moving them to improve metrics.

MET-05 requires reviewer labels on the first assignment rather than mere absence of reassignment. Store routing.reviewed as an analytical review result with reviewer, rule version and reason. A separate 7-day routing-stability proxy may count absence of correction across all mature assignments, but cannot be called accuracy. Show review coverage and unassessed cases so selective sampling cannot conceal wrong routing. Without review, accuracy remains unknown.

## Dashboards and decisions

Operators see backlog, age and owners; supervisors see proof completeness, rejected submissions and reopen; P sees pilot cohorts, fully loaded costs and buyer commitments. A checks false duplicates and corrections by category. Report small samples descriptively with n, ranges and context; make no significance claim without statistical design.

Experiment and continuation decisions appear in [pilot-and-roi-validation](../05-delivery/pilot-and-roi-validation.md). Metric-protocol changes create a definition version; do not silently pool results across versions.
