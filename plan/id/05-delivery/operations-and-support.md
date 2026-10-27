# Operasi dan dukungan

DEL-06 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/05-delivery/operations-and-support.md)

Daftar isi: [Rekomendasi dan batas layanan](#rekomendasi-dan-batas-layanan) · [Matriks runbook](#matriks-runbook) · [Alur dukungan](#alur-dukungan) · [Ritme operasi dan kontrol perubahan](#ritme-operasi-dan-kontrol-perubahan) · [Keluar dan portabilitas](#keluar-dan-portabilitas) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Rekomendasi dan batas layanan

Jalankan pilot satu site dengan dukungan, kontak utama/cadangan bernama, dan alur kerja manual. StreetProof menangani kerja korektif non-darurat; prosedur darurat site tetap terlihat dan mandiri. Dukungan 24/7 atau respons terjamin tidak diasumsikan. Sebelum penggunaan langsung, P dan pelanggan menyepakati cakupan, channel, zona waktu bisnis, severity, target, pengecualian, serta kewenangan eskalasi. Opsi perencanaan adalah hari kerja 09.00-17.00 WIB, bergantung staf nyata; ini bukan komitmen layanan.

Onboard pemilik data, operator, teknisi, dan supervisor secara terpisah. Demonstrasikan satu report, satu unggah gagal, satu AI gagal, satu penyelesaian ditolak, serta satu tiket reopen. Ajarkan isi akses tanda terima/status dan cara mencabutnya. Sediakan panduan singkat Indonesia, aturan bukti kategori, serta kontak masalah akses. Hindari input rutin tambahan yang menghabiskan klaim penghematan waktu.

## Matriks runbook

| Gejala | Tindakan segera | Pemulihan dan catatan | Pemilik |
| --- | --- | --- | --- |
| AI antre/gagal | Tampilkan status dan triase manual; jangan kirim ulang report | Periksa penyedia/lease/batas, retry terbatas atau lewati; catat model/kelas error | A/E |
| Unggahan macet/ditolak | Pertahankan draf aman dengan masa berlaku; lanjut atau foto baru | Periksa izin, byte/tipe, scanner, storage; file gagal bukan bukti | E/Q |
| Revisi usang | Tampilkan keputusan/tindakan kini dan minta pengguna meninjau | Tanpa penimpaan atau replay otomatis keputusan berubah | E |
| Teknisi tidak bisa update | Periksa penugasan dan keanggotaan terkini | Pulihkan akses sah, jangan beri admin luas sebagai jalan pintas | E/Q |
| Penyelesaian ditolak | Tampilkan alasan supervisor dan upaya asli | Teknisi melanjutkan, unggah bukti koreksi, kirim upaya baru | Supervisor/operator pelanggan |
| Antrean menumpuk/worker crash | Lindungi intake, batasi job terkait, periksa umur tertua | Rekonsiliasi outbox, lease, dedup; restart aman | E/A |
| Notifikasi hilang | Status kerja aplikasi tetap acuan | Periksa penerima/catatan kirim, rekonsiliasi kiriman tak pasti, retry terbatas | Q/E |
| Dugaan kebocoran data | Jeda akses terdampak, cabut kredensial, simpan bukti minimum | Tentukan dampak, batasi, tinjau kewajiban/komunikasi disepakati | E/P |
| DB/storage mati | Tampilkan tanpa konfirmasi tahan lama; ikuti proses manual pelanggan | Restore terisolasi, rekonsiliasi media/event, terapkan ledger hapus, lalu buka akses | E |
| Permintaan hapus | Verifikasi pemohon/kewenangan dan lokasi semua kelas | Cabut, hapus data aktif, lacak akhir backup, periksa tombstone jumlah kelas | P/E |

Langkah teknis dan target lengkap ada di [keandalan](../04-technical/reliability-and-observability.md) serta [privasi](../04-technical/security-privacy-and-governance.md). Tindakan runbook tidak mengotorisasi outreach eksternal; pembaruan pelanggan mengikuti channel disepakati yang diizinkan.

## Alur dukungan

Buat catatan dukungan dengan tenant/site, severity, waktu pertama terlihat, alur terdampak, langkah reproduksi aman, ID korelasi, pemilik, waktu pembaruan berikut, serta bukti selesai. Jangan menempelkan token pelapor, tautan media bertanda tangan, atau foto pribadi dalam chat umum. Pisahkan konfirmasi diterima dari penyelesaian. P memiliki komunikasi pelanggan; E pembatasan/pemulihan; A penyebab terkait model; Q memverifikasi alur pulih dengan operator.

Usulkan konfirmasi kritis dalam satu jam bisnis tercakup dan rutin paling lambat hari bisnis tercakup berikutnya hanya jika staf mendukung. Sepakati target sebelum menawarkannya, catat hasil nyata, dan ubah cakupan bila gagal. Di luar cakupan, arahkan darurat ke proses site disetujui; jangan menyiratkan kotak masuk dukungan mengirim responder.

## Ritme operasi dan kontrol perubahan

Setiap hari saat langsung terbatas, periksa intake gagal, job terlambat, antrean bukti/verifikasi, belanja, dan pembersihan retensi. Mingguan, Q meninjau data waktu aktif hilang, beban teknisi, salah routing, serta kohort reopen matang dengan P/A; E memeriksa izin, backup selesai, pertumbuhan storage. Rotasi/cabut akses saat anggota keluar. Latih restore sebelum pilot dan setelah perubahan material; catat waktu serta jendela kehilangan nyata.

Rilis perubahan kecil ditinjau melalui staging dengan bukti penerimaan. Jenis media baru, mode penyedia, wilayah data, retensi, tindakan otonom, atau integrasi membuka gerbang kesiapan terkait. Perubahan prompt/model adalah rilis dengan evaluasi berversi dan rollback. Pertahankan riwayat tiket saat memperbaiki cacat; jangan menulis ulang bukti agar metrik membaik.

## Keluar dan portabilitas

Pada akhir pilot, pelanggan memilih lanjut berbayar, perpanjangan karena bukti kurang, atau keluar. Berikan CSV scope berwenang dan manifest media disepakati, jelaskan catatan lama/belum terverifikasi, cabut pengguna/token/integrasi, hapus data aktif sesuai jadwal, serta nyatakan akhir backup/batas sisa. Uji keterbacaan ekspor dan keamanan formula. Jangan menyimpan konten pelanggan untuk pelatihan atau pemasaran tanpa izin valid terpisah.

## Ketergantungan dan tindakan berikutnya

P mengisi perjanjian operasi dengan nama, channel, zona waktu, dan target layak nyata. E menyediakan checklist responder/runbook dan bukti restore; A menetapkan kewenangan nonaktif/retry AI; Q mengonfirmasi pelatihan pelanggan dan latihan keluar. [RACI](team-and-raci.md) menetapkan pemilik; [register risiko](risk-register.md) menentukan pemicu stop. Kontrol usulan ini bukan bukti dukungan sudah berjalan.
