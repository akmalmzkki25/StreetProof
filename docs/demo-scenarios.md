# Demo scenarios

`pnpm db:seed:demo` wipes the local database, reseeds the synthetic tenants and replays the cases below through the same commands the app uses. Only the timestamps are moved afterward, to give the tickets a history. Every figure is synthetic and the dashboard labels it so.

The command prints four reporter status links once. Sign in with the demo accounts on `/login` (shown under `next dev`, password in `packages/db/src/demo.ts`).

## Cases

| Case                                 | State after the seed                 | What it shows                                                        |
| ------------------------------------ | ------------------------------------ | -------------------------------------------------------------------- |
| Two reports of one pantry leak       | New report, AI draft job waiting     | Real Muse Spark drafts once the worker runs; link the duplicate live |
| Vague report with a dark photo       | Needs clarification, question open   | Reporter answers on `/status`                                        |
| Corridor lights                      | Needs clarification, answer waiting  | Queue marks "Reporter answered"; operator returns it to triage       |
| Ceiling stain, model timed out       | New report, draft failed             | Manual triage still works                                            |
| Crack in the parking floor           | Ready to assign                      | Operator assigns a technician                                        |
| Air conditioner drip                 | Assigned                             | Technician accepts                                                   |
| Toilet running, plus a linked report | In progress, one duplicate linked    | Both reports kept; the duplicate's reporter follows this work        |
| Exhaust fan                          | Waiting for parts                    | Blocker with a reason                                                |
| Sagging ceiling panel                | Second proof waiting, first rejected | Supervisor verifies, with the wrong-object attempt on record         |
| Leaking pipe joint                   | Proof rejected                       | Technician has to redo it                                            |
| Four closed tickets                  | Verified closed                      | Elapsed times and 14-day rates; one closed too late to count         |
| Crumbling parking floor              | Reopened, in progress                | Repair that didn't hold                                              |
| Noise complaint                      | Cancelled                            | Not a repair, closed with a reason                                   |

## The model only runs when you start the worker

Only the two new reports keep a pending draft job. Everything else is closed as "Not needed" at seed time, so the seed itself spends nothing. Each draft costs about $0.01. Returning an answered report to triage queues one more.

Don't run the database tests while demo data is loaded: the worker tests claim the oldest pending job. Run `pnpm db:seed` first, then `pnpm db:seed:demo` again when you're done.

## Photos

The seed uses the AI-generated images in `packages/db/fixtures/demo-photos/`, one per scene in `DEMO_SCENES`. They show no real site or person, so say they are generated if asked. A scene without a file falls back to a drawing from `packages/db/src/demo-photos.ts`, which the model reports as an illustration. Never add a photo of a real site or a real person.
