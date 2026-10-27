# StreetProof: indeks dokumentasi

Document ID: NAV-01  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../en/README.md)

## Status paket dan cara membaca

Ini paket riset dan spesifikasi usulan, bukan dokumentasi aplikasi yang sudah berjalan. Tanggal riset 20 Oktober 2026. Sumber eksternal, klaim vendor, asumsi, target dan hasil teramati harus dibedakan. Belum ada wawancara, pelanggan, pembayaran, deployment atau hasil pilot yang diklaim.

Kedua bahasa memiliki isi setara dan nama file sama. Versi Indonesia bukan dokumen bisnis terpisah dari versi Inggris. Angka skenario, ID goal/fitur, state dan kontrak harus tetap sama ketika direvisi.

## Jalur baca berdasarkan peran

| Pembaca | Urutan yang disarankan |
|---|---|
| Founder / project manager | [Piagam](00-foundation/project-charter.md), [perbandingan segmen](01-research/segment-comparison.md), [scope bisnis](02-business/business-scope.md), [biaya](02-business/unit-economics-and-costs.md), [roadmap](05-delivery/implementation-roadmap.md), [keputusan](00-foundation/decision-register.md) |
| Engineer / AI engineer | [PRD](03-product/product-requirements.md), [HLD](04-technical/high-level-design.md), [data](04-technical/domain-and-data-model.md), [API/event](04-technical/api-and-event-contracts.md), [AI/evaluasi](04-technical/ai-pipeline-and-evaluation.md), [acceptance](05-delivery/quality-and-acceptance.md) |
| Sales / marketing / calon mitra | [Ringkasan](06-marketing/01-executive-summary.md), [kompetitor](01-research/competitor-landscape.md), [harga](02-business/pricing-packaging.md), [akuisisi](06-marketing/04-acquisition.md), [pilot](07-appendices/pilot-commercial-templates.md) |
| IT / legal / data owner | [Keamanan/data](04-technical/security-privacy-and-governance.md), [infrastruktur](04-technical/infrastructure-and-costs.md), [komersial](02-business/commercial-and-procurement.md), [asumsi](00-foundation/assumptions-and-open-questions.md) |

## Rekomendasi inti

Mulai dari satu gedung komersial, 2-4 kategori non-darurat, dan tim 2-4 orang; kampus dapat menggantikan jika sponsor dan akses data lebih siap. Rekomendasi ini hipotesis perencanaan yang menunggu bukti lapangan. Bangun intake foto+teks, review manusia, penugasan, bukti hasil, keputusan supervisor dan status pelapor terbatas. AI tidak menutup pekerjaan atau menentukan keselamatan.

Stack referensi adalah TypeScript/Next.js modular monolith, worker terpisah dan PostgreSQL dengan layanan Auth/Storage terkelola. Pilihan region, subprosesor dan akun model harus diterima owner sebelum data nyata. Anggaran belum disetujui; hipotesis harga dan biaya hanya skenario. [Register keputusan](00-foundation/decision-register.md) dan [asumsi](00-foundation/assumptions-and-open-questions.md) menyebut pemicu perubahan.

## Peta dokumen

### 00-foundation

- [project-charter](00-foundation/project-charter.md)
- [source-material-review](00-foundation/source-material-review.md)
- [decision-register](00-foundation/decision-register.md)
- [assumptions-and-open-questions](00-foundation/assumptions-and-open-questions.md)
- [glossary](00-foundation/glossary.md)

### 01-research

- [research-methodology](01-research/research-methodology.md)
- [source-register](01-research/source-register.md)
- [market-sizing](01-research/market-sizing.md)
- [segment-comparison](01-research/segment-comparison.md)
- [competitor-landscape](01-research/competitor-landscape.md)
- [differentiation-and-relevance](01-research/differentiation-and-relevance.md)
- [field-validation](01-research/field-validation.md)

### 01-research/competitors

- [maintainx](01-research/competitors/maintainx.md)
- [upkeep](01-research/competitors/upkeep.md)
- [limble](01-research/competitors/limble.md)
- [safetyculture](01-research/competitors/safetyculture.md)
- [planradar](01-research/competitors/planradar.md)
- [infraspeak](01-research/competitors/infraspeak.md)
- [hashmicro](01-research/competitors/hashmicro.md)
- [total-erp](01-research/competitors/total-erp.md)

### 02-business

- [business-scope](02-business/business-scope.md)
- [business-model](02-business/business-model.md)
- [pricing-packaging](02-business/pricing-packaging.md)
- [unit-economics-and-costs](02-business/unit-economics-and-costs.md)
- [commercial-and-procurement](02-business/commercial-and-procurement.md)
- [partnerships-and-expansion](02-business/partnerships-and-expansion.md)

### 03-product

- [product-requirements](03-product/product-requirements.md)
- [personas-and-journeys](03-product/personas-and-journeys.md)
- [goal-feature-traceability](03-product/goal-feature-traceability.md)
- [source-feature-crosswalk](03-product/source-feature-crosswalk.md)
- [mvp-and-release-scope](03-product/mvp-and-release-scope.md)
- [experience-and-accessibility](03-product/experience-and-accessibility.md)
- [metrics-and-events](03-product/metrics-and-events.md)

### 04-technical

- [high-level-design](04-technical/high-level-design.md)
- [domain-and-data-model](04-technical/domain-and-data-model.md)
- [state-machine-and-permissions](04-technical/state-machine-and-permissions.md)
- [api-and-event-contracts](04-technical/api-and-event-contracts.md)
- [ai-pipeline-and-evaluation](04-technical/ai-pipeline-and-evaluation.md)
- [integrations-and-migration](04-technical/integrations-and-migration.md)
- [security-privacy-and-governance](04-technical/security-privacy-and-governance.md)
- [infrastructure-and-costs](04-technical/infrastructure-and-costs.md)
- [reliability-and-observability](04-technical/reliability-and-observability.md)
- [architecture-decisions](04-technical/architecture-decisions.md)

### 05-delivery

- [implementation-roadmap](05-delivery/implementation-roadmap.md)
- [work-breakdown-and-estimates](05-delivery/work-breakdown-and-estimates.md)
- [team-and-raci](05-delivery/team-and-raci.md)
- [pilot-and-roi-validation](05-delivery/pilot-and-roi-validation.md)
- [quality-and-acceptance](05-delivery/quality-and-acceptance.md)
- [operations-and-support](05-delivery/operations-and-support.md)
- [risk-register](05-delivery/risk-register.md)

### 06-marketing

- [01-executive-summary](06-marketing/01-executive-summary.md)
- [02-strategic-frame](06-marketing/02-strategic-frame.md)
- [03-current-state](06-marketing/03-current-state.md)
- [04-acquisition](06-marketing/04-acquisition.md)
- [05-activation](06-marketing/05-activation.md)
- [06-retention](06-marketing/06-retention.md)
- [07-referral](06-marketing/07-referral.md)
- [08-revenue](06-marketing/08-revenue.md)
- [09-roadmap-90-days](06-marketing/09-roadmap-90-days.md)
- [10-outlook-12-months](06-marketing/10-outlook-12-months.md)
- [11-operations-stack](06-marketing/11-operations-stack.md)
- [12-tactical-idea-bank](06-marketing/12-tactical-idea-bank.md)
- [13-measurement-and-governance](06-marketing/13-measurement-and-governance.md)

### 07-appendices

- [interview-and-usability-kits](07-appendices/interview-and-usability-kits.md)
- [pilot-commercial-templates](07-appendices/pilot-commercial-templates.md)
- [hackathon-and-demo](07-appendices/hackathon-and-demo.md)
- [documentation-quality-report](07-appendices/documentation-quality-report.md)

## Pemeliharaan paket

Perbarui sumber, keputusan, scope, API/data, roadmap dan pasangan bahasa dalam satu perubahan. Jangan mengubah target sesudah melihat hasil. Pertanyaan yang belum terjawab harus memiliki owner dan cara memperoleh jawaban. Lihat [laporan pemeriksaan](07-appendices/documentation-quality-report.md) untuk bukti pemeriksaan paket dan batas yang belum dapat diuji tanpa aplikasi/pilot.
