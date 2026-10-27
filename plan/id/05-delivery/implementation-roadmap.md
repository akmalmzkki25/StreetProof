# Roadmap implementasi

DEL-01 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/05-delivery/implementation-roadmap.md)

Daftar isi: [Rekomendasi dan waktu](#rekomendasi-dan-waktu) · [Urutan demo sepuluh hari](#urutan-demo-sepuluh-hari) · [Horizon keputusan sembilan puluh hari](#horizon-keputusan-sembilan-puluh-hari) · [Jalur dua belas bulan](#jalur-dua-belas-bulan) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Rekomendasi dan waktu

Gunakan upaya demo sepuluh hari fokus, lalu kesiapan, lalu pilot delapan minggu. Horizon 90 hari relatif terhadap awal proyek, bukan tenggat acara resmi. Belum ada penerimaan hackathon, ketersediaan tim, akses pelanggan, atau anggaran yang terbukti. Sepuluh hari demo berarti sepuluh hari kerja tersedia; contoh kalender mengalokasikan 14 hari berlalu pertama. Jangan mengonversi tampilan acara EST/ET yang tidak konsisten tanpa konfirmasi zona waktu penyelenggara.

## Urutan demo sepuluh hari

| Hari kerja tersedia | Hasil | Syarat keluar dan dependensi |
| --- | --- | --- |
| 1 | Cakupan, fixture sintetis, peran, probe arsitektur | Skenario site/kategori dan aturan kewenangan disepakati |
| 2 | Kerangka domain/API dan probe unggahan privat | Report tersimpan dan media tanpa izin ditolak |
| 3 | Intake foto + teks + lokasi manual | Retry tanda terima tidak menggandakan pekerjaan |
| 4 | Triase manual, penugasan, dan progres | Penjaga teknisi terkini dan revisi didemonstrasikan |
| 5 | Penyelesaian, terima/tolak/reopen supervisor | Bukti wajib; upaya ditolak dipertahankan |
| 6 | Draf AI terstruktur async dan alur manual | Probe/evaluasi penyedia atau label simulasi eksplisit |
| 7 | Kait duplikat manusia dan status pelapor terbatas | Report asli ada; token tidak membuka pihak lain |
| 8 | Dashboard minimum/audit event dan skenario gagal | AI antre/gagal, jaringan/unggah, revisi usang terlihat |
| 9 | Latihan ujung ke ujung dan koreksi | Penerimaan inti dicatat; fitur tertunda tetap tertunda |
| 10 | Demonstrasi dan paket bukti | Skrip, batas, sumber, dan gerbang pilot berikutnya siap |

Alur kerja paralel hanya bila dependensi memungkinkan. E tidak dapat mengimplementasikan unggahan, penjaga status, dan integrasi bersamaan hanya karena peran lain tersedia. Tim dua orang memakai [rincian kerja](work-breakdown-and-estimates.md) diperkecil: pemilihan duplikat manual, skenario sintetis disiapkan, dashboard minimum; pemulihan produksi, integrasi luas, serta ranking duplikat otomatis setelah demo. Jika perilaku kewenangan/bukti inti tidak muat, tampilkan prototipe lebih sempit berlabel dan jangan menyebutnya siap pilot.

## Horizon keputusan sembilan puluh hari

| Periode berlalu | Milestone | Gerbang |
| --- | --- | --- |
| Hari 1-14 | Sepuluh hari kerja demo tersedia | Alur sintetis/berizin ujung ke ujung dengan batas diketahui |
| Hari 15-30 | Kesiapan pilot dan kualifikasi sponsor | Pembeli/operator/supervisor bernama; peran, privasi, waktu, pemulihan, dukungan, anggaran disepakati |
| Hari 31-44 | Pilot minggu 1-2: baseline sepadan | Amati kerja kini; kategori sebanding dan waktu aktif diukur |
| Hari 45-58 | Minggu 3-4: shadow | Draf AI tidak memengaruhi keputusan langsung; label/koreksi dicatat |
| Hari 59-72 | Minggu 5-6: langsung terbatas | Satu site, 2-4 kategori; aturan stop berjalan |
| Hari 73-86 | Minggu 7-8: evaluasi | Bekukan kohort, rekonsiliasi bukti, analisis beban/biaya |
| Hari 87-90 | Keputusan/readout awal | Hasil deskriptif, permintaan keputusan berbayar, tindak lanjut jendela matang ditunjuk |

Kalender ini asumsi perencanaan. Sponsor tertunda atau volume rendah menggeser pilot, bukan definisi kesiapan. Kohort penyelesaian/reopen 14 hari yang dimulai akhir pilot belum seluruhnya matang pada hari 90; tampilkan kasus tersensor dan jadwalkan readout akhir setelah tindak lanjut. Konversi berbayar memakai jendela keputusan 30 hari, jadi jangan mengklaim hasilnya terlalu awal.

## Jalur dua belas bulan

| Horizon relatif | Pembelajaran tujuan | Batas rilis |
| --- | --- | --- |
| Bulan 1 | Dapatkah tim mendemonstrasikan inti lengkap dan bersiap aman? | Demo dan kesiapan, tanpa janji peluncuran luas |
| Bulan 2-3 | Apakah bantuan intake menurunkan beban aktif tanpa routing/reopen memburuk? | Pilot delapan minggu dan tindak lanjut tertunda |
| Bulan 4-6 | Apakah pembeli bernama membayar dan mengulang alur? | Lanjutan berbayar setelah gerbang; onboarding/ekspor standar |
| Bulan 7-9 | Dapatkah site sebanding mengadopsi tanpa setup berat pendiri? | Izin, pelatihan, dukungan, dan biaya unit dapat diulang |
| Bulan 10-12 | Dapatkah operasi mendukung beban awal sepuluh site? | Skenario kapasitas, bukan ramalan penjualan; perluas hanya jika retensi/nilai bertahan |

Suara, segmentasi, peta, WhatsApp Business, sinkronisasi offline luas, MCP, dan CMMS dua arah tetap keputusan opsional kemudian. Masing-masing memerlukan masalah pengguna terbukti, pemilik, biaya, dan uji penerimaan. Kampus dapat menggantikan segmen komersial rekomendasi bila sponsor berkomitmen memberi akses dan data baseline lebih baik.

## Ketergantungan dan tindakan berikutnya

P mengonfirmasi hari kerja tersedia dan jalur sponsor; E/A menjalankan probe arsitektur/penyedia; Q menyiapkan pengukuran waktu dan penerimaan. Estimasi ulang hari 2, 5, dan 8 memakai bukti selesai, bukan klaim persentase. Hentikan tambahan cakupan saat jalur kritis kehilangan cadangan. Lihat [pilot](pilot-and-roi-validation.md), [kualitas](quality-and-acceptance.md), dan [register risiko](risk-register.md).
