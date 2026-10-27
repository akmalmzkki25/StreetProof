# Differentiation and relevance

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: R-06

[English / Bahasa Indonesia](../../id/01-research/differentiation-and-relevance.md)

## Proposed positioning

StreetProof is a lightweight evidence intake and verified close-out workflow for small facility teams. It can operate alone where there is no CMMS, or export to an existing system of record. Its proposed value is less operator reconstruction of incomplete reports and a clearer separation between technician completion and supervisor acceptance. Neither benefit has been measured.

The observed market weakens a broad novelty claim: [MaintainX](competitors/maintainx.md) documents external portals, [Limble](competitors/limble.md) advertises AI duplicate prevention, and [PlanRadar](competitors/planradar.md) documents ticket approvals. A combination can still be useful for a particular buyer, but combining familiar capabilities is not proof of a defensible advantage.

## Claims and proof obligations

| Proposed distinction | Why it may matter | Evidence needed | Claim allowed now |
| --- | --- | --- | --- |
| One bounded intake-to-acceptance loop | Small team avoids implementing an asset suite for one reporting problem | Compare setup effort and operator effort against form + existing tool | Proposed workflow focus |
| AI draft leaves missing context visible | Operators can correct uncertain location/category rather than inherit false certainty | Labeled evaluation, correction time and manual-form comparison | AI suggests; operator reviews |
| Human duplicate links preserve reports | One repair can acknowledge several reporters without deleting their evidence | False link rate, unlink/recovery test and reporter history | Proposed reviewable relation |
| Completion evidence plus supervisor decision | A technician upload does not automatically establish satisfactory repair | Rejection, resubmission and reopen observations | Proposed verified_closed policy |
| Indonesian operating fit | Local terminology, modest setup and customer support may improve adoption | Actual task tests, support load and paid buying decision | Indonesian pilot hypothesis |
| Portable records | Buyer can retain ownership and leave | Export completeness and restore/import exercise | Proposed export requirement |

## Where the thesis fails

A CMMS request portal may already solve intake well. A disciplined coordinator may enforce evidence in chat with little effort. AI correction can take longer than a clear form. Requiring technicians to take extra photos can offset operator savings. Low report volume can make any subscription difficult to justify. If proof is often impossible or invasive, the close-out policy needs category-specific exceptions rather than compulsory irrelevant images.

Do not claim fewer accidents, compliance, predictive maintenance, autonomous urgency assessment, unique AI, guaranteed ROI or first-time routing accuracy. Reassignment only permits recovery; it does not prove correct initial assignment. Retention, RBAC and audit records support governance requirements but do not establish full legal compliance. These distinctions also constrain later G-08 and G-22 claims.

## Decision boundary

Proceed from demo to a real pilot only after operational and data safeguards pass. Proceed to a paid offer only when a named buyer sees additional value over realistic alternatives and accepts a concrete price. The proposed pilot gate is at least 20% median active operator handling-time reduction, AI correction rate at most 20%, no increase in comparable false routing/reopen rates, required evidence at least 95%, no critical privacy/safety incident, and concrete paid commitment. Agree definitions and thresholds before measuring; small samples remain descriptive.

Next action: P writes one claim-evidence ledger for the pilot and Q records the strongest disconfirming example each week. A removes AI steps that add effort without useful information. See [field validation](field-validation.md) and [pricing](../02-business/pricing-packaging.md).
