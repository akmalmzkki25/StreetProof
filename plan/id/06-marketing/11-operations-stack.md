# 11. Stack operasi pemasaran

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-11

[English version](../../en/06-marketing/11-operations-stack.md)

## Daftar isi

- [Keputusan stack](#keputusan-stack)
- [Skill dan alat menurut AARRR](#skill-dan-alat-menurut-aarrr)
- [Seleksi alat minimum](#seleksi-alat-minimum)
- [Demonstrasi operasi yang harus dijalankan](#demonstrasi-operasi-yang-harus-dijalankan)
- [Kapasitas dan unlock dana](#kapasitas-dan-unlock-dana)
- [Strategi internal dan eksekusi eksternal](#strategi-internal-dan-eksekusi-eksternal)

## Keputusan stack

Mulai dengan Markdown, spreadsheet terbatas, demo sintetis, buku biaya, dan ekspor event aplikasi. Skill mempercepat penyusunan dan pemeriksaan materi; skill tidak menggantikan observasi pengguna, persetujuan pembeli, akses layanan, atau kapasitas engineering. Tidak ada bukti bahwa stack agen memberi output setara tim pemasaran besar pada StreetProof. Semua integrasi pelanggan di bawah belum terverifikasi terpasang.

P memiliki strategi dan penawaran. Q mengelola bukti pengguna dan enablement. E+A memasok demo serta data yang benar. Jika dua orang, gabungkan peran sesuai [current state](03-current-state.md). Jangan membeli CRM, automation suite, atau paid keyword tool hanya untuk mengisi diagram stack.

## Skill dan alat menurut AARRR

| Stage | Skill yang tersedia untuk metode kerja | Alat awal yang direkomendasikan | Integrasi masa depan dan gerbang |
|---|---|---|---|
| Acquisition | customer-research, sales-enablement, content-strategy, social, copywriting | CRM spreadsheet, daftar 15 akun, demo dan dua aset | Search Console setelah domain ada; paid keyword/ads setelah kebutuhan dan anggaran jelas |
| Activation | onboarding, analytics, copy-editing | Checklist readiness, log bantuan, ekspor event | Email transaksional setelah sender dan akses diuji; tidak membutuhkan paywall |
| Retention | emails, churn-prevention, customer-research | Review pengecualian, log dukungan, ledger kontrak | ESP/lifecycle jika peran dan kejadian stabil; CRM integration jika manual menjadi hambatan |
| Referral | referrals, co-marketing, copywriting | Kolom sumber, izin terpisah, ringkasan berizin | Link/affiliate tool hanya setelah volume dan kebijakan program mendukung |
| Revenue | pricing, revops, sales-enablement | Penawaran, invoice/payment ledger, spreadsheet biaya | Integrasi billing setelah kebutuhan lokal, fees, pajak, dan rekonsiliasi diuji |
| Lintas tahap | marketing-plan, marketing-ideas, antislop-copywriting, analytics | Dokumen bilingual, log eksperimen, register sumber | Dashboard setelah sumber data dapat direkonsiliasi |

Nama skill adalah kemampuan yang tersedia dalam sesi perencanaan, bukan klaim bahwa automasi sudah diinstal. GA4, Ahrefs, Customer.io, Stripe, Typefully, Notion, dan affiliate tools tidak boleh ditulis sebagai koneksi pelanggan yang aktif tanpa pemeriksaan. Konektor Google Drive/GitHub yang tersedia bagi agen juga tidak membuktikan proyek StreetProof memiliki CRM atau repo.

## Seleksi alat minimum

| Kebutuhan | Pilihan awal | Alternatif dan keputusan batas |
|---|---|---|
| Pipeline kecil | Spreadsheet dengan account_id, stage, owner, next_step, source, tanggal | CRM dedicated setelah dua pemilik perlu akses/rekonsiliasi yang spreadsheet tidak penuhi |
| Metrik produk | Ekspor event server dengan tenant scoping ke spreadsheet terkontrol | Analytics produk setelah kontrak event dan kebutuhan data jelas |
| Trafik marketing | Tidak wajib pada demo lokal; Search Console/analytics setelah situs nyata ada | Jangan memasang tracker pada receipt, foto, atau halaman token |
| Email layanan | Adapter server dan provider yang diuji; Resend kandidat | Akun, domain, region, biaya, dan deliverability belum teruji; kirim manual dulu jika memadai |
| Pembayaran B2B | Invoice dan rekonsiliasi transfer yang disetujui | Gateway subscription setelah metode bayar pembeli diketahui |

Dokumentasi Resend mensyaratkan domain milik pengirim diverifikasi. Ini prasyarat teknis kandidat, bukan bukti StreetProof memiliki domain, deliverability, atau persetujuan akun. [M-03: Resend verified domains](https://resend.com/docs/dashboard/domains/introduction)

Google Analytics melarang pengiriman PII. Jika dipakai, E menguji URL, title, event, dan UTM agar tidak memuat identitas, lokasi rinci, isi laporan, atau token. Redaksi bukan pengganti pembatasan pengumpulan. [M-02: Google Analytics PII](https://support.google.com/analytics/answer/6366371?hl=en)

## Demonstrasi operasi yang harus dijalankan

Contoh berikut adalah latihan usulan, bukan kejadian yang sudah diamati. Pada minggu pertama Q membuat tiga akun/tiket sintetis dengan tanggal pilot.prepared dan org.onboarded berbeda. Timestamp sintetis memperagakan persiapan sebelum baseline, lalu org.onboarded hanya saat limited-live siap setelah baseline dan shadow; latihan tidak mencatat organisasi nyata sebagai onboarded. E mengekspor event tanpa media atau identitas. Q menghitung Activation14 dari org.onboarded, menandai akun muda sebagai pending, melaporkan TimeToLive dan akun belum live sejak pilot.prepared, lalu menautkan setiap angka ke baris sumber. P mencocokkan satu penawaran dengan ledger biaya. Jika orang non-engineer belum dapat menjelaskan kedua clock, penyebut, dan pending, perbaiki template sebelum membeli dashboard.

Batas latihan dua jam tim, memakai data sintetis. Hasil yang diterima adalah file dapat dibuka, hitungan dapat diulang, dan tidak ada token/PII dalam ekspor marketing. Tidak ada klaim integrasi bekerja sampai latihan benar-benar lulus.

## Kapasitas dan unlock dana

| Keadaan | Orang dan beban | Tools/kanal yang dibuka | Gerbang |
|---|---|---|---|
| Sekarang, dana unknown | 2-4 peran; enam/sepuluh jam marketing tim per minggu | Manual sales, checklist, bukti | Pemilik dan waktu tersedia dikonfirmasi |
| S1 tersedia | Peran sama; kontraktor hanya tugas terbatas | Perjalanan, materi, tools minimum | Pengeluaran sesuai buku biaya; satu pilot |
| S2 tersedia dan nilai berbayar | Pertimbangkan kontraktor khusus sebelum pegawai tetap | Satu paid test dan CRM jika dibutuhkan | Konversi matang, margin, kapasitas, runway |
| Tahun kedua, pendanaan tambahan | Marketing Lead/Manager bila kebutuhan berulang jelas | Tambah kanal setelah yang awal terbukti | Rencana baru, bukan unlock otomatis karena nama round |

Alokasi upaya awal 60/25/15 mengikuti [outlook](10-outlook-12-months.md). Alokasi 70/20/10 baru digunakan setelah ada kanal yang bekerja. Alokasi tahap AARRR untuk kapasitas awal: Acquisition 40%, Activation 30%, Retention 15%, Revenue 10%, Referral 5%. Itu bobot rencana, bukan jam baru di luar cap; pada pilot, P boleh menggeser Acquisition ke Activation/Retention dan mencatat alasan.

## Strategi internal dan eksekusi eksternal

P tetap bertanggung jawab atas ICP, pesan, harga, dan kanal. Q memiliki pemahaman pengguna. Kontraktor boleh menyunting rekaman, desain materi, atau melakukan review spesifik dengan scope dan cap yang jelas setelah dana tersedia. Jangan menyerahkan keputusan posisi kepada agency tanpa pemilik internal. Langkah berikutnya adalah menguji spreadsheet dan event sintetis, lalu menambahkan alat hanya saat hambatan operasional terbukti.
