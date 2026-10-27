# 10. 12-month outlook

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-10

[Versi Bahasa Indonesia](../../id/06-marketing/10-outlook-12-months.md)

## Contents

- [Budget method and growth shape](#budget-method-and-growth-shape)
- [Three resource scenarios](#three-resource-scenarios)
- [Quarter 1: months 1-3](#quarter-1-months-1-3)
- [Quarter 2: months 4-6](#quarter-2-months-4-6)
- [Quarter 3: months 7-9](#quarter-3-months-7-9)
- [Quarter 4: months 10-12](#quarter-4-months-10-12)
- [Recalibration decisions](#recalibration-decisions)

## Budget method and growth shape

Use goal-based budgeting as a sensitivity framework, then constrain it by cash and capacity. An ARR percentage method is unhelpful before revenue. CAC, retention, ARPC, and funding are unknown, so the formula cannot produce a validated forecast. This is a learning plan with possible stepwise growth after purchases, not a promise of exponential growth. No funding round is assumed to close.

Goal formula: `required retained new ARR = max(0, target ending ARR - starting ARR × existing-base NRR)`. Then `new accounts = ceil(required retained new ARR / (monthly ARPC × 12 × new-cohort retention to year end))`. Use revenue retention matched to acquisition timing; do not impose a full year of retention on an account acquired in month 11. `Acquisition budget = new accounts × CAC`, plus a 15% experiment reserve. Avoid counting that reserve twice inside experiment lines.

Illustration, not a sales target: zero starting base, one-site price Rp1,500,000/month, and three one-site accounts still paying at year end imply Rp54,000,000 run-rate ARR. With a sensitivity assumption of 100% retention to year end and simulated base CAC Rp6,150,000 before reserves, three-account acquisition needs Rp18,450,000 + 15% = Rp21,217,500, excluding R&D and service. The 100% retention is solely an arithmetic check, not a behavioral forecast. The example base CAC is (Rp4,500,000 base cash + Rp7,800,000 acquisition labor) / two accounts before one new reserve. Match complete costs from [revenue](08-revenue.md), not just advertising cash.

## Three resource scenarios

| Scenario | Simulated monthly cash | Base components | Full year if constant |
|---|---:|---|---:|
| S0 | Rp0 incremental | Existing tools, manual work, no ads; opportunity cost still recorded | Rp0 incremental cash; labor cost unknown |
| S1 | Rp1,725,000 | Rp1,500,000 base: travel Rp600,000, materials Rp300,000, tools Rp200,000, research Rp100,000, contract help Rp300,000; experiment reserve Rp225,000 | Rp20,700,000 cash |
| S2 | Rp5,750,000 | Rp5,000,000 base: visits Rp1,000,000, enablement Rp1,000,000, contractor Rp1,500,000, tools Rp500,000, one paid test Rp1,000,000; reserve Rp750,000 | Rp69,000,000 cash |

These are planning caps, not purchasing permission or vendor prices. Lines may remain unspent. S2 requires a paid commitment, plausible service margin, and available funds. The Rp1,000,000 paid allocation is a bounded learning test rather than a statistically sufficient sample guarantee. A stepped scenario of three S1 months and nine S2 months totals Rp56,925,000 cash, entirely conditional and excluding labor. P recalculates before each increase.

## Quarter 1: months 1-3

Funding state: bootstrapped or unknown; S0 default, S1 only if available. Focus on access, activation, and a pilot decision. Proposed learning targets: 15 researched accounts, six qualified conversations, at most three initial offers, and one ready pilot if sponsor and control gates pass. These are not an achieved funnel.

The channel curve is in discovery, the product is unproven on real data, and the market is unvalidated. Capacity is one pilot. Allocate effort 60% to conversations/readiness, 25% to evaluation/support, and 15% to asset experiments. No channel qualifies as a growth engine. Day 90 may yield a no-go.

## Quarter 2: months 4-6

Funding state: remain at S0/S1 unless funds and commercial gates open S2. Focus on repeating the workflow at account two rather than major features. Conditional targets: two cumulative accounts reaching org.onboarded when limited live is ready after baseline and shadow, two Activation14 cohorts reported with pending, one concrete paid decision, and one permissioned results asset if supported. Separately report pilot.prepared accounts not yet live and TimeToLive since preparation. With low volume, target a better baseline and an extension decision rather than a false win rate.

P retains direct sales while Q tests onboarding and service cost. Question-based content becomes the next channel curve only after three accounts ask the same question. Do not hire a full-time marketer before funding and workload support it. A contractor for a specific asset may be tested with written scope and cap.

## Quarter 3: months 7-9

Funding state: S1 or conditional S2, without assuming a seed close. Focus on repeatability and matured retention cohorts. Capacity targets, not forecasts: at most three concurrent live accounts for two people or five for four, subject to service review. Control targets: 100% of accounts have cost logs, every due renewal is reviewed, and no expansion bypasses data gates.

P may run one additional channel test capped at four weeks and Rp1,000,000 cash loss from the S2 paid line. Stop if it yields no ICP conversations or service burden worsens. Click signals do not establish CAC. Product and market remain within the building wedge; campus is eligible if access produces better evidence.

## Quarter 4: months 10-12

Funding state: retain the scenario that passed gates and reduce spend when cash or results weaken. Focus on renewal, service cost, and year-two choices. Conditional scenario: three paying one-site accounts at year end, equivalent to Rp54,000,000 run-rate ARR; this is neither annual cash revenue nor a commitment. Report actuals even if zero. Process targets: every matured cohort has a decision, every publication request has permission, and at least one channel has calculable cost per qualified conversation if conversations exist.

If a channel repeats, allocate 70% to it, 20% to the next, and 10% to experiments within the same budget. Otherwise do not claim a flywheel. A Marketing Lead/Manager combining product marketing and growth becomes eligible only after runway, need, and supervision are clear. International expansion, broad resellers, and agency teams still need a new plan.

## Recalibration decisions

P and Q review cash, hours, conversion, service burden, and loss reasons monthly. Two months of greater effort without additional ICP conversations trigger a channel change; two weeks of support over capacity hold new accounts. Quarterly review rewrites the [roadmap](09-roadmap-90-days.md). Funding opens capacity without proving demand.
