# Field validation

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: R-07

[English / Bahasa Indonesia](../../id/01-research/field-validation.md)

## Research decision

Treat discovery as a test of whether a small operator needs this workflow and can buy it. An eight-week pilot follows preparation, not the hackathon demo automatically. No participant has been recruited and no interview findings exist. P owns sponsor and buying authority; Q owns observation quality; E owns data handling and restore checks; A owns AI evaluation.

## Discovery protocol

Proposed recruitment target: 8-12 interviews across facility managers/operators, technicians and reporters, covering both commercial and campus candidates where access permits. This is a learning sample, not a representative survey. Seek at least two dissenting or current-tool-satisfied participants. Obtain explicit permission before recording, collecting examples or retaining photos. Use redacted or synthetic examples if permission is unavailable.

| Question about actual behavior | Evidence to request | Bias to avoid |
| --- | --- | --- |
| Walk through the last report from receipt to closure | Redacted messages, timestamps, assignment and proof | Asking whether they like AI |
| What information was missing and who asked again? | Actual clarification exchange | Assuming all reports are incomplete |
| When did two reports concern the same repair? | Both reports and decision to link | Treating similar photos as identical locations |
| Who can reject a technician's completion? | Recent rejection or stated authority | Treating uploaded photo as verified repair |
| What do you pay or spend staff time on today? | Existing license, active handling minutes, setup and support | Assuming saved time becomes cash savings |
| Who approves a paid tool, and when? | Name, budget line, procedure and next decision | Treating interest or a letter as paid demand |

## Eight-week design

| Stage | Work | Required output |
| --- | --- | --- |
| Preparation before week 1 | Agree site/categories, data permissions, roles, notices, retention, export, notifications and rollback; rehearse restore | Signed scope and owner; privacy/safety readiness; timing sheet |
| Weeks 1-2, matched baseline | Observe current tool and category mix; record operator activity and technician effort | Timestamped baseline, exclusions and work mix |
| Weeks 3-4, shadow | Draft structured reports without controlling live assignments; compare human decisions | Corrections, false duplicate candidates, routing comparison and latency |
| Weeks 5-6, limited live | Manual assignment and supervised evidence acceptance; retain fallback route | Actual event history, support time, exceptions and incidents |
| Weeks 7-8, evaluation | Compare comparable cases; discuss payment with economic buyer | Descriptive result, limitations, paid decision or stop/revise |

## Measurement contract

Record ticket/report ID, completion-submission ID, review-decision ID, category, site, input completeness, current method, active operator intake/clarification/draft-review/duplicate-check/first-assignment minutes, operator closure-follow-up minutes, supervisor-verification minutes, technician input minutes, AI field corrections, assignment changes, duplicate decision, required evidence, supervisor decision, approved-exception reason, reopen reason, support minutes and missing data. Keep elapsed repair time separate. Count one repair ticket once in ticket-level measures while retaining multiple report IDs; submission-level evidence measurement uses each completion-submission ID separately. Mask observer notes and restrict raw media.

MET-03 is the primary timing measure: active operator intake, clarification, draft review, duplicate checking and first-assignment work from intake through first assignment. Exclude queue/idle time and use exactly the same task boundary in baseline and treatment. Operator closure follow-up is a separate diagnostic; supervisor verification and technician input are separate role burdens, not operator savings. If one person performs several roles, label intervals by role and count each minute once. Include added effort in other roles when calculating net customer value.

MET-03 handling improvement = (baseline median active minutes - live median active minutes)/baseline median active minutes. Compare like categories and note staffing or workload changes. Correction rate = drafts with at least one substantive human correction / reviewed AI drafts. False routing = tickets judged incorrectly assigned first / assessed first assignments. Reopen rate uses completed observation windows; pending windows remain pending. A paper stopwatch or controlled spreadsheet is acceptable; a built-in timer is not required to measure ROI.

MET-09 evidence completeness = reviewed eligible completion submissions containing all required proof under the agreed category policy / all reviewed eligible completion submissions. Include rejected attempts in the denominator and assess their proof against the same policy. Count each submission ID once; a later resubmission is a new attempt counted once, not a replacement that erases the earlier failure. Report unreviewed submissions as pending. Display approved exceptions, reasons and denominator treatment separately; never silently count missing proof as compliant or revise eligibility after seeing results. Evidence completeness does not establish repair quality or supervisor acceptance. A closure-only proof rate may be shown as a separate descriptive proxy, but cannot replace MET-09 or satisfy its pilot gate. See [metrics and events](../03-product/metrics-and-events.md).

## Proposed gates, agreed before launch

Go requires at least 20% median MET-03 active operator-time reduction, correction rate at most 20%, no increase in comparable false routing/reopen rates, MET-09 evidence completeness of at least 95% across reviewed eligible completion submissions, no critical privacy/safety incident, a named buyer and concrete paid commitment. These are proposals, not validated thresholds. Stop live use immediately for critical data exposure or unsafe reliance and use the agreed fallback. Do not tune exclusions after seeing results. With low volume, extend baseline or report no conclusion. A good demo or positive interview cannot substitute for operational value and payment evidence.

Next action: Q prepares a one-page observation sheet; P confirms site access and buyer; E/A test the sheet and event records on synthetic cases. Link outcomes to [unit economics](../02-business/unit-economics-and-costs.md) and [commercial terms](../02-business/commercial-and-procurement.md).
