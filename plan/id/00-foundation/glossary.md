# Glosarium dan konvensi

Document ID: FND-05  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/00-foundation/glossary.md)

## Istilah bersama

| Istilah Inggris | Istilah Indonesia | Makna |
| --- | --- | --- |
| Report | Laporan | Kiriman asli satu pelapor; dipertahankan saat dikaitkan sebagai duplikat |
| Ticket | Tiket | Unit pekerjaan kanonik yang ditugaskan dan dilacak |
| Evidence | Bukti | Media atau catatan dengan asal, waktu dan akses yang tercatat |
| Completion submission | Pengajuan selesai | Klaim petugas bahwa pekerjaan siap diperiksa, bukan penutupan final |
| Verified closure | Penutupan terverifikasi | Keputusan supervisor atas bukti sesuai checklist, bukan jaminan mutu teknik mutlak |
| Active handling time | Waktu kerja aktif | Menit ketika operator mengerjakan kasus; terpisah dari waktu antre |
| SLA | SLA | Target layanan dengan jam berlaku, kategori dan kebijakan jeda yang disepakati |
| Tenant | Tenant/organisasi | Batas otorisasi dan kepemilikan data organisasi |
| Site | Lokasi operasional | Gedung atau area dalam satu organisasi |
| Assumption | Asumsi | Input yang belum dibuktikan; memiliki owner dan cara uji |
| Vendor claim | Klaim vendor | Kemampuan yang dinyatakan penyedia pada sumber resminya, belum diuji tim |
| Target | Target | Ambang usulan yang ditetapkan sebelum pengamatan |
| Observed result | Hasil teramati | Data dari penggunaan atau eksperimen nyata dengan metode yang dicatat |
| Activation | Aktivasi | Organisasi menyelesaikan alur bernilai pertama, bukan sekadar mendaftar |
| CAC | CAC | Biaya akuisisi penuh termasuk waktu tim, tools dan kegiatan penjualan |
| Shadow mode | Shadow mode | AI memberi saran tanpa mengambil alih proses yang sedang berjalan |
| North star | Metrik utama | Ukuran hasil utama yang dibaca bersama kualitas, risiko dan kapasitas |
| RPO/RTO | RPO/RTO | Batas kehilangan data dan durasi pemulihan yang ditargetkan, harus diuji |

## ID dan bahasa spesifikasi

G-01 sampai G-27 menunjuk goal OR-02. Sufiks a/b/c memisahkan hasil tanpa menghapus asalnya. F-01 sampai F-71 menunjuk kelompok fitur OR-02. N-xx menunjuk tambahan atau kontrol yang belum terwakili dalam katalog tersebut. D-xx adalah keputusan, A-xx adalah asumsi, dan AC-xx adalah kriteria penerimaan produk.

Nama state, field JSON, event, dan path API tetap dalam bahasa Inggris pada kedua versi. Nama file juga sama agar tautan mudah dipasangkan. Gunakan istilah yang sama untuk peran: P product/commercial, E application/backend, A AI/evaluation, Q UX/QA/customer enablement. Huruf A pada kolom owner menunjuk peran, sedangkan A-xx menunjuk asumsi.

Setiap angka simulasi tetap simulasi ketika diterjemahkan. Gunakan titik desimal pada JSON dan rumus mesin. Angka dalam tabel biaya menyebut mata uang dan periode; jumlah tiket tidak diartikan sebagai jumlah pelanggan. Lihat [metrics-and-events](../03-product/metrics-and-events.md) sebelum menggunakan persentase.
