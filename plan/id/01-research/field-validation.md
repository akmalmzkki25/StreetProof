# Validasi lapangan

Tanggal: 2026-10-20 | Status: Usulan / berbasis riset | ID dokumen: R-07

[English / Bahasa Indonesia](../../en/01-research/field-validation.md)

## Keputusan riset

Perlakukan penemuan sebagai pengujian apakah operator kecil membutuhkan alur ini dan dapat membelinya. Pilot delapan minggu dimulai setelah persiapan, bukan otomatis sesudah demo hackathon. Belum ada peserta direkrut atau temuan wawancara. P menangani sponsor dan wewenang pembelian; Q kualitas observasi; E penanganan data dan uji pemulihan; A evaluasi AI.

## Protokol penemuan

Usulan target rekrutmen: 8-12 wawancara mencakup manajer/operator fasilitas, teknisi dan pelapor, meliputi calon komersial dan kampus jika akses memungkinkan. Ini sampel pembelajaran, bukan survei representatif. Cari minimal dua peserta yang berbeda pendapat atau puas dengan alat saat ini. Dapatkan izin eksplisit sebelum merekam, mengambil contoh atau menyimpan foto. Gunakan contoh tersamarkan atau sintetis jika izin tidak tersedia.

| Pertanyaan perilaku nyata | Bukti yang diminta | Bias yang dihindari |
| --- | --- | --- |
| Jelaskan laporan terakhir dari masuk hingga tutup | Pesan tersamarkan, waktu, penugasan dan bukti | Menanyakan apakah mereka menyukai AI |
| Informasi apa yang hilang dan siapa bertanya lagi? | Percakapan klarifikasi nyata | Menganggap semua laporan tidak lengkap |
| Kapan dua laporan menyangkut perbaikan sama? | Kedua laporan dan keputusan menautkan | Menganggap foto mirip berasal dari lokasi sama |
| Siapa dapat menolak penyelesaian teknisi? | Penolakan terbaru atau wewenang yang dinyatakan | Menganggap foto terunggah sebagai perbaikan terverifikasi |
| Apa biaya atau waktu staf yang dikeluarkan sekarang? | Lisensi saat ini, menit kerja aktif, penyiapan dan dukungan | Menganggap waktu hemat selalu menjadi penghematan kas |
| Siapa menyetujui alat berbayar, dan kapan? | Nama, pos anggaran, prosedur dan keputusan berikut | Menganggap minat atau surat sebagai permintaan berbayar |

## Rancangan delapan minggu

| Tahap | Pekerjaan | Hasil wajib |
| --- | --- | --- |
| Persiapan sebelum minggu 1 | Sepakati lokasi/kategori, izin data, peran, pemberitahuan, retensi, ekspor, notifikasi dan rollback; latih pemulihan | Lingkup dan pemilik disetujui; kesiapan privasi/keselamatan; lembar waktu |
| Minggu 1-2, baseline sebanding | Amati alat saat ini dan komposisi kategori; catat aktivitas operator dan upaya teknisi | Baseline berwaktu, pengecualian dan komposisi kerja |
| Minggu 3-4, bayangan | Buat draf terstruktur tanpa mengendalikan penugasan langsung; bandingkan keputusan manusia | Koreksi, kandidat duplikat salah, perbandingan pengarahan dan latensi |
| Minggu 5-6, langsung terbatas | Penugasan manual dan penerimaan bukti oleh supervisor; pertahankan jalur cadangan | Riwayat peristiwa nyata, waktu dukungan, pengecualian dan insiden |
| Minggu 7-8, evaluasi | Bandingkan kasus setara; bahas pembayaran dengan pembeli ekonomi | Hasil deskriptif, keterbatasan, keputusan berbayar atau berhenti/revisi |

## Kontrak pengukuran

Catat ID tiket/laporan, ID pengajuan penyelesaian, ID keputusan pemeriksaan, kategori, lokasi, kelengkapan input, metode saat ini, menit aktif operator untuk penerimaan/klarifikasi/pemeriksaan draf/pemeriksaan duplikat/penugasan pertama, menit tindak lanjut penutupan oleh operator, menit verifikasi supervisor, menit input teknisi, koreksi kolom AI, perubahan penugasan, keputusan duplikat, bukti wajib, keputusan supervisor, alasan pengecualian disetujui, alasan buka ulang, menit dukungan dan data hilang. Pisahkan durasi perbaikan keseluruhan. Hitung satu tiket perbaikan sekali dalam ukuran tingkat tiket sambil mempertahankan beberapa ID laporan; pengukuran bukti tingkat pengajuan memakai setiap ID pengajuan penyelesaian terpisah. Samarkan catatan pengamat dan batasi media mentah.

MET-03 adalah ukuran waktu utama: kerja aktif operator untuk penerimaan, klarifikasi, pemeriksaan draf, pemeriksaan duplikat dan penugasan pertama sejak laporan diterima hingga penugasan pertama. Kecualikan waktu antre/menganggur dan gunakan batas tugas yang sama persis pada baseline dan perlakuan. Tindak lanjut penutupan oleh operator menjadi diagnostik terpisah; verifikasi supervisor dan input teknisi merupakan beban peran terpisah, bukan penghematan operator. Jika satu orang menjalankan beberapa peran, tandai interval menurut peran dan hitung setiap menit sekali. Masukkan upaya tambahan pada peran lain saat menghitung nilai bersih pelanggan.

Perbaikan penanganan MET-03 = (median menit aktif baseline - median menit aktif langsung)/median menit aktif baseline. Bandingkan kategori setara dan catat perubahan staf atau beban. Tingkat koreksi = draf dengan minimal satu koreksi manusia substantif / draf AI diperiksa. Salah pengarahan = tiket yang dinilai salah penugasan pertama / penugasan pertama dinilai. Tingkat buka ulang memakai jendela pengamatan selesai; jendela tertunda tetap tertunda. Stopwatch kertas atau spreadsheet terkendali dapat dipakai; timer bawaan tidak wajib untuk mengukur ROI.

Kelengkapan bukti MET-09 = pengajuan penyelesaian layak yang diperiksa dan memuat seluruh bukti wajib sesuai kebijakan kategori yang disepakati / seluruh pengajuan penyelesaian layak yang diperiksa. Sertakan percobaan ditolak dalam penyebut dan nilai buktinya memakai kebijakan sama. Hitung setiap ID pengajuan sekali; pengajuan ulang berikutnya adalah percobaan baru yang dihitung sekali, bukan pengganti yang menghapus kegagalan sebelumnya. Laporkan pengajuan belum diperiksa sebagai tertunda. Tampilkan pengecualian disetujui, alasan dan perlakuan penyebut secara terpisah; jangan diam-diam menghitung bukti hilang sebagai patuh atau merevisi kelayakan setelah melihat hasil. Kelengkapan bukti tidak membuktikan kualitas perbaikan atau penerimaan supervisor. Tingkat bukti yang hanya memakai penutupan boleh ditampilkan sebagai proksi deskriptif terpisah, tetapi tidak menggantikan MET-09 atau memenuhi ambang pilotnya. Lihat [metrik dan peristiwa](../03-product/metrics-and-events.md).

## Usulan ambang, disepakati sebelum peluncuran

Lanjut membutuhkan pengurangan median waktu aktif operator MET-03 minimal 20%, koreksi maksimal 20%, tidak ada kenaikan salah pengarahan/buka ulang yang sebanding, kelengkapan bukti MET-09 minimal 95% pada seluruh pengajuan penyelesaian layak yang diperiksa, tidak ada insiden privasi/keselamatan kritis, pembeli bernama dan komitmen berbayar konkret. Ini usulan, bukan ambang tervalidasi. Hentikan penggunaan langsung segera saat paparan data kritis atau ketergantungan tidak aman dan pakai jalur cadangan. Jangan mengubah pengecualian setelah melihat hasil. Saat volume rendah, perpanjang baseline atau laporkan belum ada kesimpulan. Demo bagus atau wawancara positif tidak menggantikan nilai operasional dan bukti pembayaran.

Tindakan berikut: Q menyiapkan lembar observasi satu halaman; P memastikan akses lokasi dan pembeli; E/A menguji lembar dan catatan peristiwa pada kasus sintetis. Hubungkan hasil ke [ekonomi unit](../02-business/unit-economics-and-costs.md) dan [ketentuan komersial](../02-business/commercial-and-procurement.md).
