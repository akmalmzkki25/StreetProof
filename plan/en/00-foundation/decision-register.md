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
| D-11 | Self-hosted PostgreSQL and S3-compatible object storage (MinIO) in Docker; authentication in the application; supersedes ADR-002 | Team already runs these services in Docker; no vendor account or service keys needed for the hackathon; plain SQL migrations stay portable | Supabase (ADR-002) | Hosted deployment needs managed backups or row-level security the team cannot operate |
| D-12 | Muse Spark compares before and after photos as an unverified hint for supervisors; extends ADR-004's assistance scope ahead of its evaluation, for the hackathon on synthetic data only | Evidence review is the product's core, and a wrong-object photo is cheap to spot; the schema has no verdict field and the hint can't change status or block a decision | No AI on completion proof; AI that accepts or rejects proof | Evaluation shows supervisors follow wrong hints, or real data enters before that evaluation |
| D-13 | SAM 3.1 outlines the reported damage and Muse Voice Transcribe turns a reporter's voice note into text they check, both ahead of D-09's condition, for the hackathon on synthetic data only; the evaluation harness may use a Contributor model because its data is fully synthetic | The owner chose to build them after the core flow worked; an outline only points at an area and a transcript is edited before sending, so neither can decide anything | Keep D-09 and defer both; send real reports to a Contributor model | Real data enters, outlines mislead operators, or transcripts prove unreliable on real phones |
| D-14 | A Telegram bot reaches reporters, technicians and supervisors, ahead of D-09's condition, as a separate `apps/telegram-bot` process using long polling. It calls the same commands and permission checks as the web app, and a supervisor still decides with a written reason after seeing the photos | The owner chose it; chat is where field staff already are, and no rule changes because every action passes the existing guards | WhatsApp, which needs business verification and paid messages; notifications only | Real data enters, since messages and photos pass through Telegram's servers; or a second instance is needed, since only one process can poll a token |
| D-15 | StreetProof is built as a real product a building team can start from an empty database; the hackathon deadline orders the work but doesn't narrow it. This adds site and location management, a printable QR poster, per-site time zones (WIB, WITA, WIT) and open-source maps: MapLibre with OpenFreeMap tiles, and Photon address search through our server. A reporter's map pin is optional and never goes to a model | The owner asked for a real product rather than a demo, and for maintained libraries over hand-written code | Keep the demo seed as the only way in; Google Maps, which needs a key and billing; the public Nominatim server, which forbids autocomplete | Real data enters before the geocoder is self-hosted, or tile use outgrows OpenFreeMap's free service |

## Consequences and change costs

D-01 determines offer language, interview participants and demo categories. If wrong, change the ICP and sample data before adding features. D-02/D-09 postpone integrations but protect team capacity. D-03/D-04 add authorization and review work; removing them risks misleading reporters or exposing data.

D-05 reduces service variety but ties jobs, deployment and observability to the selected stack. Reassess when Python skills dominate or region/contracts do not fit. D-06 avoids training-data contribution without permission; token costs may be higher. D-07 needs transparent usage boundaries. D-08 saves development work but requires measurement discipline.

## Change procedure

P records date, proposer, new evidence, previous/new decision, affected documents and people to inform. E checks contracts/data changes; A checks evaluation; Q checks user flows. Changes to IDs, states, required fields or metric definitions require both-language review. See [architecture-decisions](../04-technical/architecture-decisions.md) for technical consequences.
