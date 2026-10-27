# Meta Global AI Developer Hackathon

The event page is the source of truth for every hackathon decision in this repo: dates, tracks, themes, allowed models and submission rules. When this file and the page disagree, the page wins; update this file in the same commit you notice the change.

- Event page: https://cerebralvalley.ai/e/meta-ai-developer-hackathon
- Registered-events view: https://cerebralvalley.ai/e/meta-ai-developer-hackathon?modalCloseUrl=%2Fevents%2Fregistered
- Team profile (Akmal Muzakki): https://cerebralvalley.ai/u/akmalmzkki

Captured from the public event page on 2026-10-27. Content behind the login (application status, Official Rules, the submission form) was not visible and is not reflected here.

## Event at a glance

| Item       | Value                                                                                |
| ---------- | ------------------------------------------------------------------------------------ |
| Hosts      | Meta and Cerebral Valley                                                             |
| Format     | Remote, worldwide, free to enter if selected                                         |
| Window     | Oct 26, 12:00 PM to Nov 4, 9:00 PM (Eastern), ten days                               |
| Prize pool | $1,000,000 cash across two tracks                                                    |
| Support    | Live workshops from Meta and partners, office hours on Discord                       |
| Cap        | Up to 20,000 accepted applicants                                                     |
| Rules      | Official Rules published before Oct 26 and must be accepted by selected participants |

## Key dates

Times are US Eastern as shown on the page. WIB (UTC+7) is added for planning; US daylight saving ends on Nov 1, so Eastern is UTC-4 before that date and UTC-5 after it.

| Date         | Event                                              | WIB                |
| ------------ | -------------------------------------------------- | ------------------ |
| Oct 26       | Kickoff livestream, hackathon begins (12:00 PM ET) | Oct 26, 11:00 PM   |
| Oct 27–Nov 4 | Workshops and Discord office hours                 |                    |
| **Nov 4**    | **Project submissions due, 9:00 PM ET**            | **Nov 5, 9:00 AM** |
| Nov 4–Nov 8  | Judging                                            |                    |
| Nov 9        | Closing ceremony, live finals, winners announced   |                    |

Treat **Nov 4, 9:00 PM ET / Nov 5, 9:00 AM WIB** as a hard deadline and aim to submit a day early. Dates can change at Meta's discretion; recheck the page before each milestone.

## Models and tooling

The event is about building with Meta's newest models:

- **Meta Model API**: Muse Spark series, Muse Wonder, Muse Image, SAM 3.1
- **Meta open-weights models**, which can be run through inference partners
- **Muse Code**, Meta's coding agent

Inference partner credits, offered to select participants:

| Partner   | Offer                                                                                    |
| --------- | ---------------------------------------------------------------------------------------- |
| Baseten   | $100 credits and 2M TPM rate limits for Meta open-weights models                         |
| Modal     | $100 credits for Meta open-weights models via Endpoints, plus serverless GPUs, sandboxes |
| Fireworks | $25 credits for Meta open-weights models, plus a workshop with Sinan Ozdemir             |

## Tracks

Every project enters exactly one track.

| Track           | For                                   | Judged on                                                 |
| --------------- | ------------------------------------- | --------------------------------------------------------- |
| Indie developer | Individual builders and students      | Creativity, technical ambition, and whether it works      |
| Startup         | Teams and founders building a product | Technical execution and whether it holds up in production |

## Themes

- **Build for Your World**: bring Meta's models into a domain you know firsthand, free up time and mental space, make something possible that wasn't before.
- **Push the Frontier**: use the models on challenges in software, robotics, manufacturing, energy, materials and beyond.

StreetProof fits **Build for Your World**: facility operators in Indonesia turning damage reports into verified repair work.

## Eligibility notes

Open worldwide except where local law prohibits participation or receiving an award, and except sanctioned countries and regions listed on the page. Employees, contractors and interns of Meta and Cerebral Valley, government-affiliated individuals, and their immediate families and households are not eligible. Duplicate applications, false identity information or spam are disqualified.

## What this means for StreetProof

- **Scope for the deadline.** The plan's hackathon stage is one complete report-to-`verified_closed` flow on synthetic data (`plan/en/00-foundation/project-charter.md`). Everything else waits.
- **Meta models are required, not optional.** The AI adapter in ADR-006 must call the Meta Model API (a Muse Spark model for the structured draft and missing-context check). Assumption A-04 (Meta API access, schema output, cost, limits) is now the first thing to verify.
- **SAM 3.1 and Muse Image are on the menu.** Decision D-09 defers SAM until the core flow works. Keep that order, but if time remains, SAM 3.1 on completion photos (highlighting the repaired area) is the most natural showcase. Record the change in the decision register if it happens.
- **Track choice is open.** The indie track rewards ambition and a working demo; the startup track rewards production robustness. Decide before submission and note it here.
- **Synthetic data only.** No real reports, photos or names in the demo, consistent with `AGENTS.md`.

## Open items

- [ ] Read the Official Rules (behind login) and add the submission requirements here: deliverables, demo video length, repo visibility, team size, license or IP terms. This closes assumption A-11.
- [ ] Confirm application acceptance and team members on the Cerebral Valley profile.
- [ ] Get Meta Model API access working and record the model IDs used (A-04).
- [ ] Choose a track.
- [ ] Claim any partner credits only if the demo needs open-weights models.
