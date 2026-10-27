# 13. Pengukuran dan tata kelola

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-13

[English version](../../en/06-marketing/13-measurement-and-governance.md)

## Daftar isi

- [North star dan guardrail](#north-star-dan-guardrail)
- [Kontrak metrik dan window matang](#kontrak-metrik-dan-window-matang)
- [Pengumpulan yang dapat diperiksa](#pengumpulan-yang-dapat-diperiksa)
- [RACI dan ritme](#raci-dan-ritme)
- [Keputusan terbuka menurut dampak](#keputusan-terbuka-menurut-dampak)
- [Indeks tindakan](#indeks-tindakan)

## North star dan guardrail

North star usulan adalah jumlah akun berbayar yang memakai alur terverifikasi pada window 28 hari matang, dibaca bersama volume pekerjaan yang layak. Sebelum ada akun berbayar, laporkan akun pilot yang mencapai nilai itu secara terpisah. Jangan menggabungkan pilot gratis dengan pelanggan berbayar untuk membuat pertumbuhan. Jumlah tiket ditutup tidak boleh berdiri sendiri karena dapat mendorong penutupan tanpa bukti.

Guardrail pilot usulan: bukti wajib minimal 95%, koreksi AI maksimal 20%, salah routing/reopen tidak meningkat dibanding baseline yang sebanding, tidak ada insiden privasi/keselamatan kritis, serta tidak menambah beban teknisi/supervisor tanpa manfaat yang disepakati. Target waktu operator minimal 20% lebih rendah memakai menit aktif, bukan waktu kalender. Sepakati definisi, pengecualian, dan minimum sampel sebelum pilot. Pada sampel kecil tampilkan distribusi, `x/n`, dan keterbatasan; jangan mengklaim signifikansi atau kausalitas.

## Kontrak metrik dan window matang

| Metrik | Pembilang dan penyebut | Window/sumber | Penggunaan |
|---|---|---|---|
| Percakapan berkualifikasi | Akun unik dengan peran, masalah terbaru, akses, dan langkah berikutnya | Minggu kalender; CRM | Indikator ACQ-01; kontak ganda tidak menggandakan akun |
| TimeToLive | org.onboarded_at - pilot.prepared_at per akun; median untuk akun yang sudah live | pilot.prepared sebelum baseline sampai limited-live siap setelah baseline dan shadow | Tampilkan akun belum live dengan umur tunggu dan alasan; median keberhasilan tidak boleh menyembunyikan persiapan panjang |
| Activation14 | Akun org.onboarded dengan alur terverifikasi pertama dan tanda terima/status pelapor dalam 14 hari / akun org.onboarded yang 14 harinya selesai | Cohort tanggal org.onboarded saat limited-live diaktifkan setelah baseline dan shadow; event dan checklist | Site, peran, izin data nyata, teknisi, dan supervisor siap; pilot.prepared belum masuk cohort; pisahkan pending dan akun tanpa tiket layak |
| OperationalRetention28 | Akun aktif yang mengulang alur pada hari 22-28 / akun aktif yang mencapai hari 28 | Cohort aktivasi; event | Tampilkan keseluruhan dan subset dengan kesempatan kerja, jangan campur |
| VerifiedResolution14 | Tiket eligible yang ditutup supervisor dalam 14 hari setelah submission / tiket eligible yang seluruh 14 harinya matang | Cohort submission; event immutable | Tampilkan backlog/pending dan kategori; tiket yang baru masuk tidak masuk penyebut |
| Reopen14 | Tiket verified_closed yang dibuka ulang dalam 14 hari / tiket verified_closed yang sudah memiliki 14 hari follow-up | Cohort penutupan; event | Jangan memasukkan closure kemarin sebagai belum reopen |
| RequiredEvidence | Completion submission yang memenuhi semua bukti wajib / seluruh completion submission yang ditinjau pada window yang sama | Review mingguan; checklist versi yang sama | Percobaan ditolak tetap terlihat, tidak hanya mengambil yang lolos |
| CorrectionRate | Draf AI ditinjau yang membutuhkan perubahan substansial / semua draf AI yang ditinjau | Shadow/live dipisah; log revisi | Tetapkan arti substansial; koreksi ejaan tidak harus setara salah lokasi |
| CashConversion30 | Pilot evaluasi selesai yang membayar dalam 30 hari / pilot evaluasi selesai yang 30 harinya matang | Cohort evaluasi; kontrak dan payment ledger | Signed-only ditampilkan terpisah; pending bukan gagal |
| Referral30 | Akun diminta yang memberi perkenalan berizin dalam 30 hari / akun diminta yang 30 harinya matang | Cohort permintaan; CRM | Sumber utama satu, assisted sources tetap dicatat |
| Blended CAC | Semua biaya akuisisi lengkap / akun baru berbayar dari cohort cocok | Cohort dan jeda penjualan; ledger biaya | Unknown tanpa input; tidak terbatas/undefined jika nol konversi |
| NRR | (MRR awal + ekspansi - kontraksi - churn) cohort sama / MRR awal cohort | Bulanan, akun berbayar; billing ledger | N/A tanpa basis MRR, tidak termasuk fee pilot |

Contoh sintetis: tiga akun telah mencapai org.onboarded pada awal limited-live sesudah baseline dan shadow; dua telah melewati 14 hari sejak event itu, satu masih berumur lima hari. Bila satu dari dua akun matang aktif dalam window, Activation14 adalah 1/2, dengan satu pending. Angka 1/3 mencampur window. Akun yang baru pilot.prepared belum masuk contoh penyebut ini; tampilkan waktu menunggu limited-live secara terpisah. Untuk tiket, dari sepuluh submission, hanya enam yang sudah berumur 14 hari dan empat selesai tepat waktu; VerifiedResolution14 adalah 4/6 dengan empat pending, bukan 4/10. Simpan semua baris yang dikecualikan dan alasannya.

## Pengumpulan yang dapat diperiksa

E menyediakan ID tenant/akun internal, ID event, timestamp, actor role, event type, status sebelum/sesudah, dan revision. Marketing hanya menerima ekspor minimum tanpa foto, isi laporan, identitas pelapor, lokasi rinci, atau reporter token. Q menghubungkan observasi waktu ke kategori dan kondisi kerja; P menghubungkan source akun dengan penawaran dan pembayaran. Catat timezone dan batas hari secara konsisten. Jangan menganggap status `verified_closed` setara AI confidence.

Google Analytics melarang pengiriman PII, termasuk lewat URL atau parameter kampanye. Karena itu tracker marketing tidak masuk halaman receipt/token dan UTM tidak memuat email atau identitas pembeli. Ini batas penggunaan kandidat layanan, bukan pernyataan StreetProof sudah patuh hukum. [M-02: Google Analytics PII](https://support.google.com/analytics/answer/6366371?hl=en)

## RACI dan ritme

| Domain | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| ICP, kanal, penawaran, budget | P | P | Q | E, A |
| Onboarding dan log bantuan | Q | P | E, A, pengguna pelanggan | Tim |
| Definisi/kualitas evaluasi AI | A | P | Q, operator | E |
| Event, ekspor, akses data | E | P | A, Q, pemilik data pelanggan | Tim |
| Baseline, retensi, beban pengguna | Q | P | A, supervisor pelanggan | E |
| Izin kasus/referral | Q | P | Pemilik data/komunikasi pelanggan | Tim |
| Penghentian/pembaruan pilot | P | P | Q, E, A, sponsor pelanggan | Pengguna yang terdampak |

P bertanggung jawab atas keputusan StreetProof; pelanggan tetap memiliki persetujuan internalnya sendiri. Mingguan: 30 menit scoreboard `x/n`, pending, biaya, dukungan, dan satu keputusan. Bulanan: 60 menit menguji source data, margin, loss reasons, dan budget. Kuartalan: 90 menit memilih ulang ICP, kanal, scope, dan kapasitas. Dua bulan upaya naik tanpa tambahan percakapan ICP memicu perubahan kanal; dukungan lebih dari dua jam/site/minggu selama dua minggu menahan akun baru. Insiden kritis menghentikan live dan publikasi klaim sampai review.

## Keputusan terbuka menurut dampak

| Urutan | Keputusan dan pemilik | Yang terhambat | Bukti berikutnya |
|---|---|---|---|
| 1 | Fully loaded CAC dan kas tersedia, P | Budget, payback, skala kanal | Ledger waktu/kas dan cohort pembayaran matang |
| 2 | Sponsor, akses, pembeli, P | Semua pilot dan willingness-to-pay | Enam percakapan dan proses keputusan bernama |
| 3 | Volume/nilai masalah, Q | ROI dan ICP | Baseline sebanding, termasuk beban teknisi |
| 4 | Izin data, hosting, retensi, P+E | Data nyata | Persetujuan pemilik data dan review kontrol |
| 5 | Waktu/keahlian tim, P | Janji deliverable dan layanan | Alokasi per orang serta gap kemampuan |
| 6 | Akses Meta/provider dan produk, E+A | Demo dan AI live | Uji akun, terms, quota, fallback |
| 7 | Harga, pajak, scope, renewal, P | Penawaran/kontrak | REV-01 dan review komersial |
| 8 | Kanal, domain, email, analytics, P+E | Distribusi dan instrumentasi | Inventaris nyata dan uji minimum |
| 9 | Publikasi/hackathon, Q+P | PR, logo, studi kasus | Izin dan hasil resmi yang diverifikasi |

## Indeks tindakan

Mulai dari [ringkasan](01-executive-summary.md), gunakan [roadmap 90 hari](09-roadmap-90-days.md) untuk eksekusi, [outlook](10-outlook-12-months.md) untuk sensitivitas dana, dan [139 ide](12-tactical-idea-bank.md) untuk inventaris yang tidak semuanya dijalankan. P memperbarui keputusan dan sumber ketika bukti baru masuk. Dokumen ini berstatus usulan berbasis riset, bukan laporan hasil pelanggan.

Kontrak produk untuk cohort dan event berada di [metrics-and-events](../03-product/metrics-and-events.md). Gunakan definisi produk sebagai rujukan bersama; FirstPassRouting7 memakai tujuh hari follow-up untuk keputusan routing awal. Aktivasi organisasi 14 hari, keputusan berbayar 30 hari sesudah evaluasi pilot, resolusi tiket 14 hari, dan reopen 14 hari adalah window yang berbeda.

MET-14 menghitung kontrak/invoice berbayar yang disepakati sebagai paid commitment. CashConversion30 di sini adalah submetrik yang lebih ketat dengan bukti pembayaran aktual. Tampilkan keduanya secara terpisah dengan cohort 30 hari setelah pilot selesai; minat, tanda tangan, invoice, dan kas tidak boleh digabung. Persiapan marketing sebelum baseline dicatat sebagai pilot.prepared. org.onboarded hanya dicatat saat limited-live diaktifkan setelah baseline dan shadow, dengan site, peran, izin data nyata, teknisi, dan supervisor siap; dalam jadwal usulan ini awal minggu pilot ke-5. Jangan memakai tanggal persiapan untuk memulai Activation14. Catat TimeToLive secara terpisah agar keterlambatan persiapan tetap terlihat.

