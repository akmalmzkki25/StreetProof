# 08. Revenue and economics

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-08

[Versi Bahasa Indonesia](../../id/06-marketing/08-revenue.md)

## Contents

- [Offer under test](#offer-under-test)
- [Commercial experiments](#commercial-experiments)
- [An uncomfortable ROI example](#an-uncomfortable-roi-example)
- [Unit economics table](#unit-economics-table)
- [Next action](#next-action)

## Offer under test

P tests a one-site offer covering corrective work, closure evidence, supervisor review, and agreed export. Initial price simulation: Rp1,500,000/site/month. Pilot fee simulation: Rp5,000,000 total for eight weeks, excluding internal customer labor. Volume, storage, support, tax, payment terms, and setup scope must be written before an offer. These are neither market prices nor willingness-to-pay evidence.

The proposed model has no reporter charge. Do not encourage suppression of valid reports. Setup, migration, custom integration, SSO, private deployment, and out-of-scope work require separate costing. Do not sell Enterprise packages or SLA guarantees before service capability and contracts can support them. A one-time pilot fee is not MRR, and an advance is not automatically recognized revenue.

## Commercial experiments

| ID | Execution | Owner and tool | Indicator and cap |
|---|---|---|---|
| REV-01 | After discovery, present the same pilot scope and ask who approves cost and why they accept/decline | P; pricing, sales-enablement; offer sheet and CRM | At most three initial qualified offers; do not change price and scope simultaneously |
| REV-02 | At pilot evaluation, compare measured benefit with recurring price and change costs | P+Q; baseline spreadsheet and cost ledger | Two analysis hours; request a paid commitment with date, scope, and buying process |
| REV-03 | Offer site two only when site one activates and service cost is known | P; revops, pricing; contract ledger | Hold expansion when support exceeds capacity or margin remains unknown |

If three suitable offers are declined because benefit is too small for the price, revise ICP, scope, or price before adding leads. If the blocker is an unopened budget, record the decision date and evidence of budget ownership; do not mark closed won. Discounts do not replace value evidence. Written offer, contract, invoice, payment, and active service are separate events.

## An uncomfortable ROI example

Simulation: 100 tickets/month, five fewer administrative minutes per ticket, labor cost Rp60,000/hour. Redeployable time is `100 × 5 = 500 minutes = 8.333 hours`. Time value is `8.333 × Rp60,000 = Rp500,000/month`, below the Rp1,500,000 test price. Time-only break-even is 300 tickets/month before onboarding, supervisor, technician, and change costs.

This is not a StreetProof result. Better quality or less rework may add benefit only with evidence and without double-counting administrative time. Time reduction does not automatically create cash savings. Use controlled observation and a spreadsheet when lighter than a product timer. Elapsed ticket closure time differs from active operator handling minutes.

## Unit economics table

| Metric | Current value | Measurement contract |
|---|---|---|
| Monthly ARPC | Unknown | Actual recurring revenue / paying accounts; one account may have several sites |
| Blended CAC | Unknown | All acquisition and sales costs / new paid accounts in the matching cohort |
| Annual retention | Unknown | Requires one-year exposure or a valid renewal cohort |
| Gross margin | Unknown | Deduct relevant AI, hosting, storage, notifications, and customer service |
| LTV | Unknown | Do not extrapolate zero churn in a short sample into infinite lifetime |
| Actual LTV/CAC and CAC payback | Unknown | Insufficient observed inputs |

Complete CAC includes founder/sales time, salaries and associated costs, tools, content, travel, ads, agency/contractors, and referral activity. Separate product R&D and service cost from acquisition, allocating mixed activity consistently. Record cohort cost and sales lag; do not divide all this month's costs by payments from an older sales process without reconciliation.

90-day sensitivity example, entirely simulated: S1 cash `3 × Rp1,725,000 = Rp5,175,000`; in a four-person scenario capped at 130 marketing hours over 13 weeks, 78 hours allocated to acquisition at Rp100,000/hour opportunity cost yields Rp7,800,000. All S1 cash in this example is assumed acquisition-related, totaling Rp12,975,000; service and R&D costs are recorded separately. This is a high-acquisition-load four-person scenario rather than a required two-person allocation. If two new accounts pay from the matured cohort, example CAC is Rp6,487,500/account. With no paying accounts, CAC has no finite value; report cost and zero conversions. At one-site revenue of Rp1,500,000/month and hypothetical 70% margin already including service burden, example payback is about 6.18 months. This does not establish actual margin or payback.

## Next action

P fills actual costs and tests REV-01 after sponsor and scope readiness. Monthly review uses payment facts, service cost, loss reasons, and the next commitment. In months 4-12, annual plans or expansion are tested only after repeated usage. The [outlook](10-outlook-12-months.md) uses capacity and funding scenarios; it promises no revenue forecast.

AC-20 in [product-requirements](../03-product/product-requirements.md) gates commercial offers: scope, limits, fees, data access, support, and exit must be written.

