# Infrastruktur dan biaya

TECH-08 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/04-technical/infrastructure-and-costs.md)

Daftar isi: [Rekomendasi dan asumsi](#rekomendasi-dan-asumsi) · [Harga resmi dibaca pada 2026-10-20](#harga-resmi-dibaca-pada-2026-10-20) · [Simulasi beban dan biaya unit](#simulasi-beban-dan-biaya-unit) · [Anggaran lengkap dan kontrol](#anggaran-lengkap-dan-kontrol) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Rekomendasi dan asumsi

Anggarkan layanan web terkelola, worker terpisah, dan proyek Supabase sebelum data nyata. Dekatkan compute dengan database bila disetujui; Singapura bergantung pada ketersediaan layanan dan tinjauan pemilik data/transfer. [Wilayah Render](https://docs.render.com/regions) (T-10) mencantumkan Singapura dan memerlukan layanan baru untuk pindah wilayah. Kedekatan geografis bukan bukti transfer sah atau latensi terukur.

Pilih layanan produksi berbayar setelah benchmark. Instance 512 MB dapat gagal saat build atau decode gambar; skenario perencanaan pilot memakai 2 GB untuk web dan worker. Belum ada infrastruktur dibeli atau di-deploy. Konversi berikut memakai USD 1 = IDR 16.000 hanya sebagai skenario, bukan kutipan kurs terkini.

## Harga resmi dibaca pada 2026-10-20

| Komponen | Harga resmi tercantum | Batas |
| --- | --- | --- |
| Supabase Pro | Mulai USD 25/bulan, proyek pertama termasuk; tambahan mulai USD 10 | Aturan paket dan compute berlaku; belum termasuk kelebihan/add-on |
| Kuota Pro Supabase | DB 8 GB/proyek, file 100 GB, egress uncached 250 GB dan cached 250 GB | Aturan pemakaian bersama per organisasi perlu diperiksa |
| Kelebihan storage Supabase | USD 0,0213/GB/bulan | Tidak mencakup egress/transformasi |
| Backup DB harian Supabase | Tujuh hari pada Pro | Verifikasi backup objek terpisah |
| PITR Supabase | Sekitar USD 100/bulan untuk jendela pemulihan tujuh hari | Kelayakan/compute dan tagihan nyata perlu diperiksa |
| Workspace Render | Hobby USD 0; Pro USD 25/bulan, compute tambahan | Pilih paket sesuai tim/tata kelola nyata |
| Compute web/worker Render | USD 7/bulan untuk 512 MB; USD 25/bulan untuk 2 GB, per layanan | Ketersediaan, beban, dan durasi tagih berpengaruh |
| Muse Spark Standard | USD 1,25 input, 4,25 output, 0,15 cached input per 1 juta token | Tokenisasi gambar nyata, akses, retry, dan model harus diukur |

Harga adalah fakta penyedia, bukan penawaran pelanggan: [harga Supabase](https://supabase.com/pricing) (T-09), [backup](https://supabase.com/docs/guides/platform/backups) (T-08), [harga Render](https://render.com/pricing) (T-13), [harga Meta](https://dev.meta.ai/docs/pricing-rate-limits) (T-11). Periksa ulang sebelum persetujuan. Jangan mengasumsikan kredit promosi, diskon, pajak termasuk, kurs, atau kelayakan akun. Harga Contributor dikecualikan karena izin pelatihan bukan default usulan data nyata.

## Simulasi beban dan biaya unit

Asumsikan dua foto tersanitasi rata-rata 1 MB per tiket dan retensi operasional 90 hari didekati tiga bulan. Abaikan overhead turunan/backup hanya pada estimasi awal, lalu tambahkan ke tagihan terukur. Media tersimpan kira-kira `tickets_per_month * 2 * 0.001 GB * 3`; MB/GB desimal digunakan konsisten.

Simulasi AI mengasumsikan 1.500 token setara input tertagih dan 500 token output per tiket, satu draf, serta overhead retry 20%. Ini asumsi beban termasuk placeholder token gambar, bukan pemakaian Meta terukur. `C_AI = N * 1.2 * (1500*1.25 + 500*4.25)/1,000,000 = N * USD 0.0048`. Pemakaian nyata dapat berbeda besar sesuai dimensi gambar dan perilaku permintaan.

| Skenario | Tiket/bulan | Estimasi media tersimpan | Dasar perencanaan | Simulasi AI | Subtotal ilustratif |
| --- | --- | --- | --- | --- | --- |
| Demo sintetis dihosting | 100 | 0,6 GB | Supabase Free + Render Hobby + 2 x USD 7 = USD 14 | USD 0,48 | USD 14,48, sekitar Rp231.680 |
| Pilot satu site | 1.000 | 6 GB | Supabase Pro 25 + Render Pro 25 + 2 x 25 = USD 100 | USD 4,80 | USD 104,80, sekitar Rp1.676.800 |
| Awal sepuluh site | 10.000 | 60 GB | USD 100 hanya jika benchmark mendukung | USD 48 | USD 148, sekitar Rp2.368.000 |

Demo sintetis lokal dapat tanpa biaya infrastruktur hosting. Demo hosting pada tabel opsional dan batas/pausing Free berpengaruh. Pilot memiliki dasar lebih kecil USD 64 bila dua layanan USD 7 memadai berdasarkan benchmark. Staging kecil terpisah menambah sekitar USD 24/bulan: proyek Supabase tambahan 10 + web 7 + worker 7. Jadi pilot dengan staging itu dan AI simulasi USD 128,80; sepuluh site USD 172. Ini subtotal perencanaan belum lengkap, bukan total biaya kepemilikan.

Subtotal berbasis token ini adalah sensitivitas terpisah dari [model tunai bisnis](../02-business/unit-economics-and-costs.md) konservatif, yang memakai Rp1.940.000/bulan untuk pilot satu site dan Rp3.720.000/bulan untuk sepuluh site dengan cadangan AI/operasi dinyatakan. Gunakan skenario tunai lengkap itu untuk pendanaan komersial, bukan subtotal USD belum lengkap. Jangan menjumlahkan kedua model atau menyebut salah satunya tagihan teramati.

## Anggaran lengkap dan kontrol

`Total = platform + web + worker + DB upgrades + storage + uncached/cached egress + AI + retries + notifications + object backup + monitoring + staging + domain + taxes + FX/payment fees + support + labor`. Jangan menghitung kredit compute termasuk dua kali atau mengabaikan biaya workspace. Catat pemakaian nyata per tenant/job tanpa payload sensitif. Masukkan gaji/opportunity cost pendiri serta waktu implementasi pelanggan dalam ekonomi biaya penuh; nilainya belum diketahui.

Usulkan peringatan pada 50%, 80%, dan 100% batas bulanan disepakati, kuota AI/unggah per tenant, retry terbatas, batas thumbnail, dan sakelar AI-off manual. Spend cap penyedia mungkin tidak mencakup semua sumber tertagih; verifikasi kontrol akun. Benchmark unggahan bersamaan, memori gambar, koneksi DB, dan umur antrean sebelum mengubah ukuran. Redis tidak direncanakan kecuali pengukuran membenarkannya.

## Ketergantungan dan tindakan berikutnya

P menetapkan batas bulanan terjangkau serta asumsi kurs/pajak; E memvalidasi wilayah, ketentuan paket, staging, dan cakupan pemulihan; A mencatat pemakaian token/gambar nyata pada fixture berizin. Ganti simulasi dengan model tagihan tingkat akun sebelum tawaran pilot berbayar. Lihat [keandalan](reliability-and-observability.md) untuk tradeoff pemulihan dan [ROI](../05-delivery/pilot-and-roi-validation.md) untuk nilai pelanggan yang terpisah dari biaya hosting.
