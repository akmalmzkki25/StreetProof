# Decision register

Document ID: FND-03  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/00-foundation/decision-register.md)

## Decision status

Every row is an author-proposed planning decision, not buyer approval. P resolves review with E/A/Q by domain. Business choices may change after discovery; access controls and verification are not weakened to fit a demonstration.

| ID | Proposed decision | Rationale | Alternative | Review trigger |
| --- | --- | --- | --- | --- |
| D-01 | First segment: commercial buildings; campus alternative | Operational buyer and vendor workflow; analyst hypothesis | Campus with stronger sponsor/data readiness | No accessible building pilot during discovery |
| D-02 | Bound product to intake through verification | Small team must finish one complete cycle | Full ERP/CMMS | Buyers obtain value only through complete system replacement |
| D-03 | Humans decide consequential priority and closure | Model lacks authority over safety/final quality | AI closes tickets | Data-owner SOP changes; risk review still required |
| D-04 | Random reporter-status token | Show progress without an account or tenant-data exposure | Public sequential-ID lookup | Token compromise or authentication required by policy |
| D-05 | TypeScript modular monolith + PostgreSQL worker | Reduce runtime variation and operations burden | Separate FastAPI/microservices | Team skills or Python AI experiments demonstrably dominate |
| D-06 | Standard mode for real pilot data | Do not silently trade training contribution for discounts | Contributor mode | Data-owner approval and contract review change |
| D-07 | Per-site pricing as an experiment | Avoid billing reporters or discouraging valid reports | Per-report or per-reporter pricing | Volume/support makes site unit uneconomic |
| D-08 | External baseline allowed; measurement required | ROI depends on method rather than an automated timer | Build a complete ROI module before learning | Timing records cannot be audited |
| D-09 | Voice/SAM/WhatsApp/MCP after core flow | Complexity needs evidence of benefit | Model stacking for demonstration | Observed blocker requires that capability |
| D-10 | Bilingual documentation with shared IDs | Avoid two divergent specifications | English summary only | Any language change must propagate to its counterpart |

## Consequences and change costs

D-01 determines offer language, interview participants and demo categories. If wrong, change the ICP and sample data before adding features. D-02/D-09 postpone integrations but protect team capacity. D-03/D-04 add authorization and review work; removing them risks misleading reporters or exposing data.

D-05 reduces service variety but ties jobs, deployment and observability to the selected stack. Reassess when Python skills dominate or region/contracts do not fit. D-06 avoids training-data contribution without permission; token costs may be higher. D-07 needs transparent usage boundaries. D-08 saves development work but requires measurement discipline.

## Change procedure

P records date, proposer, new evidence, previous/new decision, affected documents and people to inform. E checks contracts/data changes; A checks evaluation; Q checks user flows. Changes to IDs, states, required fields or metric definitions require both-language review. See [architecture-decisions](../04-technical/architecture-decisions.md) for technical consequences.
