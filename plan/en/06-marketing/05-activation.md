# 05. Activation

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-05

[Versi Bahasa Indonesia](../../id/06-marketing/05-activation.md)

## Contents

- [First account-level value](#first-account-level-value)
- [Assisted onboarding plan](#assisted-onboarding-plan)
- [Activation experiments](#activation-experiments)
- [Cohort measurement](#cohort-measurement)
- [Horizon and next action](#horizon-and-next-action)

## First account-level value

StreetProof activation is not reporter signup or operator login. Proposed definition: one pilot account completes a permissioned real workflow from report, operator triage, assignment, and completion evidence to a supervisor's `verified_closed` decision, the supervisor can open the decision trail, and the reporter receives the appropriate status/receipt. AI cannot verify work by itself. A synthetic demo establishes a demo workflow, not customer activation.

Separate two events. `pilot.prepared` records planning and data readiness before baseline rather than starting Activation14. Record `org.onboarded` only when limited live use is enabled after baseline and shadow, at the start of pilot week 5 in the proposed schedule. At that point the site, roles, real-data permission, access, technician, and supervisor must be ready for the real workflow. Measure Activation14 for 14 calendar days from `org.onboarded`; do not start the clock at preparation or synthetic rehearsal.

Also measure `TimeToLive = org.onboarded_at - pilot.prepared_at` so long preparation remains visible. Show each account's duration, the median among live accounts, and accounts not yet live with waiting age and blockers. Tickets awaiting parts or access may remain open; do not close them for a metric. If no eligible ticket occurs in the activation window, show the reason. Extended observation is a separate decision and does not alter the established Activation14 result or denominator.

## Assisted onboarding plan

| Step | Checked outcome | Owner | Blocker and response |
|---|---|---|---|
| Preparation before baseline | Named sponsor, buyer, operator, technician, supervisor, data owner; record pilot.prepared | P+Q | Hold real data without permission or ownership; Activation14 has not started |
| One-site setup | Manual location, 2-4 categories, assignment, required evidence, operating hours | E+Q with customer | Do not require the entire asset registry before trying |
| Synthetic rehearsal | Operator corrects AI draft; supervisor rejects insufficient evidence | Q+A | Repeat if people believe AI makes the final decision |
| Enable limited live after baseline and shadow | Record org.onboarded only when site, roles, real data, technician, and supervisor are ready; start Activation14 and end TimeToLive | P+Q+E | A failed gate holds live use; record waiting time since pilot.prepared |
| Limited real workflow | Technician submits evidence without excessive entry; supervisor accepts/rejects with reason | Q+customer operator | Record entry time and connectivity issues; provide an agreed manual fallback |
| Debrief | Users repeat the workflow unaided and explain status | Q | Count assistance as a cost rather than removing it from time-to-value |

Reporters use a receipt/status route with a random, scoped, revocable token. Tokens never become analytics parameters or public examples. Marketing does not require every reporter to create an account. Emergency instructions appear at the beginning and do not wait for AI classification. Voice, maps, WhatsApp Business, and broad offline sync are not initial onboarding promises.

## Activation experiments

| ID | Question and execution | Cap | Decision |
|---|---|---|---|
| ACT-01 | Does a one-page checklist reduce setup blockers? Q uses it at one site and logs all assistance | At most two 45-minute sessions per site and two preparation hours; cash within S1 enablement | If setup still requires custom integration or over four assistance hours, narrow scope and revise before recruiting site two |
| ACT-02 | Do accepted/rejected evidence examples help technicians and supervisors? Q prepares two synthetic examples and observes five rehearsals if available | At most two creation hours; no significance claim from five rehearsals | If two participants still misunderstand who verifies, revise instructions and repeat before live use |
| ACT-03 | Does a task reminder help without adding burden? Q tests one reminder on a task late under customer rules | One reminder per event, no daily broadcast; engineering inside marketing cap | Stop automation for a wrong recipient, data exposure, or repeated complaints; continue manually during repair |

Primary skills: onboarding, copywriting, customer-research, analytics. Initial tools: Markdown checklist, approved sessions, an assistance log, and exportable application events. Emails support instructions after the UI stabilizes; Customer.io, a paywall, App Store, or new OAuth are not required to declare onboarding complete.

## Cohort measurement

`Activation14 = org.onboarded accounts achieving their first verified workflow and reporter status/receipt within 14 days / org.onboarded accounts with the complete 14-day observation window elapsed.` An account enabled for limited live only yesterday is pending and excluded from the denominator. An account only at pilot.prepared has not entered the activation cohort; show it in TimeToLive reporting. Report `x/n`, pending count, median time among successes, and accounts with no eligible ticket. Any success-only median must be accompanied by non-activations so failures remain visible.

Time-to-first-draft and login help diagnosis but do not replace activation. Technician burden, operator corrections, and supervisor rejection are guardrails. [Measurement](13-measurement-and-governance.md) separates this cohort from retention and ticket closure cohorts.

## Horizon and next action

Within 90 days, prepare one-site onboarding and observe one small cohort if the pilot is approved. In months 4-6, revise from actual blockers and test whether a second site can repeat without more assistance. In months 7-12, self-serve setup becomes eligible only if roles, data controls, and configuration patterns repeat. Q owns the checklist, P approves readiness, and E+A resolve product issues that actually block first value.
