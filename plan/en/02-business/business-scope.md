# Business scope

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: B-01

[English / Bahasa Indonesia](../../id/02-business/business-scope.md)

## Proposed business

Sell a bounded workflow for evidence intake and supervisor-accepted corrective work to Indonesian commercial building operators with 1-5 sites. Begin with one site and 2-4 non-emergency categories. The recommendation can shift to campus if a committed sponsor provides better access, comparable reports and a buying route. Neither segment has validated demand or confirmed access.

## Parties and responsibilities

| Party | Operational responsibility | Limit |
| --- | --- | --- |
| Reporter | Supplies description, photo where appropriate and mandatory manual location | Does not diagnose faults or approve repairs |
| Customer operator | Checks draft, clarifies, links duplicates and assigns | Keeps authority over category, priority and technician |
| Technician | Accepts task, updates work, records completion evidence | Submission does not automatically close work |
| Supervisor | Accepts/rejects completion and can reopen | verified_closed is a human decision |
| Customer data owner/buyer | Authorizes data scope, retention and purchase | Budget and authority must be discovered |
| StreetProof team | Operates the agreed software, assists setup and measures support load | Does not supply repair labor or promise physical repair outcomes |

## Offer boundaries

The hackathon demo proposes photo/text intake, an AI structured draft with missing context, operator review, human duplicate linking that retains original reports, manual assignment, technician updates, completion evidence, supervisor acceptance/rejection, scoped reporter status, a small dashboard and immutable event history. Use synthetic or permissioned data. Show emergency guidance before AI analysis. A no-login reporter receives an unguessable scoped revocable token, not a public sequential-ID lookup.

The pilot additionally requires minimum role and tenant scoping, private media, notices and permissions, retention/deletion handling, notifications, restore rehearsal and an operating fallback. Voice, segmentation, maps, WhatsApp Business, broad offline synchronization and MCP remain deferred until the core acceptance passes. These features are not included in the commercial promise merely because they appear in a longer idea list.

Do not sell ERP/CMMS replacement, inventory/procurement automation, emergency dispatch, a public city complaint service, predictive maintenance or autonomous safety decisions. Customers with a working CMMS may need an export companion rather than a second work-order authority. Record the chosen system of record and external IDs before integration.

## Delivery shape for 2-4 people

P leads product/commercial work; E builds application/backend; A handles AI/evaluation; Q handles UX/QA/customer enablement. With two people combine P+Q and E+A and reduce scope. This allocation does not assume four full-time employees. A 10-day hackathon proves a coherent synthetic workflow. It does not establish production readiness, procurement, compliance or financial value.

## Scope change and next action

Accept a new requirement only when P records buyer, problem, measurable result, data impact, delivery effort and what will be removed or deferred. Security readiness is not optional scope. Decline a pilot dependent on unbuilt emergency handling, extensive migration or unrestricted integrations. At week 8, choose paid continuation, targeted revision or stop using the pre-agreed gates in [field validation](../01-research/field-validation.md). P's next task is a one-page site scope with named supervisor, categories, exclusions, baseline access and buying decision date. See [business model](business-model.md).
