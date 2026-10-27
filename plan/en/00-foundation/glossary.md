# Glossary and conventions

Document ID: FND-05  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/00-foundation/glossary.md)

## Shared terminology

| English term | Indonesian term | Meaning |
| --- | --- | --- |
| Report | Laporan | An original reporter submission, retained when linked as a duplicate |
| Ticket | Tiket | Canonical work item that is assigned and tracked |
| Evidence | Bukti | Media or notes with recorded provenance, time and access |
| Completion submission | Pengajuan selesai | A technician claim that work is ready for review, not final closure |
| Verified closure | Penutupan terverifikasi | Supervisor decision against the evidence checklist, not an absolute engineering guarantee |
| Active handling time | Waktu kerja aktif | Minutes an operator spends handling a case, separate from queue elapsed time |
| SLA | SLA | Service target with agreed operating hours, category and pause policy |
| Tenant | Tenant/organisasi | Organization-level authorization and data ownership boundary |
| Site | Lokasi operasional | Building or area within one organization |
| Assumption | Asumsi | Unproven input with an owner and a validation method |
| Vendor claim | Klaim vendor | Capability stated by a provider in its official source, not independently tested |
| Target | Target | Proposed threshold established before observation |
| Observed result | Hasil teramati | Data from actual use or experiments with a recorded method |
| Activation | Aktivasi | An organization completes its first valuable workflow, beyond registration |
| CAC | CAC | Fully loaded acquisition cost including team time, tools and sales activities |
| Shadow mode | Shadow mode | AI produces suggestions without taking over the running process |
| North star | Metrik utama | Primary outcome measure interpreted with quality, risk and capacity |
| RPO/RTO | RPO/RTO | Targeted data-loss window and recovery duration that must be tested |

## IDs and specification language

G-01 through G-27 refer to OR-02 goals. Suffixes a/b/c separate outcomes without erasing provenance. F-01 through F-71 refer to OR-02 feature groups. N-xx identifies additions or controls not adequately represented in that catalog. D-xx denotes decisions, A-xx assumptions and AC-xx product acceptance criteria.

State names, JSON fields, events and API paths remain English in both versions. Filenames are identical for pairing. Use the same role labels: P product/commercial, E application/backend, A AI/evaluation, Q UX/QA/customer enablement. A in an owner column denotes a role; A-xx denotes an assumption.

Simulated numbers remain simulations in translation. Use decimal points in JSON and machine-readable formulas. Cost tables identify currency and period; ticket counts are not customer counts. Read [metrics-and-events](../03-product/metrics-and-events.md) before using percentages.
