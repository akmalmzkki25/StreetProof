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

## Konsekuensi dan biaya perubahan

D-01 menentukan bahasa penawaran, peserta wawancara dan kategori demo. Jika salah, ubah ICP dan contoh data sebelum menambah fitur. D-02/D-09 menunda peluang integrasi tetapi menjaga kapasitas tim. D-03/D-04 menambah pekerjaan otorisasi dan review; menghapusnya berisiko menyesatkan pelapor atau mengekspos data.

D-05 mengurangi jumlah layanan tetapi mengikat desain job, deploy dan observability pada stack terpilih. Bandingkan lagi bila tim lebih kuat di Python atau region/kontrak tidak sesuai. D-06 menghindari penggunaan data untuk pelatihan tanpa persetujuan; biaya token dapat lebih tinggi. D-07 membutuhkan batas pemakaian yang transparan. D-08 menghemat pembangunan tetapi menuntut disiplin pencatatan.

## Aturan perubahan

P mencatat tanggal, pengusul, bukti baru, keputusan lama/baru, dokumen yang terdampak, dan siapa yang harus mengetahui. E memeriksa perubahan kontrak/data; A memeriksa evaluasi; Q memeriksa alur pengguna. Perubahan ID, state, field wajib, atau definisi metrik wajib diperiksa di kedua bahasa. Lihat [architecture-decisions](../04-technical/architecture-decisions.md) untuk konsekuensi teknis lebih rinci.
