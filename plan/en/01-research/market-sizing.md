# Market sizing

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: R-03

[English / Bahasa Indonesia](../../id/01-research/market-sizing.md)

## Recommendation

Present opportunity as a bottom-up scenario with a narrow official reference point. Do not present a global CMMS forecast, Indonesian population, number of students, or all buildings as StreetProof's addressable customers. The billable unit is a site; the buying account can operate 1-5 sites. Separate sites, legal entities, portfolios and contracts to avoid counting one buyer repeatedly.

## What the public data actually says

An official-domain search extraction for BPS's 2025 classified-hotel table displays 4,790 accommodations nationally. The full page returned 403/CAPTCHA during direct reads, so this is a provisional reference requiring confirmation, not a fully page-verified fact. It concerns a hospitality establishment category, not offices, campuses, independent buyers, adoption or demand. BPS tables can differ in revision dates; retain and reconcile the selected extract before external use. The model below uses 4,790 as an explicit scenario input only. [BPS table to confirm](https://www.bps.go.id/en/statistics-table/2/MzA3IzI%3D/jumlah-akomodasi-kamar-dan-tempat-tidur-yang-tersedia-pada-hotel-bintang.html)

PDDikti provides a route to institution information, but institution count does not equal campus sites or facility buying units. Its live page was blocked in the Jina read; no institution total is adopted here. [PDDikti](https://pddikti.kemdiktisaintek.go.id/)

## Quantitative model

All prices, eligibility fractions, reachable counts and conversions below are assumptions. Rp1,500,000/site/month is a price test, making annual site contract value Rp18,000,000 before discounts, tax and separate services.

| Layer | Formula | Illustrative range | Interpretation |
| --- | --- | --- | --- |
| Broad TAM method | Verified eligible commercial sites × annual site price | Pending site census; no asserted national total | Include only defined corrective-maintenance needs and plausible buying units |
| Adjacent hospitality proxy | 4,790 × assumed eligible fraction 20%-40% | 958-1,916 sites | Not the total commercial TAM or validated customers |
| Proxy annual value | 958-1,916 × Rp18,000,000 | Rp17.244-34.488 billion/year | Hypothetical full penetration of eligible proxy sites |
| Initial SAM scenario | 50-200 named reachable sites × assumed fit 40%-70% | 20-140 sites | List must be built and deduplicated; endpoints combine low-low and high-high |
| SAM annual value | 20-140 × Rp18,000,000 | Rp360 million-2.52 billion/year | Opportunity under assumed fit, not pipeline |
| 12-month SOM capacity case | 2-10 retained paying sites | Rp36-180 million exit ARR | Delivery target range, not a sales forecast |

Exit ARR is the last month's recurring revenue ×12. If sites start in different months, recognized subscription revenue is sum(site price × billable months), not exit ARR. Two pilots are not two paying subscriptions, and free pilots must not enter ARR.

## Sensitivity and capacity

At 10 retained sites, monthly price tests of Rp1,000,000, Rp1,500,000 and Rp2,000,000 imply exit ARR of Rp120,000,000, Rp180,000,000 and Rp240,000,000. This arithmetic says nothing about price acceptance. A two-person team may reach fewer sites if onboarding and support remain manual. Capacity constraint: new sites/month ≤ available onboarding hours ÷ measured onboarding hours/site; retained sites ≤ support-hour capacity ÷ support hours/site.

## Data gaps and next action

P must build a permissioned list with account, site address, operating group, current tool, approximate monthly eligible tickets, economic buyer and source date. Q checks ten records for duplicate portfolios and actual facility scope before using totals. Obtain commercial-building counts from a defined geography or property association and document coverage, vacancy and managed-site exclusions. Recalculate SAM after discovery; keep unknown fields unknown. Stop expansion if a realistic reachable list or paid buyer cannot be established. See [segment comparison](segment-comparison.md) and [unit economics](../02-business/unit-economics-and-costs.md).
