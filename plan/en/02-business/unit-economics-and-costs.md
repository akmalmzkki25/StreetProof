# Unit economics and costs

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: B-04

[English / Bahasa Indonesia](../../id/02-business/unit-economics-and-costs.md)

## Decision and model status

Measure buyer value and seller contribution separately. Every financial scenario below is a simulation, not actual spending, an accepted quote or a forecast. USD1 = Rp16,000 is a conversion assumption only. Budget, salaries, AI account terms, ticket volume and customer willingness to pay remain unknown. Maintain a cash view and a fully loaded view so unpaid founder effort does not disappear.

Contents: [buyer ROI](#buyer-roi-and-the-negative-example), [cost equations](#cost-equations), [volume scenarios](#monthly-volume-scenarios), [contribution](#seller-contribution-and-pilot-fee), [acquisition](#acquisition-payback-and-runway).

## Buyer ROI and the negative example

Monthly labor capacity value = eligible tickets × net operator minutes saved/ticket ÷60 × loaded customer hourly value. Net minutes must account for extra corrections; technician and supervisor burden must be measured separately. Saved capacity is not automatically payroll reduction. Do not monetize avoided downtime or accidents without a defensible customer counterfactual.

| Input or result | Simulation |
| --- | --- |
| Eligible tickets/month | 100 |
| Operator minutes saved/ticket | 5 |
| Total time saved | 500 minutes = 8.333 hours |
| Customer hourly value | Rp60,000/hour |
| Gross capacity value/month | Rp500,000 |
| Proposed subscription test | Rp1,500,000/site/month |
| Net value before setup and other burdens | -Rp1,000,000/month |
| Simple subscription-only ROI | (Rp500,000 - Rp1,500,000)/Rp1,500,000 = -66.7% |
| Break-even volume at those assumptions | Rp1,500,000 ÷ (5/60 × Rp60,000) = 300 tickets/month |

Three hundred tickets only covers the subscription. Setup, technician uploads and extra review raise the real break-even point. If 1,000 tickets genuinely save five net minutes each, capacity value becomes Rp5,000,000/month, still subject to actual usability and labor assumptions. A 20% improvement is not five minutes unless baseline handling is 25 minutes. Keep those assumptions separate.

## Cost equations

Monthly cash service cost = application/worker hosting + database/auth base + storage/egress/observability + AI usage + messaging + other vendor charges. AI cost = input tokens × input rate + output tokens × output rate + image/audio charges + embeddings/search + retries, with consistent provider billing units. Unknown Meta/provider access or pricing stays unknown; no other provider's price is borrowed as a confirmed Meta rate. WhatsApp is deferred and not silently included as free messaging.

Supabase's accessed official page lists Pro from $25/month, first project included, with usage allowances and overages. At the scenario exchange rate this starting amount is Rp400,000. This is a checked list-price anchor, not a full production bill, regional guarantee, signed agreement or all-inclusive backup plan. Compute, extra projects, retention, egress, taxes and add-ons need a scoped account check. [Supabase pricing](https://supabase.com/pricing)

The selected pilot reference adds a Render Pro workspace at $25/month and two 1 CPU / 2 GB compute services at $25/month each for the app and worker. Combined with Supabase Pro's $25 starting amount, the base is $100/month = Rp1,600,000 before AI, media/egress/log allowances, staging, tax and overages. This is a list-price configuration to validate, not a deployed capacity benchmark or regional approval. Render bills workspace and compute separately. [Render pricing](https://render.com/pricing)

## Monthly volume scenarios

The pilot app/worker and workspace selections use the qualified Render list prices; database uses the Supabase starting amount. Demo and early-operation compute are planning allowances, not quoted configurations. Media and AI are allowances throughout. AI Rp100/ticket is a sensitivity placeholder, not a vendor rate. Demo uses synthetic data; its free database line is a planning choice, not approval for free-tier live customer data.

| Monthly cost in IDR | Demo, 100 tickets | Pilot, 1,000 tickets | Early operation, 10 sites / 10,000 tickets |
| --- | ---: | ---: | ---: |
| App + separate worker; selected pilot, other columns allowances | 320,000 | 800,000 | 1,280,000 |
| Workspace; selected Render Pro for pilot/early | 0 | 400,000 | 400,000 |
| Database/auth base | 0 | 400,000 | 400,000 |
| Media, egress, logs and restore allowance | 160,000 | 240,000 | 640,000 |
| AI placeholder, Rp100/ticket | 10,000 | 100,000 | 1,000,000 |
| Total modeled cash service cost | 490,000 | 1,940,000 | 3,720,000 |
| Cash service cost/ticket | 4,900 | 1,940 | 372 |

The media allowance does not prove restore coverage or required retention. Validate object storage and database recovery separately. At 10,000 tickets, AI Rp10/Rp100/Rp1,000 per ticket gives Rp100,000/Rp1,000,000/Rp10,000,000 monthly AI cost, making total cash service cost Rp2,820,000/Rp3,720,000/Rp12,720,000. Track p50/p95 actual token/image usage, failure retries and manual fallback, not only average successes.

## Seller contribution and pilot fee

At 10 sites × Rp1,500,000, MRR is Rp15,000,000. Assume support of 2 hours/site/month at Rp100,000/hour, adding Rp2,000,000 direct labor. Total modeled service cost becomes Rp5,720,000 and contribution Rp9,280,000, or 61.9% of revenue. This excludes acquisition and product development. If support is 8 hours/site/month, contribution falls to Rp3,280,000, or 21.9%, at the base AI allowance. High AI usage plus high support can make it negative.

At a single operating site with the pilot cash reference Rp1,940,000 plus 2 support hours costing Rp200,000, a Rp1,500,000 subscription produces -Rp640,000/month contribution before development and acquisition. The ten-site average must not be used to imply the first standalone customer is profitable. Sharing infrastructure requires tested tenant isolation and capacity, not just dividing fixed cost.

The optimistic narrow service example assumes two billing months: 2 × Rp1,940,000 = Rp3,880,000 infrastructure; 12 setup hours × Rp100,000 = Rp1,200,000; and 16 support hours × Rp100,000 = Rp1,600,000. Total Rp6,680,000 exceeds the Rp5,000,000 pilot price test by Rp1,680,000. Its 28 labor hours do not cover the full proposed readiness, support and measurement workload. It is not the funding budget for the selected delivery plan.

The [work breakdown and estimates](../05-delivery/work-breakdown-and-estimates.md) proposes 92-164 readiness hours after the demo and 88-144 support/measurement hours over the eight-week pilot. At the same assumed Rp100,000/hour, the full planning envelope is:

| Work or cost | Planning range |
| --- | --- |
| Readiness after demo, 92-164 hours | Rp9,200,000-16,400,000 labor |
| Pilot support/measurement, 88-144 hours | Rp8,800,000-14,400,000 labor |
| Combined, 180-308 hours | Rp18,000,000-30,800,000 labor |
| Two-month infrastructure reference | Rp3,880,000 |
| Total readiness plus pilot funding envelope | Rp21,880,000-34,680,000 |
| Funding gap against Rp5,000,000 pilot fee | Rp16,880,000-29,680,000 |

This range excludes demo work, other unallocated development, sales, travel, tax and customer internal labor. Actual hours, hourly value and available funding are unknown. P must approve a funding decision before promising the pilot. Separate reusable product-readiness investment from customer-specific onboarding, support and measurement when estimating per-customer COGS; the split is not yet measured. Neither charging all reusable work to every later customer nor excluding it from the first-pilot funding need gives a fair picture. The 28-hour example is an alternative narrow sensitivity, not additional labor on top of this WBS.

For a separate fully loaded monthly illustration add Rp16,000,000/month development opportunity cost (two full-time-equivalent workloads × assumed Rp8,000,000) and Rp4,000,000 commercial/admin cost. Base contribution Rp9,280,000 then becomes -Rp10,720,000/month before tax. These are scenario workloads, not confirmed employment or salaries. This Rp20,000,000 monthly method and the WBS hourly method are alternative ways to value overlapping team work. Do not add them for the same people, hours and period, or count the same hours both in support and development.

## Acquisition, payback and runway

CAC = attributable sales cash + valued sales hours, divided by newly acquired paying accounts in a closed cohort. Illustrative acquisition spend Rp500,000 plus 30 hours × Rp100,000 gives Rp3,500,000 for one account. A one-site account at the ten-site average allocated contribution of Rp928,000/month gives simple payback of 3.77 months. This does not apply to the loss-making single-site operation above, where payback is undefined until contribution turns positive. Shared fixed-cost allocation, onboarding and churn can change it. With zero paying wins CAC is undefined, not zero; pending decisions stay pending.

Do not publish LTV from an unobserved churn assumption. Track retention cohorts and contribution before estimating it. Runway months = unrestricted cash ÷ net monthly cash burn; both inputs are currently unknown. P owns the cost ledger and cash decision; E/A log provider usage; Q logs enablement/support; the buyer confirms labor assumptions. Next action: replace each allowance with actual account terms or measured usage before any commitment. See [pricing](pricing-packaging.md) and [field validation](../01-research/field-validation.md).
