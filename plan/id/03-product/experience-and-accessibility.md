# Pengalaman pengguna dan aksesibilitas

Document ID: PRD-05  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/03-product/experience-and-accessibility.md)

## Prinsip pengalaman

Pengguna melihat tugas berikutnya, informasi yang diperlukan untuk tugas itu, dan hasil tindakannya. Bahasa antarmuka menggunakan kata kerja konkret: Kirim laporan, Perbaiki lokasi, Terima pekerjaan, Ajukan selesai, Minta perbaikan bukti, Verifikasi selesai. Jangan menyebut draf model sebagai fakta yang telah diverifikasi.

Layar pelapor ringan dan dimulai dari lokasi serta bukti; pelapor tidak perlu mengetahui organisasi teknisi. Layar operator menampilkan sumber dan draf berdampingan. Layar teknisi menampilkan pekerjaan, konteks akses, checklist dan kendala. Layar supervisor memusatkan bukti serta keputusan. Dashboard tidak menggantikan antrean kerja harian.

## Spesifikasi layar minimum

| Layar | Informasi utama | Aksi utama | Kondisi yang harus tersedia |
|---|---|---|---|
| Form pelapor | Batas layanan, lokasi, foto, keterangan | Kirim laporan | Lokasi belum lengkap, foto terlalu besar, upload gagal, kiriman tersimpan |
| Receipt/status | Referensi dan status yang boleh dibuka | Lihat status / jawab klarifikasi | Token invalid/expired/revoked dengan pesan umum tanpa bocoran |
| Antrean operator | Umur tiket, kategori usulan, confidence, pemilik | Tinjau tiket | Kosong, loading, filter tanpa hasil, AI gagal |
| Review tiket | Asli, draf, field kurang, duplikat | Konfirmasi triase | Konflik revisi, tidak cukup bukti, saran ditolak |
| Pekerjaan teknisi | Lokasi/aset, checklist, bukti | Terima / ubah status / ajukan selesai | Jaringan putus, upload pending, akses/material menunggu |
| Review supervisor | Before/after, tindakan, pengecualian | Verifikasi / minta perbaikan | Bukti tidak lengkap, objek berbeda, akses media berakhir |
| Dashboard | Backlog, umur, denominator dan periode | Buka kelompok tiket | Sampel kecil, data tidak lengkap, tidak ada closure |

## Aksesibilitas yang direncanakan

Gunakan label form yang terhubung, navigasi keyboard, fokus terlihat, pesan error yang menunjuk field, serta status upload yang dapat dibaca teknologi bantu. Jangan mengandalkan warna saja untuk status atau confidence. Rancang kontras teks normal minimal 4.5:1 dan teks besar 3:1 sebagai kriteria desain yang akan diuji, bukan klaim sertifikasi aplikasi. Tombol sentuh ditargetkan minimal 44px. Form tetap terbaca pada zoom 200% dan lebar layar kecil tanpa kehilangan aksi penting.

Berikan alternatif teks bagi bukti yang perlu dibaca dan hindari memuat banyak gambar resolusi penuh sekaligus. Tidak semua pengguna dapat mengambil foto; pengecualian bukti harus mengikuti kategori dan review supervisor, bukan kegagalan form tanpa penjelasan. Assisted intake tersedia sebagai proses operator. [AX-01: WCAG 2.2](https://www.w3.org/TR/WCAG22/) menjadi referensi; 44px adalah target produk, bukan klaim minimum AA atau hasil audit aplikasi.

## Ketidakpastian, privasi dan notifikasi

Bedakan label Data dari pelapor, Terlihat pada foto, dan Saran AI. Confidence rendah menyatakan kebutuhan review, bukan kesalahan pengguna. Preview pelapor tidak menampilkan data internal. URL token tidak dimasukkan ke analytics/log; tukarkan token pada fragment menjadi sesi terbatas mengikuti kontrak teknis. Jangan mengirim media sensitif melalui email pembaruan.

Notifikasi menyebut perubahan status dengan bahasa yang disepakati, tanpa janji tenggat yang belum disetujui. Jika pengiriman gagal, status tetap tersedia melalui tautan dan operator melihat kegagalan. Jangan menganggap notifikasi terkirim sama dengan sudah dibaca.

## Usability dan beban lapangan

Q menguji tugas pelaporan, koreksi draf, menemukan lokasi, mengunggah hasil, menolak bukti dan melihat status. Catat waktu, kesalahan, permintaan bantuan serta komentar dengan izin. Gunakan perangkat murah dan jaringan yang mewakili lokasi pilot. Lihat [interview-and-usability-kits](../07-appendices/interview-and-usability-kits.md).
