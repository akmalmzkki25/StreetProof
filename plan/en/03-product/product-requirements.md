# Product requirements and acceptance criteria

Document ID: PRD-01  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/03-product/product-requirements.md)

Contents

- [Problem and outcomes](#problem-and-outcomes)
- [Roles and decision rights](#roles-and-decision-rights)
- [Core scenario](#core-scenario)
- [Acceptance criteria](#acceptance-criteria)
- [Data boundaries and uncertainty](#data-boundaries-and-uncertainty)
- [Non-goals and release gates](#non-goals-and-release-gates)

## Problem and outcomes

Problem hypothesis: operators spend time structuring incomplete reports, requesting locations again, choosing teams and chasing completion evidence. StreetProof tests whether these steps can be assisted without shifting excessive work onto technicians. The original materials establish neither prevalence nor realized benefit.

The product must complete an accountable cycle. The minimum outcome retains the original report, assigns a canonical ticket, collects proof, records a supervisor decision and gives the reporter restricted status access. Quality figures are proposed targets rather than implementation performance.

## Roles and decision rights

Reporters supply evidence/context and receive minimized status. Operators correct drafts, confirm priority, link duplicates and assign work. Technicians accept work, record blockers and submit completion. Supervisors assess proof and accept, reject or reopen. Admins configure sites, members and policies; a technical admin title alone grants no work-closure authority. Detailed permissions appear in [state-machine-and-permissions](../04-technical/state-machine-and-permissions.md).

## Core scenario

1. A reporter opens a site link and sees service boundaries/hazard guidance, selects a manual location and adds a photo and description.
2. The server creates the report/ticket after validation; AI processing runs asynchronously. Receipt does not wait for the model.
3. AI drafts structured fields, identifies unknowns and suggests categories/duplicates. Operators can continue manually after AI failure.
4. The operator confirms context, links matching reports, sets priority and chooses an owner.
5. The technician accepts the work, checks context/checklist and records progress or access/parts blockers.
6. The technician uploads completion proof and submits completion. This does not set verified_closed.
7. A supervisor compares initial/final evidence and accepts with a reason or requests correction. Reporter updates do not expose internal data.
8. If the problem recurs, the supervisor reopens with a reason while preserving prior-cycle history.

## Acceptance criteria

| ID | Related goal | Behavior to prove | Owner |
| --- | --- | --- | --- |
| AC-01 | G-01 | Reporter selects manual location and submits photo/text; missing required fields trigger specific clarification without guessing location | E/Q |
| AC-02 | G-06 | AI returns valid schema separating visible facts, user context, inference and missing_fields | A/E |
| AC-03 | G-06/G-08 | Operator can edit category, location, priority and team while original sources remain inspectable | E/Q |
| AC-04 | G-07 | Duplicate candidates never auto-delete reports; link/unlink retains individual reporters and proof | E/A |
| AC-05 | G-16 | Manual assignment records owner, revision, time and reason; concurrent updates produce a conflict | E |
| AC-06 | G-11/G-12 | Technician sees only authorized work with location, evidence and checklist; failed upload cannot mark completion | E/Q |
| AC-07 | G-14 | Completion submission requires category proof/checklist or a reasoned exception for supervisor decision | E/Q |
| AC-08 | G-14/G-03 | Only an authorized supervisor accepts verification into verified_closed; reasoned rejection permits corrected proof | E/Q |
| AC-09 | G-02/G-04 | Reporter receives receipt and random-token link; token exposes no identity, internal notes, sensitive location or another tenant | E/Q |
| AC-10 | G-15 | Important events include actor/role, server time, change, reason and correlation_id; ordinary users cannot edit events | E |
| AC-11 | G-05 | Hazard guidance appears before AI; system neither labels the location safe nor promises emergency response | P/Q |
| AC-12 | G-04/G-22 | Server denies cross-tenant/role access; private media and expired tokens are tested; demo accounts expose no real data | E/Q |
| AC-13 | G-06 | AI timeout/quota/schema failures yield failed analysis and manual triage without duplicate tickets | A/E |
| AC-14 | G-20 | Dashboard uses the same ticket events; synthetic events are labeled and unresolved tickets are not fabricated closures | E/A |
| AC-15 | G-12/G-24 | Pilot tests durable drafts and duplicate-free retries under disconnection; complete offline queue remains a separate capability | E/Q |
| AC-16 | G-21 | Before pilot, matched baseline, active-time records, actual costs and agreed comparison rules exist | P/A |
| AC-17 | G-22 | Before real data, owner approves purpose, hosting/subprocessors, retention, deletion and incident response | P/E |
| AC-18 | G-03/G-14 | Reopen requires a reason and starts a new cycle without erasing previous closure/verification | E/Q |
| AC-19 | G-09 | Priority suggestion has a rationale; operator applies approved impact rules; reporter social status is not a priority input | P/A |
| AC-20 | G-23/G-21 | Offer states scope, limits, fees, data access, support and exit; record buyer decisions without treating interest as payment | P |

## Data boundaries and uncertainty

Location, asset and category are structured fields; reporter identity is separated by access need. AI summaries never replace original media/text. Model confidence is not the probability that a location is safe. Visible facts, user statements and inferences remain distinguishable in the UI and AI-run audit. Blurry evidence leads to better-photo/context requests or manual review.

Work tickets and AI analysis have different statuses. Retried jobs must not repeat assignment or closure. Policy choices, upload limits, timeouts, token TTL and event contracts follow [api-and-event-contracts](../04-technical/api-and-event-contracts.md). Changes require a coordinated revision rather than hidden new defaults.

## Non-goals and release gates

The first version promises no engineering diagnosis, safety determination, contractor selection, payments, predictive maintenance or government integration. Voice, SAM, maps, WhatsApp Business, MCP and full offline synchronization cannot displace core acceptance. SOP retrieval uses organization-approved documents only; models cannot invent hazardous repair instructions.

AC-12/AC-17 and a restore rehearsal must pass before real data. AC-16 and the comparison method precede benefit claims. AC-20 precedes a commercial offer. Feature mapping counts cannot substitute for product readiness.
