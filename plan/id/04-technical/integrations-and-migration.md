# Integrasi dan migrasi

TECH-06 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/04-technical/integrations-and-migration.md)

Daftar isi: [Rekomendasi](#rekomendasi) · [Kontrak data dan kepemilikan](#kontrak-data-dan-kepemilikan) · [Prosedur migrasi](#prosedur-migrasi) · [Perilaku kegagalan](#perilaku-kegagalan) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Rekomendasi

Sediakan operasi mandiri untuk tim tanpa CMMS dan ekspor terkendali bagi tim yang memilikinya. Mulai dengan CSV dan pemetaan pengenal terdokumentasi. CMMS dua arah khusus, WhatsApp Business, peta, dan MCP ditunda sampai sponsor membuktikan kebutuhan alur kerja dan gerbang penerimaan inti lulus. Tidak diasumsikan ada kemitraan penyedia atau hak API.

| Antarmuka | Cakupan pilot | Gerbang perluasan |
| --- | --- | --- |
| Adapter Meta | Draf khusus server dari bukti minimum | Probe akun, ketentuan Standard, evaluasi, retry terbatas |
| Supabase Auth/Storage | Identitas anggota dan bukti privat | Penolakan tenant, batas kredensial, latihan pulih/hapus |
| Notifikasi | Notifikasi tugas/status dalam aplikasi, adapter email opsional | Izin penerima, catatan pengiriman, pemilik dukungan |
| Ekspor/impor CSV | Pemetaan ditinjau dan dry-run | Izin pemilik data, rekonsiliasi, rollback |
| CMMS yang ada | Awalnya ekspor pendamping satu arah | Sistem acuan dan pemilik konflik disepakati |
| WhatsApp/peta/MCP | Di luar inti | Alasan akses, harga, privasi, dan kegunaan terpisah |

## Kontrak data dan kepemilikan

Kolom CSV v1: `external_id, site_code, location_text, category_code, priority, description, reported_at, assigned_external_user_id, legacy_status, source_system`. Gunakan UTF-8, timestamp ISO dengan offset, pemetaan kategori/status berversi, serta kunci unik stabil `source_system + external_id` per tenant. Ekspor berisi status kerja, timestamp, referensi bukti, dan metadata verifikasi; token pelapor mentah serta URL media permanen dilarang. Ekspor media memerlukan manifest berwenang terpisah dan jendela akses singkat.

Sepakati apakah StreetProof atau CMMS memiliki penugasan dan penutupan. Jika CMMS menjadi acuan, status ditutup dari impor saja tidak dapat menjadi verifikasi supervisor tanpa pemetaan bukti/persetujuan terdokumentasi. Pertahankan status eksternal asli di samping status normal. Nilai tidak didukung masuk antrean tinjauan, bukan ditebak. Reopen dan pembatalan harus berpindah dua arah secara eksplisit sebelum sinkronisasi dua arah dipertimbangkan.

## Prosedur migrasi

1. P dan pelanggan menginventarisasi sumber, data pribadi, volume, dan izin. Impor hanya pekerjaan terbuka serta riwayat yang disepakati.
2. E memvalidasi sampel dan menghasilkan kesalahan per baris, kandidat duplikat, serta jumlah lokasi hilang. Dry-run tidak mengubah kerja langsung.
3. Q dan pemilik site menyetujui pemetaan kategori, lokasi, pengguna, status. Catatan lama ditutup tetap metadata `legacy_closed`, bukan diam-diam verified_closed.
4. Jalankan batch idempoten dengan ID migrasi, digest konten, dan hitungan rekonsiliasi. Pisahkan waktu pengamatan impor dari waktu impor.
5. Bandingkan baris sumber, baris diterima/ditolak, tiket kanonis, jumlah bukti, dan total status/site. Dokumentasikan pengecualian.
6. Sepakati jendela cutover singkat dan pertahankan snapshot sumber berizin. Rollback hanya catatan impor belum diubah; pertahankan kerja manusia setelahnya dan selesaikan konflik manual.

## Perilaku kegagalan

Konsumen outbox melakukan deduplikasi ID event dan mencatat upaya, ID pesan penyedia, serta hasil akhir. Timeout setelah kirim dapat berarti pesan sudah sampai; rekonsiliasi sebelum retry bila penyedia mendukungnya. Kerja pelanggan tetap ter-commit saat notifikasi gagal. Pembaruan terlambat tidak menimpa revisi baru; edit eksternal bersamaan masuk tinjauan konflik. Jangan mengklaim pengiriman exactly-once lintas API eksternal tanpa semantik penyedia terverifikasi.

[Dokumentasi Supabase Queues](https://supabase.com/docs/guides/queues) (T-05) mendukung evaluasi job tahan lama, sedangkan [harga/batas Meta](https://dev.meta.ai/docs/pricing-rate-limits) (T-11) memerlukan pembatasan tingkat tim dan penanganan Retry-After. Dokumentasi penyedia bukan pengujian akun.

## Ketergantungan dan tindakan berikutnya

P memperoleh sampel ekspor dan menunjuk pemilik sistem acuan. E menulis spesifikasi pemetaan dan dry-run reversibel; Q memeriksa lima baris representatif termasuk reopen dan bukti hilang. Tolak cakupan integrasi khusus sampai volume dan kepemilikan jelas. Kaitkan perubahan kontrak ke [keputusan arsitektur](architecture-decisions.md) dan hargai integrasi terpisah dari langganan site.
