# Hackathon, submission and demonstration

Document ID: APP-03  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/07-appendices/hackathon-and-demo.md)

## Event facts and verification limits

[EV-01: Cerebral Valley event page](https://cerebralvalley.ai/e/meta-ai-developer-hackathon) was read through Jina on 20 October 2026. It describes a global virtual event, participant selection, two tracks, a USD1,000,000 total prize pool and final rules to be published before the event. This establishes neither team acceptance, credits nor compliance with final rules.

| Page milestone | Source time, not converted |
| --- | --- |
| Applications open | 13 October 2026, 09:00 ET |
| Applications deadline | 25 October 2026, 23:59 ET; earlier if capacity reached |
| Approval notification | 26 October 2026, by 09:00 ET |
| Hackathon start | 26 October 2026 |
| Workshops | 27 October-4 November 2026 |
| Project submission | 4 November 2026, 21:00 ET |
| Judging | 4-8 November 2026 |
| Closing | 9 November 2026 |

The date list uses ET while a search-result display previously used EST. Preserve source timezone in the checklist and confirm final timing before converting to Asia/Jakarta. Do not compute an ET deadline by applying a permanently fixed offset. Set an internal buffer once official timing is confirmed.

## Track and eligibility

Indie addresses individuals/students; Startup addresses teams/founders building products. For this 2-4-person B2B team, inspect Startup eligibility first without assuming automatic qualification. P checks membership, team-size limits, pre-event work, intellectual property, dataset/model licenses, service use, submission format and prize terms in applicable rules. Unpublished items remain unverified rather than unrestricted.

## Submission checklist

- [ ] Registration/selection and track are actually confirmed.
- [ ] Final rules are read with access date/version recorded.
- [ ] Meta model access is tested through an authorized account; real use is distinguished from mocks.
- [ ] Data is permissioned or synthetic without sensitive identities.
- [ ] Video, README, architecture, demo/repository links and requested formats are ready.
- [ ] Demo is repeatable with manual fallback and a backup recording.
- [ ] Secrets are absent from recordings, screenshots, logs and public repository.
- [ ] Metric claims explain n, method and synthetic versus measured data.

The checklist remains unchecked because this work produces documentation only.

## 90-second demonstration script

| Time | Scene | Evidence shown |
|---|---|---|
| 0-10 seconds | Reporter finds a non-emergency leak in a synthetic case | Initial photo and user-entered location |
| 10-25 seconds | Report becomes a structured draft | Summary, category, missing context and sources |
| 25-40 seconds | Operator corrects and reviews duplicates | Both reports retained, human decision |
| 40-55 seconds | Assignment and technician work | Owner, status, checklist and blockers |
| 55-75 seconds | After-proof and supervisor decision | Reject bad proof, then verify sufficient proof |
| 75-90 seconds | Reporter status and dashboard | Shared event source, outcome limits and pilot plan |

## Dataset and difficult cases

Prepare synthetic fixtures: clear report, blurry photo, missing location, unsupported category, similar locations, true duplicate, wrong-object after-photo, model timeout, invalid token and reopen. Fixtures specify expected behavior without claiming general accuracy. Keep synthetic labeling visible.

Prioritize the complete workflow before voice/SAM/MCP. Add segmentation only when marking an area helps the user task. Do not use photo demonstrations to establish structural safety. The 10-day work sequence follows [implementation-roadmap](../05-delivery/implementation-roadmap.md).
