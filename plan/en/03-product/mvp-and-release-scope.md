# MVP, pilot and commercial release scope

Document ID: PRD-04  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/03-product/mvp-and-release-scope.md)

## Prioritization rules

Must means the core flow is unacceptable without the capability. A pilot is not a demonstration opened to real data: it needs additional data and operating controls. Broad catalog units contribute only the required slice. Every addition displaces work and needs an owner and acceptance criteria.

| Capability | Hackathon | Pilot | Commercial |
| --- | --- | --- | --- |
| Photo+text intake/manual location | Must | Must | Core |
| Voice/transcription/video | Defer | Conditional experiment | Only after measured value |
| AI draft and clarification | Must; manual fallback | Measured correction/evaluation | Versioned evaluation |
| Duplicates | Candidate + human link | Quality tracking + unlink | Configurable thresholds |
| Assignment | Manual | Rules approved by owner | Integration only when needed |
| Technician statuses and blockers | Core transitions | Draft durability and low-bandwidth test | Full offline only if justified |
| Evidence and supervisor | Must | Category policies + exceptions | Sampling and quality operations |
| Reporter status | Receipt + scoped token | Approved notifications + recovery | Tenant configurable |
| Dashboard | Queue + elapsed-time basics | Agreed SLA and matched baseline | Multi-site only when justified |
| Security | Synthetic data + role/tenant gates | Private data readiness + restore | Assurance and support governance |
| QR/maps | Optional QR, no map dependency | QR when location burden warrants | Provider/region reviewed |
| Government integration | Excluded | Excluded unless authorized separate scope | Authorization-led project |
| MCP/BI/ERP | Defer | Export first | Customer-dependent |

## Definition of ready

The demo is ready to build when synthetic sites/categories, roles, required fields, transitions and rejection scenarios are agreed. Test model access before locking demo dependencies; mocks are development aids and must be labeled if shown. Public documentation does not establish account readiness or acceptance of event terms.

The pilot is ready when sponsor/operators/technicians/supervisors are identified, data permission and retention approved, baseline designed, and restore/cross-role access tested. Emergency contacts and SOP are organization configuration rather than guessed telephone numbers. A commercial offer requires clear scope, support, payment, exit and risk owners.

## Definition of done by stage

Demo: a new case, ambiguous case, duplicate and rejected-proof case can be replayed to correct states; the dashboard uses the same data; every demo figure is labeled synthetic. Pilot: these behaviors work on permissioned data while active handling time, technician input, model failures and incidents are recorded. Commercial: tenant operations, support, offer-bounded billing, export/deletion and cost tracking have owners.

## Scope control for two people

Combine P+Q and E+A. Retain photo+text and manual assignment. Defer transcription, SAM, automated routing, maps, external integration and full offline sync. Use approved static category checklists. If capacity remains insufficient, reduce categories and screens before removing authorization or supervisor review.

## Changes requiring a decision

An integration, extra model or required-field request states user pain, observed friction, displaced work, operating cost, owner and acceptance scenario. Customer-specific requests do not become general features without repeated need. See [work-breakdown-and-estimates](../05-delivery/work-breakdown-and-estimates.md).
