# Kualitas dan penerimaan

DEL-05 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/05-delivery/quality-and-acceptance.md)

Daftar isi: [Rekomendasi dan standar bukti](#rekomendasi-dan-standar-bukti) · [Matriks skenario penerimaan](#matriks-skenario-penerimaan) · [Gerbang rilis](#gerbang-rilis) · [Kebijakan cacat dan regresi](#kebijakan-cacat-dan-regresi) · [Catatan penerimaan dan tindakan berikutnya](#catatan-penerimaan-dan-tindakan-berikutnya)

## Rekomendasi dan standar bukti

Gunakan penerimaan berbasis skenario terkait [AC-01..AC-20 produk](../03-product/product-requirements.md). Tabel berikut adalah usulan rencana verifikasi; pembuatan dokumen ini tidak menjalankan uji aplikasi. Kelulusan memerlukan perilaku teramati pada build/lingkungan bernama, langkah, hasil harapan/nyata, timestamp, peninjau, serta tautan cacat. Screenshot mock tidak membuktikan otorisasi server atau persistensi.

## Matriks skenario penerimaan

| ID | Skenario dan hasil harapan | Cakupan produk | Pemilik |
| --- | --- | --- | --- |
| QA-01 | Foto/teks/lokasi manual di ponsel; input kurang memberi error spesifik; panduan bahaya sebelum AI | AC-01/11 | Q/E |
| QA-02 | Akses API, Server Action, SQL/Storage langsung dengan dua tenant dan keanggotaan dicabut ditolak; cache bersama tidak membocorkan sesi | AC-12/17 | E/Q |
| QA-03 | Putus saat unggah, lanjut, izin kedaluwarsa, MIME salah, gambar berlebih/decoder bomb, scanner mati; bukti belum ready ditolak | AC-06/15 | E/Q |
| QA-04 | Respons report hilang dan retry kunci sama membuat satu kerja; konflik payload/kunci jelas; token tanda terima mentah tidak disimpan | AC-09/15 | E |
| QA-05 | AI timeout, 429, kredensial salah, skema invalid, teks gambar jahat, revisi input usang tetap memungkinkan triase manual | AC-02/13 | A/E |
| QA-06 | Operator mengedit kolom sementara fakta asli, konteks pengguna, inferensi dapat diperiksa; alasan prioritas mengikuti dampak | AC-03/19 | Q/A |
| QA-07 | Kait/gabung/lepas manusia mempertahankan report dan scope pelapor; tanpa pembatalan diam-diam; siklus/lintas tenant ditolak | AC-04 | E/Q |
| QA-08 | Penugasan/transisi bersamaan pada revisi sama menghasilkan satu hasil dan satu 409; teknisi lama tidak dapat menulis | AC-05/06 | E |
| QA-09 | Penyelesaian memerlukan teknisi terkini dan bukti/checklist kategori; permintaan pengecualian menunggu bukti alternatif layak | AC-07 | E/Q |
| QA-10 | Teknisi tidak dapat verifikasi; dua supervisor terima/tolak bersamaan; satu menang; alasan penolakan dan upaya revisi dipertahankan | AC-08 | E/Q |
| QA-11 | Supervisor reopen beralasan; verifikasi lama tetap ada, siklus baru diukur, pembaruan pelapor minimum | AC-18 | E/Q |
| QA-12 | Kredensial acak/kedaluwarsa/dicabut tidak membocorkan keberadaan atau kolom internal; rotasi membatalkan sesi lama; TTL media dicatat | AC-09/12 | E/Q |
| QA-13 | Crash setelah commit/sebelum acknowledge antrean pulih; event/dashboard rekonsiliasi tanpa penutupan palsu atau kirim ganda | AC-10/14 | E/A |
| QA-14 | Hapus terkelola menghilangkan objek aktif/turunan/ekspor/kontak; backup dipulihkan terisolasi menerapkan ledger hapus sebelum dibuka | AC-17 | E/Q |
| QA-15 | Lembar pengukuran sesuai event; waktu aktif tidak menghitung tunggu; kohort hilang/tersensor dijelaskan; catatan biaya nyata ada | AC-16 | Q/A |
| QA-16 | Tawaran/readout menyatakan cakupan, harga, batas, dukungan, akses, keluar, keputusan pembeli; minat bukan pembayaran | AC-20 | P/Q |

Tambahkan uji ekspor untuk scope, kedaluwarsa, dan injeksi formula spreadsheet. Uji teks kritis Indonesia, operasi hanya keyboard, label/fokus error, pengumuman status screen reader, kontras, serta target sentuh layak. WCAG 2.2 AA adalah usulan target desain, bukan klaim konformansi. Sertakan jaringan mobile lambat serta sesi teknisi terputus; sinkronisasi offline penuh ditunda.

## Gerbang rilis

| Tingkat | Bukti minimum | Tidak dapat disimpulkan |
| --- | --- | --- |
| Demo sintetis | Alur report sampai supervisor lengkap, AI gagal manual, duplikat dipertahankan, akses privat/terbatas, label sintetis | Pemulihan produksi, nilai pelanggan, akurasi model tervalidasi |
| Pilot data nyata | Kasus keamanan/kewenangan/unggah terkait, persetujuan privasi, latihan restore/hapus, dukungan, protokol baseline | Kepatuhan hukum dari keberadaan fitur |
| Lanjutan berbayar | Gerbang pilot, readout kohort matang, dukungan/keluar disepakati, komitmen pembeli konkret | Permintaan berulang dari satu pengguna berminat |

Pilot dapat menerima cacat kecil terdokumentasi dengan solusi sementara aman, pemilik/tanggal. Cacat kritis/tinggi terbuka terkait isolasi tenant, transisi tanpa izin, integritas bukti, kehilangan data, atau panduan darurat tidak diterima. Pengecualian bukti beralasan meminta tinjauan supervisor; bukan mengubah unggah gagal menjadi bukti atau mengizinkan penutupan AI.

## Kebijakan cacat dan regresi

P0: kebocoran data privat terkonfirmasi, penutupan terverifikasi tanpa kewenangan, atau perilaku darurat berbahaya. Hentikan penggunaan langsung terdampak, batasi, simpan bukti minimum, eskalasi. P1: jalur inti tidak selesai atau persistensi/pemulihan tidak andal; blokir rilis sampai diperbaiki atau cakupan dihapus aman. P2: cacat kegunaan/pelaporan nonkritis dengan solusi layak; catat dampak/pemilik. Severity berdasarkan dampak, bukan kemudahan perbaikan.

Otomatisasi penjaga domain, validasi skema, akses tenant, dan idempotensi bila bermakna. Gunakan uji integrasi untuk batas auth/storage/antrean nyata dan alur inti end-to-end kecil. Jangan mengganti skenario gagal dengan jumlah uji dangkal besar. Jalankan pemeriksaan terdampak setelah perubahan; perluas hanya bila dependensi/kegagalan membenarkan. Uji beban mendokumentasikan campuran permintaan, pengguna/file bersamaan, ukuran objek, durasi, tingkat kesalahan.

## Catatan penerimaan dan tindakan berikutnya

Q memelihara ledger: ID skenario, AC, build/lingkungan, fixture/izin data, peninjau, hasil nyata, bukti, cacat, retest. E/A menyediakan fixture injeksi kegagalan; P/pelanggan menyetujui batas pilot tersisa dan penggunaan data. Sebelum menyebut siap, periksa [penjaga status](../04-technical/state-machine-and-permissions.md), kontrak, retensi terhadap ledger. Dokumentasi selesai bukan penerimaan produk.
