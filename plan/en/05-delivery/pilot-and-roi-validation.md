# Pilot and ROI validation

DEL-04 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/05-delivery/pilot-and-roi-validation.md)

Contents: [Recommendation and prerequisites](#recommendation-and-prerequisites) · [Eight-week protocol](#eight-week-protocol) · [Timing and metric definitions](#timing-and-metric-definitions) · [Proposed go, change and stop gates](#proposed-go-change-and-stop-gates) · [ROI calculation and uncomfortable example](#roi-calculation-and-uncomfortable-example) · [Dependencies and next action](#dependencies-and-next-action)

## Recommendation and prerequisites

Run one eight-week pilot with a named commercial-building sponsor, one site and 2-4 non-emergency categories. Campus can supersede this if a committed sponsor offers better access and usable baseline data. No access, ticket volume, willingness to pay or actual outcome is established. Preparation happens before week 1: permissions, private media, retention/deletion, verified close-out, notifications, timing method, recovery rehearsal and support coverage must be ready.

Agree the protocol, exclusions, stop rules and commercial decision owner before observation. A pilot fee test of Rp5,000,000 for eight weeks excludes customer labor; a Rp1,500,000/site/month continuation price is a test, not validated demand. Setup and custom integration are separate. Do not change thresholds after seeing results to manufacture success.

## Eight-week protocol

| Weeks | Phase | Work and evidence |
| --- | --- | --- |
| 1-2 | Matched baseline | Observe current process, category/severity mix, active operator time, technician input and waiting reasons |
| 3-4 | Shadow | Produce drafts alongside current workflow without changing live decisions; label corrections and duplicates |
| 5-6 | Limited live | Operator reviews drafts; manual assignment; proof and supervisor decisions; monitor burdens and stop rules |
| 7-8 | Evaluation | Reconcile matched records, freeze cohorts, collect buyer/operator/technician feedback, analyze value and costs |

Low baseline volume means extending observation or reporting no conclusion. A proposed operational minimum of 30 eligible records per compared phase is a planning check, not statistical power. Even above it, a small observational pilot is descriptive. Compare like categories, locations, shifts and severity; document staff changes, campaigns, backlog clearance and seasonal effects. Do not claim causality from a before/after average.

## Timing and metric definitions

Measure active operator handling as the sum of focused minutes spent reading, clarifying, editing, checking duplicates and assigning. Stop timing when waiting for a reporter, technician, parts, access, supervisor or system queue. Record clarification work when the operator actually performs it. MET-03 primary scope ends at first assignment: intake, clarification, draft review and duplicate checking through that first assignment. Operator close-out follow-up is separate, and supervisor verification is always recorded separately by role even when one person performs both roles. Record elapsed resolution separately from active time. A controlled spreadsheet and observation are valid; a built-in timer is optional and must not create artificial input burden.

Minimum row: pseudonymous report/ticket ID, phase, site/category/severity/shift, operator role, active start/stop intervals, pause reason, AI shown, material corrections, initial assignment, reassignment reason, proof completeness, completion/verification/reopen dates, technician input minutes, exclusion reason and missing-data flag. Store contacts/photos outside the measurement sheet. Q checks a sample against events each week.

| Measure | Denominator and maturity rule |
| --- | --- |
| Median active operator handling | Eligible matched handled tickets with valid timing; report missing/excluded counts and distribution |
| Draft correction | AI-reviewed drafts; material category/priority/summary corrections counted once per draft |
| First-pass routing, MET-05 | Reviewer-judged correct first assignments under the agreed routing policy / assessed seven-day matured first assignments; disclose assessed coverage and unassessed cases. No reassignment within seven days is a separate stability proxy |
| Verified resolution, MET-07 | Fourteen-day intake cohort; unresolved/censored cases remain visible, not dropped |
| Reopen, MET-10 | Fourteen-day closure cohort; compare mature verified closures and separate self-verification exceptions |
| Required evidence | Eligible completion submissions; approved evidence present under agreed rule |
| Activation | Fourteen-day organization cohort using product metric definition; show maturity |
| Paid conversion | Eligible buyer decisions with a 30-day decision window; distinguish signed commitment from interest |

Do not divide total pilot closures by only successful AI drafts. Preserve baseline and treatment timestamps, inclusion rules and raw corrections. Report counts, medians, ranges and uncertainty; do not invent significance. Late cohorts need follow-up after week 8 and potentially beyond the 90-day horizon.

Activation clock: record `pilot.prepared` before baseline. Record `org.onboarded` only when limited live use is enabled in week 5 with site, roles, authentication, technician and supervisor ready. Activation14 starts from `org.onboarded`; also report elapsed time from `pilot.prepared` to live enablement separately so preparation delays remain visible.

## Proposed go, change and stop gates

A proposed go requires all of: >=20% lower median active operator time on comparable work; correction <=20%; no increase in false routing or mature reopen relative comparable baseline; >=95% required evidence; no critical privacy/safety incident; a named buyer and concrete paid commitment. Agree how missing data and small numbers are treated before pilot. A single zero-event baseline is not proof that a rate cannot worsen.

Stop limited live use for cross-tenant/private-media exposure, unsafe emergency guidance, unauthorized closure or loss of required evidence. Disable AI for repeated invalid/unsupported drafts while preserving manual work. Change scope when technician input burden offsets operator savings or volume is insufficient. Strong demo reception without a buyer is not a go signal. P and customer owner decide continuation from a readout Q/A prepare; [RACI](team-and-raci.md) defines responsibilities.

## ROI calculation and uncomfortable example

`Monthly net customer value = active labor saved + separately evidenced avoided cost - subscription - incremental customer admin/training - integration amortization - added technician/supervisor burden`. Count a saved minute once. Waiting-time reduction has no labor cash value unless it demonstrably frees paid capacity or avoids a separately evidenced cost. Avoided damage or faster repair is not a default benefit.

Simulation: 100 tickets/month x 5 active minutes saved = 500 minutes = 8.333 hours. At Rp60,000/hour, gross labor value is Rp500,000/month. Against Rp1,500,000/month, simple net is negative Rp1,000,000 before other costs and ROI is `(500,000 - 1,500,000)/1,500,000 = -66.7%`. Labor-only break-even is 300 tickets/month at these assumptions, before other burdens. This example makes volume, actual minutes and willingness to pay a validation requirement. It is not an observed customer result.

Report cash cost and opportunity cost separately. The eight-week pilot fee, customer labor and internal StreetProof delivery cost are different perspectives. A free or discounted pilot does not prove the continuation price. Do not count a proposed vendor-cost saving as customer ROI.

## Dependencies and next action

P recruits only after authorization and names buyer/data owner; Q finalizes the sheet and observer instructions; E exposes trustworthy timestamps; A freezes labels/prompt versions. Obtain an agreed protocol before baseline. At readout, publish eligible counts, missingness, mature windows, corrections, technician burden, incidents, costs, buyer decision and remaining uncertainty, including a no-conclusion outcome when warranted.
