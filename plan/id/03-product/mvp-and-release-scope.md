# Batas MVP, pilot dan rilis komersial

Document ID: PRD-04  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/03-product/mvp-and-release-scope.md)

## Aturan prioritas

Must berarti alur inti tidak dapat diterima tanpa kemampuan tersebut. Pilot bukan demo yang dibuka untuk data nyata: pilot memerlukan kontrol data dan operasi tambahan. Unit fitur besar di katalog hanya diambil irisannya. Setiap tambahan menggeser pekerjaan lain, membutuhkan owner dan acceptance criteria.

| Kemampuan | Hackathon | Pilot | Komersial |
| --- | --- | --- | --- |
| Intake foto+teks/lokasi manual | Must | Must | Core |
| Voice/transkripsi/video | Defer | Conditional experiment | Only after measured value |
| Draft AI dan klarifikasi | Must; manual fallback | Measured correction/evaluation | Versioned evaluation |
| Duplikat | Candidate + human link | Quality tracking + unlink | Configurable thresholds |
| Penugasan | Manual | Rules approved by owner | Integration only when needed |
| Status petugas dan kendala | Core transitions | Draft durability and low-bandwidth test | Full offline only if justified |
| Bukti dan supervisor | Must | Category policies + exceptions | Sampling and quality operations |
| Status pelapor | Receipt + scoped token | Approved notifications + recovery | Tenant configurable |
| Dashboard | Queue + elapsed-time basics | Agreed SLA and matched baseline | Multi-site only when justified |
| Keamanan | Synthetic data + role/tenant gates | Private data readiness + restore | Assurance and support governance |
| QR/peta | Optional QR, no map dependency | QR when location burden warrants | Provider/region reviewed |
| Integrasi pemerintah | Excluded | Excluded unless authorized separate scope | Authorization-led project |
| MCP/BI/ERP | Defer | Export first | Customer-dependent |

## Definition of ready

Demo siap dibangun setelah lokasi/kategori sintetis, peran, field wajib, transisi, dan skenario penolakan disepakati. Akses model harus diuji sebelum ketergantungan demo dikunci; mock hanya untuk pengembangan dan harus ditandai jika ditampilkan. Persiapan akun dan ketentuan acara tidak dianggap selesai hanya karena sumber publik tersedia.

Pilot siap dimulai setelah sponsor/operator/teknisi/supervisor teridentifikasi, izin data dan retensi disetujui, baseline dirancang, serta restore dan akses lintas peran diuji. Kontak darurat dan SOP adalah konfigurasi organisasi, bukan angka telepon yang ditebak. Produk komersial siap ditawarkan setelah scope, dukungan, pembayaran, exit dan pemilik risiko jelas.

## Definition of done per tahap

Demo: satu kasus baru, satu ambigu, satu duplikat dan satu bukti ditolak dapat dijalankan ulang sampai status yang benar; dashboard memakai data yang sama; semua angka demo berlabel sintetis. Pilot: perilaku tersebut berjalan pada data berizin dengan pengukuran waktu aktif, input teknisi, kegagalan model dan insiden. Komersial: operasional tenant, dukungan, billing terbatas sesuai penawaran, export/deletion dan pelacakan biaya mempunyai owner.

## Kontrol scope tim dua orang

Gabungkan peran P+Q dan E+A. Pertahankan foto+teks dan manual assignment. Tunda transkripsi, SAM, routing otomatis, peta, integrasi eksternal dan offline penuh. Gunakan checklist kategori statis yang disetujui. Jika kapasitas masih tidak cukup, kurangi kategori dan jumlah layar sebelum mengurangi otorisasi atau pemeriksaan supervisor.

## Perubahan yang memerlukan keputusan

Permintaan integrasi, model tambahan atau field wajib baru menyebut masalah pengguna, bukti friksi, pekerjaan yang ditunda, biaya operasi, penanggung jawab dan skenario penerimaan. Permintaan customer-specific tidak menjadi fitur umum tanpa pola kebutuhan yang berulang. Lihat [work-breakdown-and-estimates](../05-delivery/work-breakdown-and-estimates.md).
