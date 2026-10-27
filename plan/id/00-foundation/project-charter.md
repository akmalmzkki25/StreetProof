# Piagam proyek StreetProof

Document ID: FND-01  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/00-foundation/project-charter.md)

## Mandat

StreetProof membantu pengelola fasilitas menata laporan kerusakan menjadi pekerjaan yang ditugaskan, memiliki bukti hasil, dan ditutup melalui pemeriksaan supervisor. AI menyusun draf dan menandai informasi yang kurang. Operator, teknisi, dan supervisor memegang keputusan operasional.

Paket ini merencanakan produk B2B Indonesia untuk tim 2-4 orang: demo hackathon, pilot terbatas, kemudian pengembangan komersial 12 bulan. Seluruh pilihan produk adalah usulan yang dapat diuji. Tidak ada pelanggan, kontrak, wawancara, atau hasil pilot yang diklaim sudah ada.

## Pengguna dan unit pembelian

Rekomendasi awal adalah operator gedung komersial dengan 1-5 lokasi, dimulai dari satu gedung dan 2-4 kategori perbaikan non-darurat. Jumlah lokasi tersebut merupakan batas ICP usulan, bukan data ukuran pelanggan nyata. Kampus menjadi alternatif jika sponsor, izin data, dan akses pengguna lebih siap. Facility manager menjadi champion, pimpinan operasional menjadi calon pembeli, dan IT/legal/procurement menjadi approver sesuai organisasi.

Satu organisasi merupakan batas tenant. Lokasi merupakan batas operasional dan kandidat unit harga. Pelapor tidak menjadi unit tagihan. Teknisi dan vendor memperoleh akses hanya pada pekerjaan yang diizinkan.

## Hasil yang ingin dibuktikan

| Hasil | Bukti yang harus dikumpulkan | Penanggung jawab |
|---|---|---|
| Operator menghabiskan lebih sedikit waktu menata laporan | Waktu kerja aktif per kasus, koreksi, dan klarifikasi terhadap baseline sebanding | P + A |
| Teknisi menerima konteks yang cukup | Kelengkapan lokasi/bukti dan jumlah permintaan informasi ulang | E + Q |
| Supervisor dapat menolak bukti tidak memadai | Riwayat pengajuan, penolakan, perbaikan bukti, dan verifikasi | E + Q |
| Pembeli memperoleh manfaat yang layak dibayar | Biaya aktual, manfaat terukur, keputusan penawaran pilot | P |

Ambang pilot di [pilot-and-roi-validation](../05-delivery/pilot-and-roi-validation.md) merupakan target usulan yang harus disepakati sebelum pengamatan. Angka demo sintetis tidak membuktikan hasil bisnis.

## Batas pekerjaan

Dokumentasi mencakup riset, model bisnis, kebutuhan produk, kontrak API usulan, desain data, evaluasi AI, keamanan, delivery, serta pemasaran. Pembangunan aplikasi, pendaftaran acara, pembelian layanan, pengiriman pesan, dan deployment memerlukan pekerjaan berikutnya. Paket ini tidak mengesahkan kepatuhan atau kontrak hukum.

Versi awal tidak mencakup ERP, inspeksi struktur tersertifikasi, pembayaran/pengadaan otomatis, dispatcher darurat, peta aduan publik, atau predictive maintenance. Integrasi produksi dengan pemerintah menunggu otorisasi dan kebutuhan yang nyata.

## Tahap dan keputusan lanjut

| Tahap | Keluaran | Gerbang keluar |
|---|---|---|
| Discovery | Sponsor, contoh laporan berizin, baseline dan masalah pembelian | Ada akses pilot dan masalah yang cukup berulang |
| Hackathon | Satu alur laporan sampai verified_closed memakai data sintetis/berizin | Skenario penerimaan dapat diulang |
| Pilot 8 minggu | Baseline, shadow mode, penggunaan terbatas, evaluasi | Manfaat, risiko, beban teknisi dan komitmen komersial dinilai bersama |
| Productization | Operasi pelanggan, pemisahan data, dukungan dan portabilitas | Kemampuan mendukung pelanggan nyata, bukan jumlah fitur |
| Ekspansi 12 bulan | Lokasi/organisasi tambahan berdasarkan hasil | Biaya dukungan, retensi dan margin mendukung pertumbuhan |

## Tata kelola

P mengendalikan perubahan scope dan komersial; E mengendalikan integritas aplikasi; A mengendalikan evaluasi model; Q mengendalikan riset UX dan mutu penerimaan. Satu orang dapat memegang beberapa peran. Peran dan keputusan harus tetap terlihat ketika tim hanya dua orang.

Setiap perubahan material dicatat di [decision-register](decision-register.md), menyebut alasan, biaya, dependensi, dan pemicu peninjauan ulang. Keputusan penggunaan data nyata mendahului pilot, bukan menyusul setelah aplikasi berjalan.
