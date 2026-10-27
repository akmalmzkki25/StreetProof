# Infrastructure and costs

TECH-08 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../id/04-technical/infrastructure-and-costs.md)

Contents: [Recommendation and assumptions](#recommendation-and-assumptions) · [Official list prices read on 2026-10-20](#official-list-prices-read-on-2026-10-20) · [Workload and unit-cost simulation](#workload-and-unit-cost-simulation) · [Full budget and controls](#full-budget-and-controls) · [Dependencies and next action](#dependencies-and-next-action)

## Recommendation and assumptions

Budget a managed web service, separate worker and Supabase project before real data. Keep compute close to the database where approved; Singapore is conditional on service availability and data-owner/transfer review. [Render regions](https://docs.render.com/regions) (T-10) lists Singapore and requires a new service to move regions. Do not treat geographic proximity as proof of lawful transfer or measured latency.

Choose paid production services after a benchmark. A 512 MB instance may fail during build or image decoding; the proposed pilot planning case uses 2 GB for web and worker. No infrastructure has been bought or deployed. Currency conversion below uses USD 1 = IDR 16,000 only as a scenario, not a current exchange quote.

## Official list prices read on 2026-10-20

| Component | Official listed amount | Limitation |
| --- | --- | --- |
| Supabase Pro | From USD 25/month, first project included; additional projects from USD 10 | Plan and compute rules apply; excludes overages/add-ons |
| Supabase included Pro quotas | 8 GB DB/project, 100 GB file storage, 250 GB uncached and 250 GB cached egress | Shared usage rules must be checked per organization |
| Supabase storage overage | USD 0.0213/GB/month | Does not cover egress/transforms |
| Supabase daily DB backups | Seven days on Pro | Verify object backup separately |
| Supabase PITR | About USD 100/month for seven-day recovery window | Eligibility/compute and actual billing must be checked |
| Render workspace | Hobby USD 0; Pro USD 25/month, compute additional | Select plan for actual team/governance requirements |
| Render web/worker compute | USD 7/month for 512 MB; USD 25/month for 2 GB, per service | Availability, workload and billing duration matter |
| Muse Spark Standard | USD 1.25 input, 4.25 output, 0.15 cached input per 1M tokens | Actual image tokenization, access, retries and model must be measured |

Prices are vendor facts, not customer quotes: [Supabase pricing](https://supabase.com/pricing) (T-09), [backups](https://supabase.com/docs/guides/platform/backups) (T-08), [Render pricing](https://render.com/pricing) (T-13), [Meta pricing](https://dev.meta.ai/docs/pricing-rate-limits) (T-11). Recheck before approval. Do not assume promotional credits, discounts, tax inclusion, exchange rates or account eligibility. Contributor pricing is excluded because training permission is not the proposed real-data default.

## Workload and unit-cost simulation

Assume two sanitized photos averaging 1 MB each per ticket and 90-day operational retention approximated as three months. Ignore derivative/backup overhead only for the first estimate, then add it to the measured bill. Retained media is approximately `tickets_per_month * 2 * 0.001 GB * 3`; decimal MB/GB are used consistently.

AI simulation assumes 1,500 billable input-equivalent tokens and 500 output tokens per ticket, one draft and 20% retry overhead. This is a workload assumption including a placeholder for image tokens, not measured Meta usage. `C_AI = N * 1.2 * (1500*1.25 + 500*4.25)/1,000,000 = N * USD 0.0048`. Actual usage can differ materially with image dimensions and request behavior.

| Scenario | Tickets/month | Retained media estimate | Planning base | AI simulation | Illustrative subtotal |
| --- | --- | --- | --- | --- | --- |
| Synthetic hosted demo | 100 | 0.6 GB | Supabase Free + Render Hobby + 2 x USD 7 = USD 14 | USD 0.48 | USD 14.48, about Rp231,680 |
| One-site pilot | 1,000 | 6 GB | Supabase Pro 25 + Render Pro 25 + 2 x 25 = USD 100 | USD 4.80 | USD 104.80, about Rp1,676,800 |
| Early ten sites | 10,000 | 60 GB | USD 100 only if benchmark supports it | USD 48 | USD 148, about Rp2,368,000 |

A local synthetic demo may cost zero hosted infrastructure. The table's hosted demo is optional and Free limits/pausing matter. The pilot has a benchmark-dependent smaller base of USD 64 if both USD 7 services suffice. Separate minimum small staging adds approximately USD 24/month: extra Supabase project 10 + web 7 + worker 7. Thus pilot plus that staging and simulated AI is USD 128.80; ten sites is USD 172. These are incomplete planning subtotals, not total cost of ownership.

These token-based subtotals are a separate sensitivity from the conservative [business cash model](../02-business/unit-economics-and-costs.md), which uses Rp1,940,000/month for one-site pilot and Rp3,720,000/month for ten sites with its stated AI/operations allowances. Use that full cash scenario for commercial funding, not the incomplete USD subtotal. Do not add the two models together or call either an observed bill.

## Full budget and controls

`Total = platform + web + worker + DB upgrades + storage + uncached/cached egress + AI + retries + notifications + object backup + monitoring + staging + domain + taxes + FX/payment fees + support + labor`. Do not double-count included compute credits or ignore a workspace fee. Log actual usage by tenant/job without sensitive payloads. Include founder salary/opportunity cost and customer implementation time in fully loaded economics; those values are unknown.

Propose warning alerts at 50%, 80% and 100% of the agreed monthly ceiling, per-tenant AI/upload quotas, bounded retries, thumbnail limits and a manual-AI-off switch. Provider spend caps may not cover all billable resources; verify account controls. Benchmark concurrent uploads, image memory, DB connections and queue age before sizing changes. No Redis is planned unless measurements justify it.

## Dependencies and next action

P sets the affordable monthly ceiling and currency/tax assumptions; E validates region, plan terms, staging and recovery coverage; A records real token/image usage on permissioned fixtures. Replace the simulation with an account-level bill model before a paid pilot offer. See [reliability](reliability-and-observability.md) for recovery tradeoffs and [ROI](../05-delivery/pilot-and-roi-validation.md) for customer value, which is separate from hosting cost.
