# Diferensiasi dan relevansi

Tanggal: 2026-10-20 | Status: Usulan / berbasis riset | ID dokumen: R-06

[English / Bahasa Indonesia](../../en/01-research/differentiation-and-relevance.md)

## Positioning yang diusulkan

StreetProof adalah alur ringan untuk menerima bukti dan memverifikasi penutupan bagi tim fasilitas kecil. Produk dapat berdiri sendiri saat belum ada CMMS, atau mengekspor ke sistem pencatatan yang ada. Nilai yang diusulkan adalah berkurangnya upaya operator menyusun ulang laporan tidak lengkap serta pemisahan jelas antara pekerjaan selesai oleh teknisi dan penerimaan supervisor. Kedua manfaat belum diukur.

Pasar yang diamati melemahkan klaim kebaruan luas: [MaintainX](competitors/maintainx.md) mendokumentasikan portal eksternal, [Limble](competitors/limble.md) menawarkan pencegahan duplikat AI, dan [PlanRadar](competitors/planradar.md) mendokumentasikan persetujuan tiket. Kombinasi masih dapat berguna bagi pembeli tertentu, tetapi menggabungkan kemampuan yang dikenal tidak membuktikan keunggulan yang sulit ditiru.

## Klaim dan kewajiban pembuktian

| Pembeda yang diusulkan | Alasan mungkin penting | Bukti yang diperlukan | Klaim yang boleh dipakai sekarang |
| --- | --- | --- | --- |
| Satu alur penerimaan hingga penerimaan hasil terbatas | Tim kecil menghindari implementasi suite aset untuk satu masalah laporan | Bandingkan upaya penyiapan dan operator dengan formulir + alat saat ini | Fokus alur kerja yang diusulkan |
| Draf AI menampilkan konteks hilang | Operator mengoreksi lokasi/kategori tidak pasti, bukan menerima kepastian palsu | Evaluasi berlabel, waktu koreksi dan pembanding formulir manual | AI menyarankan; operator memeriksa |
| Tautan duplikat manusia menyimpan laporan | Satu perbaikan mengakui beberapa pelapor tanpa menghapus buktinya | Tingkat salah taut, uji pelepasan/pemulihan dan riwayat pelapor | Relasi yang dapat diperiksa, masih usulan |
| Bukti selesai ditambah keputusan supervisor | Unggahan teknisi tidak otomatis membuktikan perbaikan memuaskan | Observasi penolakan, pengajuan ulang dan pembukaan ulang | Kebijakan verified_closed yang diusulkan |
| Kesesuaian operasi Indonesia | Istilah lokal, penyiapan sederhana dan dukungan dapat membantu adopsi | Uji tugas nyata, beban dukungan dan keputusan pembelian berbayar | Hipotesis pilot Indonesia |
| Catatan portabel | Pembeli dapat memiliki data dan keluar | Kelengkapan ekspor dan latihan pemulihan/impor | Persyaratan ekspor yang diusulkan |

## Kondisi kegagalan tesis

Portal permintaan CMMS mungkin sudah menyelesaikan penerimaan dengan baik. Koordinator disiplin dapat menegakkan bukti melalui chat dengan sedikit usaha. Koreksi AI bisa lebih lama daripada formulir yang jelas. Kewajiban foto tambahan untuk teknisi dapat menghapus penghematan operator. Volume laporan rendah membuat langganan sulit dibenarkan. Jika bukti sering mustahil atau mengganggu privasi, kebijakan penutupan memerlukan pengecualian per kategori daripada gambar wajib yang tidak relevan.

Jangan mengklaim pengurangan kecelakaan, kepatuhan, pemeliharaan prediktif, penilaian urgensi otonom, AI unik, ROI terjamin atau ketepatan penugasan pertama. Penugasan ulang hanya memungkinkan pemulihan; itu tidak membuktikan penugasan awal benar. Retensi, RBAC dan catatan audit mendukung kebutuhan tata kelola tetapi tidak membuktikan kepatuhan hukum menyeluruh. Pembedaan ini juga membatasi klaim G-08 dan G-22 berikutnya.

## Batas keputusan

Lanjutkan dari demo ke pilot nyata hanya setelah perlindungan operasional dan data lulus. Lanjutkan ke penawaran berbayar hanya jika pembeli bernama melihat nilai tambahan terhadap alternatif realistis dan menerima harga konkret. Usulan ambang pilot adalah penurunan median waktu kerja aktif operator minimal 20%, tingkat koreksi AI maksimal 20%, tidak ada kenaikan salah pengarahan/pembukaan ulang yang sebanding, bukti wajib minimal 95%, tidak ada insiden privasi/keselamatan kritis, dan komitmen berbayar konkret. Sepakati definisi dan ambang sebelum pengukuran; sampel kecil tetap deskriptif.

Tindakan berikut: P menulis satu ledger klaim-bukti pilot dan Q mencatat contoh penyangkal terkuat setiap minggu. A menghapus langkah AI yang menambah upaya tanpa informasi berguna. Lihat [validasi lapangan](field-validation.md) dan [harga](../02-business/pricing-packaging.md).
