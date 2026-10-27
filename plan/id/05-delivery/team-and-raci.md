# Tim dan RACI

DEL-03 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/05-delivery/team-and-raci.md)

Daftar isi: [Rekomendasi dan peran](#rekomendasi-dan-peran) · [RACI proyek](#raci-proyek) · [Serah terima dan ritme review](#serah-terima-dan-ritme-review) · [Cakupan dan batas keputusan](#cakupan-dan-batas-keputusan) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Rekomendasi dan peran

Rencanakan berdasarkan tanggung jawab bernama serta jam tersedia, bukan pegawai asumtif. P adalah pemimpin produk/komersial; E engineer aplikasi/backend; A engineer AI/evaluasi; Q UX/QA/enablement pelanggan. Ini peran, bukan empat pegawai penuh waktu terkonfirmasi. Peran pelanggan terpisah: pembeli/pemilik data, operator, teknisi, supervisor. Belum ada sponsor, hubungan kerja, atau partisipasi pelanggan yang terbukti.

| Ukuran tim | Pembagian | Konsekuensi wajib |
| --- | --- | --- |
| Dua orang | Orang 1 P+Q; Orang 2 E+A | Demo sintetis sempit, pilih duplikat manual dan dashboard minimum; lindungi waktu review |
| Tiga orang | P+Q, E, A dengan dukungan QA bersama | Tetapkan satu pemilik penerimaan; bersama tidak berarti dimiliki |
| Empat orang | P, E, A, Q | Discovery/evaluasi/QA paralel; E tetap jalur kritis teknis |

Gunakan [estimasi beban](work-breakdown-and-estimates.md) untuk memeriksa ketersediaan. Demo penuh dua orang berjumlah 68 dan 76 jam per orang dibanding asumsi kapasitas 50 jam; opsi diperkecil 40 dan 44. Jangan menyelesaikan celah ini dengan lembur tersirat. Jika engineer tidak berpengalaman keamanan/operasi, biayai review spesialis atau tunda data nyata; label peran bukan bukti kompetensi.

## RACI proyek

R = mengerjakan, Ac = satu pemilik keputusan, C = dikonsultasikan, I = diberi informasi. Kolom A adalah peran AI; Ac menghindari kerancuan dengan akuntabilitas. Pelanggan berarti pemilik pelanggan bernama untuk keputusan terkait, bukan peserta yang diasumsikan.

| Keputusan atau hasil | P | E | A | Q | Pelanggan |
| --- | --- | --- | --- | --- | --- |
| ICP/cakupan dan uji komersial | Ac/R | C | C | C | C |
| Arsitektur, batas akses, pemulihan | C | Ac/R | C | R | C |
| Adapter AI, label, evaluasi | C | R | Ac/R | R | C |
| Alur/UX dan bukti penerimaan | C | R | C | Ac/R | C |
| Pemberitahuan, retensi, keputusan transfer pelanggan | R | R | C | C | Ac |
| Rekomendasi kesiapan pilot | Ac | R | R | R | C |
| Izin pelanggan mulai/stop pilot | R | C | C | R | Ac |
| Kewenangan penugasan operator/teknisi dan verifikasi | I | C | I | C | Ac/R |
| Pembatasan insiden dan pemulihan | C | Ac/R | R jika terkait AI | R | I |
| Dukungan pelanggan dan komunikasi disepakati | Ac | R | C | R | C |
| Pengukuran dan readout pilot | R | C | R | Ac/R | C |
| Keputusan lanjut/beli berbayar | R | I | I | C | Ac |

Untuk keputusan produk internal, P memutuskan cakupan; untuk data atau pembelian milik pelanggan, pemilik pelanggan memutuskan. Kewenangan supervisor bersifat operasional dan berasal dari pelanggan, bukan RACI proyek. Penutupan independen diutamakan; pengecualian staf wajib dicatat dan dianalisis terpisah.

## Serah terima dan ritme review

E memberi Q skenario dapat dijalankan, hasil harapan, dan kegagalan diketahui, bukan screenshot saja. A memberi E skema berversi, perilaku timeout/retry, dan fixture; Q meninjau batas AI pada antarmuka. P memberi E/Q peran site, kategori, retensi, dan penerima notifikasi disepakati. Q memberi P paket bukti yang memisahkan hasil teramati dari asumsi dan cacat terbuka.

Selama sepuluh hari, lakukan pemeriksaan singkat blocker/pemilik harian serta review lebih lengkap hari 2, 5, dan 8. Selama pilot, adakan satu review alur/pengukuran mingguan dengan izin serta ketersediaan disepakati dahulu. Sisihkan waktu dukungan dan pemulihan. Serah terima tertulis menyertakan revisi kini, tautan bukti, tindakan berikut, serta pemilik eskalasi.

## Cakupan dan batas keputusan

Sebelum data langsung, tunjuk utama dan cadangan insiden operasional, operator yang dapat bekerja manual, serta supervisor yang dapat menolak/reopen. Dalam proyek dua orang, engineer sama mungkin responder teknis utama sekaligus satu-satunya; batasi jam dukungan dan cakupan sesuai keadaan. Dukungan 24/7 tidak dijanjikan.

Rencana ini sendiri tidak mengotorisasi outreach eksternal atau akses akun. P menyiapkan perjanjian pilot dan proposal komersial yang dapat ditinjau; komunikasi pelanggan mengikuti instruksi pengguna dan channel disepakati. Perubahan produk dengan pemrosesan data pribadi baru, keputusan otonom, atau persyaratan pengadaan membuka ulang gerbang kesiapan terkait.

## Ketergantungan dan tindakan berikutnya

P mengisi nama nyata, ketersediaan, kewenangan keputusan, dan cakupan cadangan. E/A mengidentifikasi celah keahlian; Q memastikan kapasitas review terpisah dari implementasi. Peran pelanggan belum terisi sampai sponsor nyata setuju. Gunakan [operasi](operations-and-support.md) serta [pilot](pilot-and-roi-validation.md) untuk mengubah peta tanggung jawab ini menjadi kesepakatan kerja.
