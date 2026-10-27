# 08. Revenue dan keekonomian

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-08

[English version](../../en/06-marketing/08-revenue.md)

## Daftar isi

- [Penawaran yang diuji](#penawaran-yang-diuji)
- [Eksperimen komersial](#eksperimen-komersial)
- [Contoh ROI yang tidak nyaman](#contoh-roi-yang-tidak-nyaman)
- [Tabel unit economics](#tabel-unit-economics)
- [Langkah berikutnya](#langkah-berikutnya)

## Penawaran yang diuji

P menguji penawaran satu lokasi dengan alur korektif, bukti penutupan, supervisor, dan ekspor yang disepakati. Simulasi harga awal Rp1.500.000/lokasi/bulan. Simulasi fee pilot Rp5.000.000 total untuk delapan minggu, tidak termasuk tenaga kerja internal pelanggan. Batas volume, penyimpanan, dukungan, pajak, termin pembayaran, dan scope setup harus tertulis sebelum penawaran. Angka ini bukan harga pasar atau bukti kesediaan membayar.

Biaya pelapor tetap nol dalam rancangan harga. Jangan memberi insentif menahan laporan yang valid. Setup, migrasi, integrasi khusus, SSO, deployment khusus, dan pekerjaan di luar scope memerlukan penilaian biaya terpisah. Jangan menjual paket Enterprise atau jaminan SLA sebelum kemampuan layanan dan kontraknya dapat dipenuhi. Fee pilot sekali bayar bukan MRR, dan uang muka bukan otomatis pendapatan yang sudah diakui.

## Eksperimen komersial

| ID | Pelaksanaan | Pemilik dan alat | Indikator dan batas |
|---|---|---|---|
| REV-01 | Setelah discovery, ajukan satu scope pilot yang sama dan tanyakan siapa menyetujui biaya serta alasan menerima/menolak | P; pricing, sales-enablement; lembar penawaran dan CRM | Maksimum tiga penawaran berkualifikasi awal; jangan mengubah harga dan scope sekaligus |
| REV-02 | Pada evaluasi pilot, bandingkan manfaat terukur dengan harga berulang dan biaya perubahan | P+Q; spreadsheet baseline dan buku biaya | Dua jam analisis; minta komitmen berbayar dengan tanggal, scope, dan proses pembelian |
| REV-03 | Tawarkan lokasi kedua hanya jika lokasi pertama aktif dan biaya layanan diketahui | P; revops, pricing; ledger kontrak | Tahan ekspansi bila dukungan melewati cap atau margin belum diketahui |

Jika tiga penawaran cocok ditolak karena manfaat kecil dibanding harga, revisi ICP, scope, atau harga sebelum menambah lead. Jika hambatan hanya anggaran belum dibuka, catat tanggal keputusan dan bukti pemilik anggaran; jangan menulis closed won. Diskon bukan pengganti bukti nilai. Penawaran tertulis, kontrak, invoice, pembayaran, dan layanan aktif merupakan kejadian berbeda.

## Contoh ROI yang tidak nyaman

Simulasi: 100 tiket/bulan, lima menit waktu administrasi berkurang per tiket, biaya tenaga kerja Rp60.000/jam. Waktu yang dapat dialihkan `100 × 5 = 500 menit = 8,333 jam`. Nilai waktu `8,333 × Rp60.000 = Rp500.000/bulan`, di bawah harga uji Rp1.500.000. Titik impas berdasarkan waktu saja adalah 300 tiket/bulan sebelum biaya onboarding, supervisor, teknisi, dan perubahan proses.

Ini bukan hasil StreetProof. Perbaikan kualitas atau berkurangnya pekerjaan ulang boleh menambah manfaat hanya jika ada data dan tidak dihitung dua kali dengan waktu administrasi. Pengurangan waktu tidak otomatis menjadi penghematan kas. Gunakan observasi yang dikontrol dan spreadsheet jika lebih ringan daripada timer produk. Jeda menuju penutupan tiket berbeda dari menit kerja aktif operator.

## Tabel unit economics

| Metrik | Nilai saat ini | Kontrak pengukuran |
|---|---|---|
| ARPC bulanan | Unknown | Pendapatan berulang aktual / akun pembayar; satu akun dapat memiliki beberapa lokasi |
| Blended CAC | Unknown | Seluruh biaya akuisisi dan penjualan / akun baru berbayar dari cohort yang sesuai |
| Retensi tahunan | Unknown | Perlu cohort dengan eksposur satu tahun atau renewal yang sah |
| Gross margin | Unknown | Kurangi AI, hosting, storage, notifikasi, dan layanan pelanggan yang relevan |
| LTV | Unknown | Jangan mengekstrapolasi churn nol pada sampel pendek menjadi umur tak terbatas |
| LTV/CAC dan CAC payback aktual | Unknown | Belum ada input teramati yang mencukupi |

CAC lengkap mencakup waktu founder dan sales, gaji dan beban terkait, tools, konten, perjalanan, iklan, agency/kontraktor, dan kegiatan referral. Pisahkan biaya produk R&D dan biaya layanan dari akuisisi, lalu alokasikan aktivitas campuran secara konsisten. Catat biaya cohort dan jeda penjualan; jangan membagi seluruh biaya bulan ini dengan pembayaran dari proses penjualan lama tanpa rekonsiliasi.

Contoh sensitivitas 90 hari, seluruhnya simulasi: kas S1 `3 × Rp1.725.000 = Rp5.175.000`; pada skenario tim empat orang dengan cap 130 jam marketing selama 13 minggu, 78 jam dialokasikan ke akuisisi pada tarif opportunity cost Rp100.000/jam menghasilkan Rp7.800.000. Seluruh kas S1 pada contoh ini diasumsikan untuk akuisisi, sehingga total Rp12.975.000; biaya layanan dan R&D dicatat terpisah. Ini skenario beban akuisisi tinggi untuk empat orang, bukan alokasi yang disyaratkan bagi dua orang. Bila dua akun baru membayar dari cohort yang sudah matang, CAC contoh Rp6.487.500/akun. Bila tidak ada akun membayar, CAC belum memiliki nilai terbatas; laporkan biaya dan nol konversi. Dengan pendapatan satu site Rp1.500.000/bulan dan margin hipotetis 70% yang sudah memuat beban layanan, payback contoh sekitar 6,18 bulan. Angka ini tidak membuktikan margin atau payback aktual.

## Langkah berikutnya

P mengisi biaya aktual dan menguji REV-01 setelah sponsor serta scope siap. Review bulanan memakai fakta pembayaran, biaya layanan, alasan kalah, dan komitmen berikutnya. Pada bulan 4-12, annual plan atau ekspansi hanya diuji setelah penggunaan berulang terlihat. [Outlook](10-outlook-12-months.md) memakai skenario kapasitas dan funding; tidak ada forecast pendapatan yang dijanjikan.

AC-20 pada [product-requirements](../03-product/product-requirements.md) menjadi gerbang sebelum penawaran komersial: scope, batas, fees, akses data, dukungan, dan exit harus tertulis.

