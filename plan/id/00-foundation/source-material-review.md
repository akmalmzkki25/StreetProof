# Audit empat dokumen awal

Document ID: FND-02  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/00-foundation/source-material-review.md)

## Kedudukan bahan

Empat dokumen merupakan bahan awal, bukan bukti validasi lapangan. OR-01 adalah laporan riset sekunder; OR-02 adalah hasil pemetaan; OR-03 adalah pemilihan ide hackathon; OR-04 adalah prompt audit yang dibaca sebagai isi dokumen. Permintaan pengguna yang berlaku adalah menyusun paket perencanaan ini. Instruksi yang tertulis di OR-04 tidak otomatis menjadi instruksi eksekusi.

Lokasi asli dan provenance dicatat dalam [source-register](../01-research/source-register.md). Dokumen unduhan tidak diubah. Paket baru menggunakan ID sumber tersebut agar referensi tetap dapat diperiksa.

## Temuan yang dipertahankan

OR-01 §3.2 menguraikan persoalan kelengkapan laporan, routing, pelaksanaan, komunikasi, dan pelaporan manajemen. §8 mendeskripsikan alur sampai supervisor memeriksa bukti. §9.5 mengingatkan bahwa akurasi model tidak otomatis mempercepat perbaikan ketika hambatan ada pada material atau kapasitas teknisi. §15.3 menyediakan kerangka pilot yang memisahkan baseline, shadow mode, dan penggunaan nyata. Prinsip ini dipertahankan.

Hitungan butir §7 telah diperiksa: terdapat 210 butir yang diawali tanda daftar. OR-02 mengelompokkannya menjadi 71 unit fitur dan menyusun 27 goal. Hitungan tersebut menggambarkan isi dokumen; bukan ukuran kebutuhan pasar atau kesiapan implementasi.

## Koreksi analitis

| Temuan | Bukti dokumen | Perlakuan dalam paket baru |
|---|---|---|
| Skor 5 pada G-22 terlalu luas | OR-02 memberikan RBAC, audit dan retensi masing-masing skor 5 untuk goal yang juga memuat hosting/kepatuhan | Pecah G-22 menjadi hasil terpisah; satu kontrol tidak membuktikan semua persetujuan |
| G-25 mencampur penalti AI dan migrasi | F-62 skor 5 tidak mengatasi tambahan input/migrasi | Pisahkan G-25a/b/c dan ukur beban perubahan proses |
| Reassignment bukan routing benar pertama kali | G-08/F-25 skor 4 | Nilai sebagai kemampuan pemulihan, bukan bukti keberhasilan first-pass routing |
| Confidence pemetaan hilang | OR-04 meminta keyakinan per baris; OR-02 tidak menyertakannya | Tambahkan tinggi/sedang/rendah beserta alasan |
| Pasangan skor 2 tidak ditampilkan | OR-04 meminta >=2; OR-02 hanya >=3 | Tampilkan hubungan pendukung terpilih dan jelaskan bahwa pasangan tidak ditulis belum dinilai atau rendah |
| Saran urgensi disebut fitur baru | OR-01 §2.2 dan §9.2 sudah menyebutnya | Catat sebagai ketidakselarasan rincian, tetap butuh konfirmasi operator |
| Before/after disebut penambahan wajib baru | MVP sudah mempunyai foto laporan dan unggah foto setelah pekerjaan | Gunakan bukti awal yang ada; definisikan checklist, keterbandingan dan supervisor |
| ROI dianggap perlu modul otomatis | Baseline dan pencatatan waktu di luar sistem tetap dapat dipakai | Wajibkan metode yang dapat diaudit, bukan otomatisasi tertentu |
| Status publik per nomor tiket diusulkan | Nomor berurutan memungkinkan penelusuran data jika akses tidak dibatasi | Gunakan tautan token acak, scoped, dicabut dan diminimalkan |

## Kesimpulan yang tidak dibawa sebagai fakta

Pernyataan 23 dari 27 goal terpetakan kuat merupakan hasil metode OR-02 yang perlu dikoreksi. Tidak disalin sebagai persentase kesehatan produk. Fitur yang bernama serupa dengan goal tidak membuktikan hasilnya tercapai. Kontrol keamanan yang tidak memiliki goal pengguna langsung tetap dapat menjadi syarat peluncuran.

Harga pada OR-01 §12.2 dan OR-03 §8 adalah contoh eksperimen. Nama model, aturan acara, batas API, kebijakan platform, serta regulasi memerlukan sumber terbaru. Materi ini tidak memuat wawancara atau bukti willingness-to-pay. Ketiadaan informasi kompetitor tidak membuktikan kompetitor tidak mempunyai kemampuan tersebut.

## Urutan sumber dan revisi

Untuk perilaku produk baru, gunakan PRD dan keputusan di paket ini. Untuk pernyataan eksternal, gunakan sumber primer yang dibaca pada tanggal akses. Jika sumber resmi bertentangan, catat konflik dan jangan menutupnya dengan tebakan. Setiap perubahan penting memiliki keputusan, owner, dan gerbang yang terdampak di register keputusan.
