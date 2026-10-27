# Hypothesis personas and user journeys

Document ID: PRD-02  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/03-product/personas-and-journeys.md)

## Persona status

Personas derive from OR-01 §3-4 and author analysis. They are not interview findings. No customer names, quotations or workload figures are invented. Use them to recruit participants and revise them through real-ticket observation.

| Role | Desired outcome | Main interaction | Success boundary |
| --- | --- | --- | --- |
| Reporter/occupant | Submit sufficient context and follow progress | Photo, manual location, receipt, restricted status | Success: receipt, not collecting all identities |
| Operator/helpdesk | Prepare a ticket without excessive re-entry | AI review, clarification, duplicate candidates, assignment | Measure active minutes and wrong-team routing |
| Internal technician | Understand work and record results with low effort | Location/asset context, checklist, proof, blockers | Measure added input burden, not photo count alone |
| Vendor | Receive agreed scope and proof requirements | Acceptance, scope changes, reasoned dispute | Avoid AI scores as automatic penalties |
| Supervisor/facility manager | Ensure inspectable outcomes and controlled backlog | Before/after review, reject/reopen, owner and due time | Closure requires a human decision |
| Operational buyer | Buy when benefits and risks are acceptable | Baseline, costs, pilot report and contract scope | Demo interest is not purchase |
| IT/legal/DPO | Approve access, hosting and processing purpose | Data flow, subprocessors, audit, retention and exit | Technical controls alone do not certify compliance |
| Procurement/finance | Purchase a service with clear scope and price | Offer, vendor eligibility, tax and support | This need is partly non-product |
| Government complaint admin | Refer reports within jurisdiction | Authorized referral and reconciliation | Outside initial customer scope |

## Report-to-closure journey

| Handoff | Recipient need | Break risk | Design and measurement |
|---|---|---|---|
| Reporter to operator | Location, evidence and summary | Context-free photo; invented room | Manual location, missing_fields, correction; completeness rate |
| Operator to technician | Problem, scope, access and owner | Wrong team or lost context | Human review, assignment event, acceptance; first-pass routing |
| Technician to supervisor | Initial/final evidence and action | Failed photo upload treated as complete | Confirmed uploads, checklist, completion_submitted; evidence completeness |
| Supervisor to reporter | Understandable decision | Ticket closes without reporter awareness | Minimized status and approved notifications; status-access task test |
| Product to buyer | Value against previous process | Attractive dashboard with extra work | Active-effort baseline, costs and technician input; pilot decision |

## Alternative paths

Blurry photos trigger better-proof requests without deleting original submissions. Incorrect categories can be corrected with reasons retained. Duplicate candidates are suggestions; operators can reject them or remove links. Tickets waiting for access/parts retain an owner and reason. Evidence rejection returns work for correction without removing earlier submission history.

If a reporter loses a token, assisted recovery checks entitlement without revealing data from a ticket number alone. Operators can provide assisted intake for people without smartphones, recording the source channel. Emergency guidance waits for neither media nor model output.

## Buying and adoption

P starts with a champion and identifies buyer/approvers before the pilot. Q observes technicians rather than managers alone. IT reviews data flows before real samples; procurement receives scope and an exit method. Existing vendors participate so process changes remain visible. If managers benefit while technician burden increases, adoption is not validated.

Interview templates appear in [interview-and-usability-kits](../07-appendices/interview-and-usability-kits.md). Findings record role, context, method and permission rather than generalize to the entire market.
