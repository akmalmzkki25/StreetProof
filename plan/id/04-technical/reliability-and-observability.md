# Keandalan dan observabilitas

TECH-09 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/04-technical/reliability-and-observability.md)

Daftar isi: [Usulan sasaran layanan](#usulan-sasaran-layanan) · [Job tahan lama dan konkurensi](#job-tahan-lama-dan-konkurensi) · [Telemetri dan peringatan](#telemetri-dan-peringatan) · [Runbook pemulihan dan deployment](#runbook-pemulihan-dan-deployment) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Usulan sasaran layanan

Utamakan intake tahan lama dan transisi status benar dibanding ketersediaan model. Ini target perencanaan pilot, bukan SLA atau kinerja teramati. Sepakati jam dukungan dan anggaran pemulihan dengan pelanggan sebelum data langsung.

| Indikator | Usulan target | Batas pengukuran |
| --- | --- | --- |
| Ketersediaan API | >=99% selama jam operasi pilot disepakati | Permintaan API valid yang memenuhi syarat; kegagalan dependensi dilaporkan terpisah |
| Konfirmasi report tahan lama | p95 <=2 detik | Setelah bukti ready; tidak termasuk unggah jaringan dan AI |
| Kesiapan draf AI | p95 <=60 detik pada beban disepakati | Sejak job ter-commit; waktu antre dan kegagalan dihitung pada tingkat terpisah |
| Antrean usang | Peringatan jika job layak tertua >5 menit | Per kelas job dan tenant; kecuali kerja terjadwal masa depan |
| Pemulihan | RPO <=24 jam; RTO <=4 jam kerja | DB dan media wajib bersama, dibuktikan sebelum data langsung |
| Pembersihan hapus | Objek yatim dalam 24 jam; kelas lain sesuai jadwal | Hitung kegagalan dan umur retry, bukan sekadar scheduler berhasil |

Backup DB harian saja tidak membuktikan pemulihan media ujung ke ujung. [Dokumentasi backup Supabase](https://supabase.com/docs/guides/platform/backups) (T-08) menjelaskan pemulihan database dan jendela Pro tujuh hari. Inventaris backup objek, enkripsi, retensi, dan perilaku hapus terpisah. Jika RPO/RTO usulan tidak dapat dilatih, kurangi atau tunda cakupan langsung daripada menerbitkan janji tanpa bukti.

## Job tahan lama dan konkurensi

Gunakan mutasi domain transaksional + event tetap + outbox. Kirim ke pgmq/Supabase Queues tervalidasi, dengan rekonsiliasi berkala baris belum terkirim. Setiap job memuat eventId, tenantId, inputRevision, attempt, nextAttemptAt, dan metadata lease. Efek samping worker memakai kunci hasil unik serta checkpoint; crash setelah penyedia berhasil tetap dapat menyebabkan tagihan ulang yang wajib diukur.

[Klaim pengantaran jendela visibilitas Supabase](https://supabase.com/docs/guides/queues) (T-05) tidak membuktikan efek eksternal exactly-once. Gunakan retry terbatas, jitter, Retry-After, karantina job bermasalah, serta tindakan retry operator dengan audit. Usulan tiga percobaan AI dan lima notifikasi dapat dikonfigurasi. Job panjang memperbarui lease; lease berakhir memungkinkan pemulihan tanpa menimpa revisi manusia lebih baru. Terapkan pembagian adil tenant dan batas agar lonjakan unggahan satu pihak tidak menghabiskan layanan pihak lain.

## Telemetri dan peringatan

| Sinyal | Kolom/ukuran minimum | Pemilik tindakan |
| --- | --- | --- |
| Log permintaan | requestId, templat rute, tipe aktor, ID tenant opak, kode, durasi | E menyelidiki; tanpa token/kontak/gambar |
| Korelasi trace | reportId, ticketId, eventId, jobId, ID permintaan penyedia | E/A mengikuti satu insiden lintas API/worker |
| Metrik domain | Jumlah status, kelengkapan bukti, penolakan/reopen, perubahan tugas | P/Q memeriksa kesehatan alur dan denominator |
| Metrik antrean | Kedalaman jatuh tempo, umur tertua, retry, gagal terminal, lease berakhir | E restart/rekonsiliasi aman |
| Metrik AI | Validitas skema, timeout, koreksi, token/biaya, draf usang | A menonaktifkan/mengembalikan model atau prompt |
| Keamanan/retensi | Permintaan lintas scope ditolak, kredensial dicabut, umur hapus | E mengeskalasi dugaan bocor, Q memeriksa pembersihan |
| Kapasitas | Memori/OOM, koneksi DB, disk, storage/egress, belanja | E mengubah ukuran berbukti; P menyetujui anggaran |

Peringatkan kegagalan tulis intake, antrean tumbuh, kegagalan validasi terminal berulang, backup/pembersihan terlewat, serta belanja tak terduga. Batasi frekuensi peringatan dan tetapkan satu penanggung jawab plus cadangan. Dashboard tanpa responder/runbook tidak cukup. Jangan mencatat token pelapor mentah, URL bertanda tangan, prompt, atau foto ke sistem log secara default.

## Runbook pemulihan dan deployment

Sebelum pilot: buat fixture diketahui dengan jumlah tiket/event/bukti, backup database dan objek wajib, pulihkan ke lingkungan terisolasi, terapkan ledger hapus, periksa izin tenant serta hash/referensi objek, dan catat waktu serta jendela kehilangan nyata. Nonaktifkan notifikasi/panggilan model keluar sampai rekonsiliasi selesai. Dokumentasikan objek hilang serta batas restore. Latih sekali sebelum peluncuran dan setelah perubahan storage/skema material; usulkan latihan bulanan selama pilot bila kapasitas memungkinkan.

Untuk rilis, gunakan migrasi kecil ditinjau dengan urutan expand/contract. Backup dan latih rollback sebelum perubahan destruktif. Deploy perubahan event/skema yang kompatibel dengan worker sebelum produsen bila diperlukan. Rollback aplikasi tidak boleh membalik pekerjaan nyata selesai atau membuat revisi lama; gunakan event kompensasi. Endpoint health/readiness minimum dan tanpa rahasia. Selesaikan/drain worker saat deployment; jangan acknowledge job sebelum hasilnya ter-commit.

Saat gangguan, tampilkan status menunggu/gagal dan panduan pemulihan jelas. Jangan mengklaim kiriman berhasil sebelum tersimpan. Jika AI gagal, triase manual tetap tersedia. Jika DB gagal, hentikan penerimaan baru; draf lokal bukan tiket server. Prosedur darurat pelanggan tetap di luar ketersediaan layanan.

## Ketergantungan dan tindakan berikutnya

E memiliki telemetri, latihan pemulihan, dan runbook; A memiliki anggaran kesalahan/model; P menetapkan cakupan dukungan dan eskalasi pelanggan. Q memvalidasi pesan gangguan/retry dengan operator. Penerimaan memerlukan catatan latihan dan skenario kegagalan dari [kualitas](../05-delivery/quality-and-acceptance.md), bukan sekadar klaim fitur penyedia.
