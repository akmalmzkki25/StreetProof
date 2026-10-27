# Operations and support

DEL-06 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/05-delivery/operations-and-support.md)

Contents: [Recommendation and service boundary](#recommendation-and-service-boundary) · [Runbook matrix](#runbook-matrix) · [Support workflow](#support-workflow) · [Operating cadence and change control](#operating-cadence-and-change-control) · [Exit and portability](#exit-and-portability) · [Dependencies and next action](#dependencies-and-next-action)

## Recommendation and service boundary

Run a supported one-site pilot with named primary/backup contacts and a manual-work fallback. StreetProof handles non-emergency corrective work; site emergency procedures remain visible and independent. No 24/7 support or guaranteed response is assumed. Before live use, P and the customer agree coverage, channels, business timezone, severity, targets, exclusions and escalation authority. A planning option is weekday 09:00-17:00 WIB, subject to actual staffing; this is not a service commitment.

Onboard the customer data owner, operator, technician and supervisor separately. Demonstrate one report, one failed upload, one AI failure, one rejected completion and one reopened ticket. Teach what receipt/status access reveals and how to revoke it. Preserve a short job aid in Indonesian, category proof rules and a contact for access problems. Avoid adding recurring data entry that consumes the claimed time savings.

## Runbook matrix

| Symptom | Immediate action | Recovery and record | Owner |
| --- | --- | --- | --- |
| AI queued/failed | Show status and manual triage; avoid report resubmission | Check provider/lease/limits, bounded retry or skip; log model and error class | A/E |
| Upload stalled/rejected | Preserve safe draft with clear expiry; resume or request new photo | Check lease, bytes/type, scanner, storage; no failed file counted as proof | E/Q |
| Stale revision | Show current decision/actions and ask user to review | No silent overwrite or automatic replay of a changed decision | E |
| Technician cannot update | Check current assignment and membership | Restore legitimate access, never grant broad admin as workaround | E/Q |
| Completion rejected | Show supervisor reason and original attempt | Technician resumes, uploads corrected proof, submits new attempt | Customer supervisor/operator |
| Queue backlog/worker crash | Protect intake, limit affected jobs, inspect oldest due age | Reconcile outbox, leases and dedup keys; restart safely | E/A |
| Notification missing | Keep in-app work state authoritative | Check recipient/delivery record, reconcile uncertain send, retry within limits | Q/E |
| Suspected data exposure | Pause affected access, revoke credentials, preserve minimized evidence | Scope incident, contain, review obligations and agreed communication | E/P |
| DB/storage outage | Clearly show no durable acknowledgement; follow customer manual process | Restore isolated, reconcile media/events, reapply deletion ledger, then reopen access | E |
| Delete request | Verify requester/authority and locate all classes | Revoke, delete active data, track backup expiry, verify class-count tombstone | P/E |

Full technical steps and targets belong to [reliability](../04-technical/reliability-and-observability.md) and [privacy](../04-technical/security-privacy-and-governance.md). A runbook action must not create unauthorized external outreach; customer updates follow the agreed authorized channel.

## Support workflow

Create a support record with tenant/site, severity, first observed time, affected workflow, safe reproduction steps, correlation ID, owner, next-update time and resolution evidence. Do not paste reporter tokens, signed media links or personal photos into a general chat. Acknowledge receipt separately from resolution. P owns customer communication; E owns containment/restoration; A handles model-related causes; Q verifies the restored workflow with the operator.

Propose critical acknowledgement within one covered business hour and routine acknowledgement by the next covered business day only if staffing can support it. Agree these targets before offering them, record actual results and revise scope when coverage fails. Outside coverage, direct emergencies to the site's approved process; do not imply a support inbox dispatches responders.

## Operating cadence and change control

Daily during limited live use, inspect failed intake, overdue jobs, evidence/verification queue, spend and retention cleanup. Weekly, Q reviews active-time missingness, technician burden, false routing and mature reopen cohorts with P/A; E checks permissions, backup completion and storage growth. Rotate/revoke access when members leave. Rehearse recovery before pilot and after material changes; document actual times and loss windows.

Release small reviewed changes through staging with acceptance evidence. New media types, provider modes, data region, retention, autonomous actions or integrations reopen the corresponding readiness gate. Prompt/model changes are releases with versioned evaluation and rollback. Preserve ticket history when correcting defects; do not rewrite evidence to make metrics improve.

## Exit and portability

At pilot end, the customer chooses paid continuation, extension for missing evidence, or exit. Provide an authorized scoped CSV and agreed media manifest, explain which records are legacy/unverified, revoke users/tokens/integrations, remove active data under schedule and state backup expiry/residual limitations. Test export readability and formula safety. Never retain customer content for training or marketing without a separate valid permission.

## Dependencies and next action

P fills an operations agreement with real names, channels, timezone and feasible targets. E supplies an on-call/runbook checklist and restore evidence; A defines AI disable/retry authority; Q confirms customer training and exit rehearsal. [RACI](team-and-raci.md) assigns owners; [risk register](risk-register.md) defines stop triggers. None of these proposed controls is proof that support has already operated.
