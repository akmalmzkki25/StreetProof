# User experience and accessibility

Document ID: PRD-05  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/03-product/experience-and-accessibility.md)

## Experience principles

Users see their next task, the information required and the result of their action. Interface language uses concrete verbs: Submit report, Correct location, Accept work, Submit completion, Request corrected proof, Verify completion. Do not present a model draft as verified fact.

The lightweight reporter flow starts with location/evidence; reporters need not know the technician organization. Operators see sources beside drafts. Technicians see work, access context, checklist and blockers. Supervisors focus on proof and decisions. Dashboards do not replace the daily queue.

## Minimum screen specification

| Screen | Primary information | Main action | Required states |
|---|---|---|---|
| Reporter form | Service boundary, location, photo, description | Submit report | Missing location, oversized photo, failed upload, saved submission |
| Receipt/status | Reference and authorized status | View status / answer clarification | Invalid/expired/revoked token with generic non-leaking message |
| Operator queue | Ticket age, suggested category, confidence, owner | Review ticket | Empty, loading, no filtered results, AI failure |
| Ticket review | Original, draft, missing fields, duplicates | Confirm triage | Revision conflict, insufficient proof, rejected suggestion |
| Technician work | Location/asset, checklist, proof | Accept / transition / submit completion | Disconnection, pending upload, waiting access/parts |
| Supervisor review | Before/after, action, exceptions | Verify / request correction | Incomplete proof, different object, expired media access |
| Dashboard | Backlog, age, denominator and period | Open ticket cohort | Small sample, incomplete data, no closures |

## Planned accessibility

Provide associated form labels, keyboard navigation, visible focus, field-linked errors and assistive-technology-readable upload status. Status/confidence cannot rely on color alone. Design for minimum 4.5:1 normal-text and 3:1 large-text contrast as criteria to test, not an application certification claim. Target touch controls of at least 44px. Forms remain usable at 200% zoom and narrow widths without losing important actions.

Provide text alternatives for evidence that needs interpretation and avoid loading many full-resolution images together. Not every user can take a photo; evidence exceptions follow category policy and supervisor review rather than unexplained form failure. Operator-assisted intake is an available process. [AX-01: WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the reference; 44px is a product target rather than an AA-minimum claim or completed application audit.

## Uncertainty, privacy and notifications

Separate Reporter-provided, Visible in photo and AI suggestion labels. Low confidence indicates review need, not user fault. Reporter previews never expose internal data. Tokens stay out of analytics/logs; exchange a fragment token for a restricted session under the technical contract. Do not email sensitive media in updates.

Notifications describe agreed status changes without promising unapproved deadlines. When delivery fails, restricted status remains available and operators see the failure. Delivery is not the same as reading.

## Usability and field burden

Q tests reporting, draft correction, finding a location, uploading proof, rejecting evidence and viewing status. Record time, errors, assistance and permissioned feedback. Use low-cost devices and network conditions representative of the pilot site. See [interview-and-usability-kits](../07-appendices/interview-and-usability-kits.md).
