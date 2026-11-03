# Register keputusan

Document ID: FND-03  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/00-foundation/decision-register.md)

## Status keputusan

Semua baris adalah keputusan perencanaan yang diusulkan penulis, bukan hasil persetujuan pembeli. P bertanggung jawab menyelesaikan review dengan E/A/Q sesuai bidang. Keputusan bisnis dapat berubah setelah discovery; kontrol akses dan verifikasi tidak dilemahkan untuk menyesuaikan demo.

| ID | Keputusan usulan | Alasan | Alternatif | Pemicu tinjau ulang |
| --- | --- | --- | --- | --- |
| D-01 | Segmen pertama: gedung komersial; kampus alternatif | Kedekatan pembeli operasional dan alur vendor; hipotesis analitis | Kampus dengan sponsor/data yang lebih siap | Tidak ada pilot gedung yang dapat diakses dalam discovery |
| D-02 | Produk terbatas pada intake sampai verifikasi | Tim kecil perlu menyelesaikan satu siklus | ERP/CMMS penuh | Pembeli hanya memperoleh nilai lewat penggantian sistem penuh |
| D-03 | Manusia memutuskan prioritas penting dan closure | Model tidak berwenang menilai keselamatan/mutu akhir | AI menutup tiket | SOP pemilik data berubah; tetap perlu review risiko |
| D-04 | Token acak untuk status pelapor | Pelapor melihat hasil tanpa akun dan tanpa membuka data tenant | Pencarian publik ID berurutan | Token bocor atau kebijakan mewajibkan autentikasi |
| D-05 | TypeScript modular monolith + worker PostgreSQL | Mengurangi variasi runtime dan beban operasi | FastAPI terpisah/microservices | Keterampilan tim atau eksperimen AI Python terbukti dominan |
| D-06 | Standard mode untuk data pilot nyata | Jangan memilih training-contribution demi diskon secara diam-diam | Contributor mode | Persetujuan data owner dan penilaian kontrak berubah |
| D-07 | Harga per lokasi sebagai eksperimen | Hindari menagih pelapor atau menghambat laporan valid | Harga per laporan atau per pelapor | Volume/dukungan membuat unit lokasi tidak ekonomis |
| D-08 | Baseline eksternal boleh; pengukuran wajib | ROI bergantung metode, bukan fitur timer otomatis | Bangun modul ROI lengkap sebelum belajar | Kualitas catatan waktu tidak dapat diaudit |
| D-09 | Voice/SAM/WhatsApp/MCP sesudah alur inti | Kompleksitas harus memiliki bukti manfaat | Tumpukan model untuk demo | Ada hambatan pengguna yang hanya terselesaikan kemampuan itu |
| D-10 | Dokumentasi dua bahasa dengan ID sama | Mencegah dua spesifikasi berbeda | Ringkasan Inggris saja | Perubahan satu bahasa harus merambat ke pasangan |
| D-11 | PostgreSQL dan object storage kompatibel S3 (MinIO) self-hosted di Docker; autentikasi di aplikasi; menggantikan ADR-002 | Tim sudah menjalankan layanan ini di Docker; tidak perlu akun vendor atau kunci service untuk hackathon; migrasi SQL biasa tetap portabel | Supabase (ADR-002) | Deploy hosted butuh backup terkelola atau row-level security yang tidak sanggup dioperasikan tim |
| D-12 | Muse Spark membandingkan foto sebelum dan sesudah sebagai petunjuk belum terverifikasi untuk supervisor; memperluas cakupan bantuan ADR-004 sebelum evaluasinya, khusus hackathon dengan data sintetis | Tinjauan bukti adalah inti produk, dan foto objek yang salah murah untuk dikenali; skemanya tidak punya kolom vonis dan petunjuk tidak dapat mengubah status atau menghalangi keputusan | Tanpa AI pada bukti penyelesaian; AI yang menerima atau menolak bukti | Evaluasi menunjukkan supervisor mengikuti petunjuk yang salah, atau data nyata masuk sebelum evaluasi itu |
| D-13 | SAM 3.1 menandai kerusakan yang dilaporkan dan Muse Voice Transcribe mengubah pesan suara pelapor menjadi teks yang mereka periksa, keduanya mendahului syarat D-09, khusus hackathon dengan data sintetis; harness evaluasi boleh memakai model Contributor karena datanya sepenuhnya sintetis | Pemilik memutuskan membangunnya setelah alur inti berjalan; penanda hanya menunjuk area dan transkrip disunting sebelum dikirim, jadi keduanya tidak bisa memutuskan apa pun | Tetap pada D-09 dan menunda keduanya; mengirim laporan nyata ke model Contributor | Data nyata masuk, penanda menyesatkan operator, atau transkrip terbukti tidak andal di ponsel nyata |
| D-14 | Bot Telegram menjangkau pelapor, teknisi, dan supervisor, mendahului syarat D-09, sebagai proses terpisah `apps/telegram-bot` dengan long polling. Bot memanggil perintah dan pemeriksaan izin yang sama dengan aplikasi web, dan supervisor tetap memutuskan dengan alasan tertulis setelah melihat foto | Pemilik memutuskannya; chat adalah tempat staf lapangan sudah berada, dan tidak ada aturan yang berubah karena setiap tindakan melewati pemeriksaan yang ada | WhatsApp, yang butuh verifikasi bisnis dan pesan berbayar; notifikasi saja | Data nyata masuk, karena pesan dan foto melewati server Telegram; atau butuh instance kedua, karena hanya satu proses yang bisa melakukan polling per token |
| D-15 | StreetProof dibangun sebagai produk nyata yang bisa dimulai tim gedung dari database kosong; tenggat hackathon mengatur urutan kerja, bukan mempersempit cakupannya. Ini menambah pengelolaan gedung dan lokasi, poster QR siap cetak, zona waktu per gedung (WIB, WITA, WIT), dan peta open source: MapLibre dengan tile OpenFreeMap, serta pencarian alamat Photon lewat server kita. Pin peta dari pelapor bersifat opsional dan tidak pernah dikirim ke model | Pemilik meminta produk nyata, bukan demo, dan memakai library yang terawat alih-alih kode buatan sendiri | Tetap hanya lewat seed demo; Google Maps, yang butuh kunci dan tagihan; server publik Nominatim, yang melarang autocomplete | Data nyata masuk sebelum geocoder di-host sendiri, atau pemakaian tile melebihi layanan gratis OpenFreeMap |
| D-16 | Object storage memakai build MinIO dari Chainguard, dikunci ke digest, karena MinIO berhenti menerbitkan image (Docker Hub dan Quay menolak pull; image resmi terakhir dari September 2025 dan repositorinya sudah diarsipkan). `mc` dari image yang sama menyalin backup harian ke bucket di host lain | API S3, kode aplikasi, dan langkah restore dari D-11 tetap sama, dan deploy baru bisa menariknya lagi; image ini ditambal dan berjalan sebagai non-root | Garage atau RustFS, yang mengubah setup dan butuh migrasi; image resmi yang dibekukan, yang tidak bisa ditarik dan tertinggal perbaikan | Image gratis Chainguard berhenti diperbarui, atau server S3 lain yang terawat terbukti lebih sederhana dijalankan |

## Konsekuensi dan biaya perubahan

D-01 menentukan bahasa penawaran, peserta wawancara dan kategori demo. Jika salah, ubah ICP dan contoh data sebelum menambah fitur. D-02/D-09 menunda peluang integrasi tetapi menjaga kapasitas tim. D-03/D-04 menambah pekerjaan otorisasi dan review; menghapusnya berisiko menyesatkan pelapor atau mengekspos data.

D-05 mengurangi jumlah layanan tetapi mengikat desain job, deploy dan observability pada stack terpilih. Bandingkan lagi bila tim lebih kuat di Python atau region/kontrak tidak sesuai. D-06 menghindari penggunaan data untuk pelatihan tanpa persetujuan; biaya token dapat lebih tinggi. D-07 membutuhkan batas pemakaian yang transparan. D-08 menghemat pembangunan tetapi menuntut disiplin pencatatan.

## Aturan perubahan

P mencatat tanggal, pengusul, bukti baru, keputusan lama/baru, dokumen yang terdampak, dan siapa yang harus mengetahui. E memeriksa perubahan kontrak/data; A memeriksa evaluasi; Q memeriksa alur pengguna. Perubahan ID, state, field wajib, atau definisi metrik wajib diperiksa di kedua bahasa. Lihat [architecture-decisions](../04-technical/architecture-decisions.md) untuk konsekuensi teknis lebih rinci.
