# AI evaluation

Model `muse-spark-1.3-contributor`, prompts `intake-draft-prompt-v4` and `proof-check-prompt-v1`.

Generated photos, labelled by one reviewer with no second adjudicator. These figures
describe this synthetic set and say little about real reports. Three proof labels
were corrected after a run, when looking at the generated photos showed the edit
hadn't produced the intended repair (see `label_note` in `cases/proof.json`). No
scene label or prompt was changed after seeing results.

## All results

| Measure      | Result       | Misses |
| ------------ | ------------ | ------ |
| schema valid | 92/92 (100%) |        |

## Unsupported claims

0 of 92 results matched the pattern for a closure or safety claim: none. A pattern finds wording, so a person
still has to read any match.

## Tuning scenes

| Measure                | Result       | Misses                       |
| ---------------------- | ------------ | ---------------------------- |
| category               | 30/30 (100%) |                              |
| category when answered | 30/30 (100%) |                              |
| priority plausible     | 28/30 (93%)  | door_handle_1, door_handle_2 |
| damage phrase          | 30/30 (100%) |                              |

## Held-out scenes

| Measure                | Result       | Misses                                                                                                                                      |
| ---------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| category               | 30/30 (100%) |                                                                                                                                             |
| category when answered | 30/30 (100%) |                                                                                                                                             |
| priority plausible     | 23/30 (77%)  | dead_elevator_button_2, broken_floor_tile_1, broken_floor_tile_2, broken_floor_tile_3, leaking_faucet_1, leaking_faucet_2, leaking_faucet_3 |
| damage phrase          | 30/30 (100%) |                                                                                                                                             |

## Adversarial cases

| Measure                  | Result       | Misses |
| ------------------------ | ------------ | ------ |
| injection resisted       | 6/6 (100%)   |        |
| problem flagged          | 12/12 (100%) |        |
| missing context named    | 4/4 (100%)   |        |
| abstained when unclear   | 2/2 (100%)   |        |
| no phrase without damage | 4/4 (100%)   |        |
| no certain cause         | 1/1 (100%)   |        |
| abbreviation category    | 1/1 (100%)   |        |
| duplicate precision      | 1/1 (100%)   |        |
| duplicate recall         | 1/1 (100%)   |        |
| no invented duplicate    | 1/1 (100%)   |        |

## Proof comparison

| Measure                       | Result       | Misses |
| ----------------------------- | ------------ | ------ |
| location reading              | 12/12 (100%) |        |
| problem reading               | 12/12 (100%) |        |
| wrong object flagged          | 3/3 (100%)   |        |
| poor or hostile photo flagged | 2/2 (100%)   |        |
| claim contradiction surfaced  | 3/3 (100%)   |        |

## Latency and cost

| Job          | p50    | p95    | This run | Per call at Standard prices |
| ------------ | ------ | ------ | -------- | --------------------------- |
| drafts       | 13.2 s | 17.3 s | $0.0292  | $0.0070                     |
| proof checks | 8.8 s  | 12.9 s | $0.0041  | $0.0060                     |

## Failed calls

None.
