# Meta Model API

What StreetProof can consume from Meta, and where each piece fits the plan. Meta's docs are the source of truth for APIs, prices and limits: https://dev.meta.ai/docs/overview. Read on 2026-10-30; recheck before relying on a number.

Plan references: AI pipeline `plan/en/04-technical/ai-pipeline-and-evaluation.md`, ADR-004 and ADR-006 in `plan/en/04-technical/architecture-decisions.md`, D-06 and D-09 in `plan/en/00-foundation/decision-register.md`.

## Probe result (2026-10-30)

This closes the access part of assumption A-04. A one-off call with the team's key confirmed:

- `GET /v1/models` returns `muse-wonder-1.0`, `muse-spark-1.3`, `muse-spark-1.2`, `muse-spark-1.1`, `muse-spark-1.3-contributor`, `muse-spark-1.2-contributor`, `sam-3.1`, `muse-image-1.0`, `muse-voice-transcribe-1.0`.
- `POST /v1/responses` on `muse-spark-1.3` with a base64 image, Indonesian instructions, `store: false`, `reasoning.effort: "low"` and a strict `text.format` schema returned valid JSON in Indonesian in 4.7 s.
- Usage was 382 input and 505 output tokens, 402 of them reasoning. That is about $0.0026 at Standard prices. Reasoning tokens bill as output, so effort is the main cost control.

One call on a non-damage image proves access and request shape only. SAM and Muse Voice Transcribe were called later, when they were built (see [Stretch features](#stretch-features)).

## First worker run (2026-10-30)

Three reports through `apps/worker`, using one synthetic leak photo generated with Muse Image:

| Report                             | Result                                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Indonesian text + photo            | Indonesian draft: plumbing, high priority, photo facts and reporter context kept separate                                                                  |
| Prompt injection text + same photo | Ignored the instructions, noted them in `limitations`, gave priority `unknown`, invented no location, and flagged the first ticket as a possible duplicate |
| Indonesian text, no photo          | Electrical, priority `unknown`, and said the lack of a photo limited the assessment                                                                        |

The three drafts took 8 to 11.4 s and cost about $0.03 in total, roughly $0.01 per draft, of which reasoning is a large share. This is a smoke test on three cases, not an evaluation: the plan's 60-case set hasn't been run, and the photo is generated rather than real.

## First proof comparison run (2026-10-31)

Two pending demo attempts through `runProofCheckJob`, using generated photos. The worker skipped the seven decided attempts without calling the model.

| Attempt                       | Result                                                                                | Time  | Cost    |
| ----------------------------- | ------------------------------------------------------------------------------------- | ----- | ------- |
| New ceiling panel             | Same location, stain not visible; noted that photos can't show moisture above it      | 5.7 s | $0.0055 |
| Door photo as proof of a leak | Different location; asked for a photo of the sink, and noted the door shows no repair | 9.3 s | $0.0081 |

The second run also said the problem was `not_visible`, which reads as good news, so the worker now turns that into `unclear` when the location differs. This is a smoke test on two generated cases, not an evaluation.

## Connection

| Item     | Value                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| Base URL | `https://api.meta.ai/v1`                                                                                       |
| Auth     | `Authorization: Bearer <key>`; keys look like `LLM_<id>_<secret>`                                              |
| Our env  | `META_API_KEY`, `META_API_BASE_URL`, `META_MODEL` in the root `.env`                                           |
| Client   | Plain `fetch` in `apps/worker/src/meta-client.ts`; the `openai` SDK also works with `baseURL` and `apiKey` set |
| Protocol | Responses API (`POST /v1/responses`), Meta's default for new work                                              |

Meta's examples name the key `MODEL_API_KEY`; ours is `META_API_KEY`. No SDK reads either automatically, so pass it explicitly. The key stays server-side (worker and server code only), never `NEXT_PUBLIC_`. Rate limits are per team, shared by every key.

## What to use

| Capability              | Model                       | Price                                | StreetProof use                                      | Plan status          | Decision                |
| ----------------------- | --------------------------- | ------------------------------------ | ---------------------------------------------------- | -------------------- | ----------------------- |
| Image understanding     | `muse-spark-1.3`            | $1.25 in, $4.25 out, $0.15 cached /M | Structured intake draft from photo + Indonesian text | Core (ADR-006)       | **Build for the demo**  |
| Structured output       | same                        | same                                 | Guarantees the draft JSON shape                      | Core (strict schema) | **Build for the demo**  |
| Prompt caching          | same                        | automatic                            | Stable prompt first, report and photos last          | Not in plan          | **Use, no code needed** |
| Perception grounding    | same                        | no extra charge                      | Box on the visible damage, fallback for SAM          | D-13                 | **Built**               |
| Before/after comparison | same                        | same                                 | Supervisor hint: what differs, what proof is missing | D-12, hint only      | **Built**               |
| Segmentation            | `sam-3.1`                   | $2.50 per 1,000 images               | Pixel mask over the reported damage                  | D-13                 | **Built**               |
| Speech to text          | `muse-voice-transcribe-1.0` | $0.18 per audio hour                 | Reporter voice note to text they check               | D-13                 | **Built**               |
| Image generation        | `muse-image-1.0`            | $0.01 per image                      | Synthetic demo and evaluation photos, offline only   | Not in plan          | Tooling only            |

## What not to use

- **Muse Wonder** ($4 in, $20 out per million, preview): built for long coding and agent runs. Too expensive for intake and adds nothing there. Fine for development through Muse Code.
- **Contributor models**: Meta may train on the content. D-06 keeps real data on Standard mode. Allowed only for evaluation runs on fully synthetic data, and they cap at 150 requests per minute.
- **Tool calling and tool search**: the plan gives the model no path to mutate data. The worker passes duplicate candidates in the prompt and validates any returned ID against the same tenant and site.
- **Search grounding**: $2.50 per 1,000 queries and irrelevant. It would also send report content toward web queries.
- **Files API for report photos**: uploads never expire unless `expires_after` is set, and they would leave a second copy of evidence outside our bucket. Send photos inline.
- **Background responses**: the request body is capped at 1 MiB, too small for inline photos. Our own outbox worker already provides the async layer.
- **Open weights (Muse Spark Open, Muse Glimmer)**: self-hosting GPUs conflicts with D-05's low-operations goal. Muse Spark Open through a partner (Baseten, Modal, Fireworks) is a later option if a pilot needs different data terms.

## Intake draft call

This implements the pipeline in the plan, from `J[Durable job]` to `S[Parse strict schema]`:

1. The worker claims an outbox job and reads the photo bytes from MinIO. Send them as a base64 `data:` URL in an `input_image` block. A signed URL won't work: Meta's servers fetch URLs themselves and can't reach a local or private bucket.
2. Put images in the `user` message only; the model ignores them on other roles. Up to 50 images per request and 50 MB inline, in JPEG, PNG, GIF or WebP.
3. Order the input for caching: stable instructions and category list first, then report text and photos.
4. Set `store: false`, so Meta keeps no retrievable response and we don't need `previous_response_id`. Caching still works.
5. Set `text.format` (not `response_format`, which is the Chat Completions name) to `{ type: "json_schema", name, strict: true, schema }`.
6. Start with `reasoning.effort: "low"` and compare against higher effort in evaluation. `max_output_tokens` includes reasoning tokens, so a tight limit can cut off the answer.
7. Send `safety_identifier` as a hash of the tenant or user ID, never an email or name.

Schema rules with `strict: true`:

- The root is a plain object, and every object sets `additionalProperties: false`.
- `required` lists every property. Express an optional field as nullable, using `anyOf` with `null`.
- `oneOf`, `allOf` and recursive schemas aren't allowed. Nesting is limited to 10 levels.

The plan's draft schema fits these rules. `categoryCandidate` can be an enum built from the site's category list plus `unknown`.

## Errors mapped to AI states

The plan's states are in the pipeline page's async failure policy. The worker classifies each failure this way:

| Response                                               | Meaning                          | Plan state         | Action                                   |
| ------------------------------------------------------ | -------------------------------- | ------------------ | ---------------------------------------- |
| 429 `rate_limit_error`                                 | Over the team limit              | `failed_retryable` | Backoff with jitter; honor `Retry-After` |
| 500, 503 (`service_overloaded`, `backend_unavailable`) | Transient server failure         | `failed_retryable` | Backoff, at most three attempts          |
| 504 `gateway_timeout`                                  | Non-streaming call ran too long  | `failed_retryable` | One retry, then manual                   |
| 400 `content_policy_violation`                         | Media denied by content policy   | `failed_terminal`  | Manual triage; don't resend              |
| 400 other (undecodable image, bad schema)              | Our request is wrong             | `failed_terminal`  | Manual triage; log `message` and `param` |
| 401, 402, 403                                          | Key, billing or permission issue | `failed_terminal`  | Open the circuit breaker; alert the team |
| 404 with an empty body                                 | Wrong path                       | `failed_terminal`  | A code bug; don't parse JSON             |

A failure never changes the ticket status. The operator triages manually, as ADR-004 requires. Successful responses carry `x-ratelimit-remaining-*` headers if we need to slow down early.

## Limits that matter

| Model            | Requests per minute | Tokens per minute | Note                                |
| ---------------- | ------------------- | ----------------- | ----------------------------------- |
| `muse-spark-1.3` | 3,000               | 4,000,000         | Confirmed by response headers       |
| `sam-3.1`        | 3,000               | none              | Billed per image                    |
| `muse-image-1.0` | 150                 | none              | Billed per image                    |
| Voice            | none                | none              | 256 concurrent, 16,000 streams/hour |

## Stretch features

**Perception grounding.** Spark returns boxes on a 0 to 1000 grid when the prompt asks for them. It needs no second model, and the overlay is CSS percentages (value / 10). Clamp values, since they can exceed 1000 at the image edge, and keep the box tied to the exact image that was sent. Meta advises a direct prompt with a minimal system prompt. Built as the fallback when SAM finds nothing, in `apps/worker/src/locate-damage-job.ts`, and shown as "AI suggested area", never as a measurement.

**SAM 3.1.** Send a short noun phrase naming one object, such as "water stain", on `POST /v1/responses`. It returns a box and a mask per match as special-token text; the `@meta-sam/parser` package decodes it, so don't hand-parse the base85 masks. Zero matches is a valid empty result. Built: the draft's `damagePhrase` goes to SAM once the draft succeeds. In the real run on two photos, one got a SAM mask and one fell back to the grounding box.

**Muse Voice Transcribe.** `POST /v1/asr/transcribe` with the default `PUSH_TO_TALK` mode suits a voice note. Indonesian is among its 25 languages. It takes WAV only in practice, as a multipart `request` plus `audio`, so the browser encodes WAV itself (`apps/web/src/lib/wav.ts`) rather than sending what `MediaRecorder` produces. Built on the report form: the text lands in the description for the reporter to check, and the audio isn't kept. Tested in real Chromium with a fake microphone, not on a real phone.

**Muse Image.** Useful for generating the plan's synthetic evaluation cases and demo photos: leaks, cracks, broken fixtures. Label them synthetic in fixtures and in the demo. A generated image must never enter the product as evidence, and scores measured on generated photos say little about real ones. The 32 evaluation photos in `py/ai-eval/fixtures` came from it.

## Evaluation

`py/ai-eval` holds 92 synthetic cases, and [`py/ai-eval/results/report.md`](../py/ai-eval/results/report.md) holds the latest scores. The run used `muse-spark-1.3-contributor`, allowed here only because the data is fully synthetic. One reviewer labelled it and the photos are generated, so the numbers describe these cases and say little about real sites. Priority was the weakest area: 23 of 30 plausible on held-out cases, because the model rates minor problems higher than the labels. A draft took 13.2 s at p50 and 17.3 s at p95.

## Data and availability

- **Training:** Standard models don't train on our content, per Meta's docs. This matches D-06. The plan's caution stands: Standard isn't a zero-retention or compliance promise. The docs mention zero data retention only in passing for voice pricing, so terms for real data need review before a pilot.
- **Geography:** Indonesia isn't on the restricted list in the Geographic Use Policy (updated 2026-10-12). Muse Image's only model-specific restriction is India. This is an availability check, not legal advice; the Terms of Service weren't reviewed.
- **Prompt injection:** treat text inside photos and reports as data. The schema constrains the output's shape, not the truth of its claims, so the plan's policy and evidence checks still run after parsing.

## Plan changes this suggests

Not applied yet; it needs the owner's decision.

1. **Pin `muse-spark-1.3`** in ADR-006 after evaluation on real test cases.
