# 10. Outlook 12 bulan

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-10

[English version](../../en/06-marketing/10-outlook-12-months.md)

## Daftar isi

- [Metode anggaran dan bentuk pertumbuhan](#metode-anggaran-dan-bentuk-pertumbuhan)
- [Tiga skenario sumber daya](#tiga-skenario-sumber-daya)
- [Kuartal 1: bulan 1-3](#kuartal-1-bulan-1-3)
- [Kuartal 2: bulan 4-6](#kuartal-2-bulan-4-6)
- [Kuartal 3: bulan 7-9](#kuartal-3-bulan-7-9)
- [Kuartal 4: bulan 10-12](#kuartal-4-bulan-10-12)
- [Keputusan pembaruan](#keputusan-pembaruan)

## Metode anggaran dan bentuk pertumbuhan

Gunakan anggaran berbasis tujuan sebagai kerangka sensitivitas, lalu batasi dengan kas dan kapasitas. Metode persentase ARR tidak membantu pada fase pra-pendapatan. CAC, retensi, ARPC, dan funding belum diketahui, sehingga rumus belum menghasilkan forecast yang tervalidasi. Ini rencana pembelajaran dengan kemungkinan pertumbuhan bertahap setelah pembelian, bukan janji pertumbuhan eksponensial. Tidak ada asumsi round pendanaan pasti ditutup.

Rumus tujuan: `ARR baru yang harus bertahan = max(0, target ARR akhir - ARR awal × NRR basis lama)`. Kemudian `akun baru = ceil(ARR baru yang harus bertahan / (ARPC bulanan × 12 × retensi cohort baru sampai akhir tahun))`. Gunakan retensi pendapatan yang cocok dengan waktu akuisisi; jangan memaksakan retensi setahun pada akun yang baru masuk bulan ke-11. `Anggaran akuisisi = akun baru × CAC`, lalu tambah cadangan eksperimen 15%. Hindari menghitung cadangan itu dua kali pada pos eksperimen.

Ilustrasi, bukan target penjualan: basis awal nol, harga satu site Rp1.500.000/bulan, tiga akun/satu site yang semuanya masih membayar pada akhir tahun berarti run-rate ARR Rp54.000.000. Dengan asumsi sensitivitas 100% bertahan sampai akhir tahun dan CAC dasar simulasi Rp6.150.000 sebelum cadangan, kebutuhan akuisisi tiga akun adalah Rp18.450.000 + 15% = Rp21.217.500, belum termasuk R&D dan layanan. Retensi 100% ini hanya asumsi pemeriksaan aritmetika, bukan perkiraan perilaku. CAC dasar contoh adalah (Rp4.500.000 kas dasar + Rp7.800.000 tenaga akuisisi) / dua akun, sebelum satu cadangan baru. Cocokkan biaya lengkap dari [revenue](08-revenue.md), bukan hanya kas iklan.

## Tiga skenario sumber daya

| Skenario | Kas bulanan simulasi | Komponen dasar | Tahun penuh bila konstan |
|---|---:|---|---:|
| S0 | Rp0 tambahan | Alat yang sudah ada, kerja manual, tanpa ads; opportunity cost tetap dicatat | Rp0 tambahan kas; biaya tenaga kerja unknown |
| S1 | Rp1.725.000 | Dasar Rp1.500.000: perjalanan Rp600.000, materi Rp300.000, tools Rp200.000, riset Rp100.000, bantuan kontrak Rp300.000; cadangan eksperimen Rp225.000 | Rp20.700.000 kas |
| S2 | Rp5.750.000 | Dasar Rp5.000.000: kunjungan Rp1.000.000, enablement Rp1.000.000, kontraktor Rp1.500.000, tools Rp500.000, satu uji paid Rp1.000.000; cadangan Rp750.000 | Rp69.000.000 kas |

Ini batas perencanaan, bukan izin pembelian atau tarif vendor. Pos boleh tidak terpakai. S2 memerlukan komitmen berbayar, margin layanan yang masuk akal, dan dana yang tersedia. Anggaran paid Rp1.000.000 hanya tes belajar terbatas, bukan jumlah yang menjamin sampel statistik. Proyeksi berjenjang tiga bulan S1 dan sembilan bulan S2 adalah Rp56.925.000 kas, seluruhnya bersyarat, belum termasuk tenaga kerja. P menghitung ulang sebelum setiap kenaikan.

## Kuartal 1: bulan 1-3

Keadaan dana: bootstrapped atau funding unknown; S0 default, S1 hanya jika tersedia. Fokus pada akses, aktivasi, dan keputusan pilot. Sasaran pembelajaran usulan: 15 akun diteliti, enam percakapan berkualifikasi, maksimal tiga penawaran awal, dan satu pilot siap bila sponsor serta kontrol lolos. Target bukan klaim funnel yang telah dicapai.

Kurva kanal masih tahap discovery; produk belum terbukti pada data nyata; pasar belum tervalidasi. Kapasitas satu pilot. Alokasi upaya 60% percakapan dan kesiapan, 25% evaluasi/dukungan, 15% eksperimen aset. Tidak ada kanal yang layak disebut mesin pertumbuhan. Hari 90 boleh menghasilkan no-go.

## Kuartal 2: bulan 4-6

Keadaan dana: tetap S0/S1 kecuali dana dan gerbang komersial membuka S2. Fokus mengulang alur pada akun kedua, bukan menambah fitur besar. Sasaran bersyarat: dua akun kumulatif mencapai org.onboarded saat limited-live siap setelah baseline dan shadow, dua cohort Activation14 yang dilaporkan dengan pending, satu keputusan berbayar konkret, dan satu materi hasil dengan izin bila hasil mendukung. Laporkan akun pilot.prepared yang belum live dan TimeToLive sejak persiapan secara terpisah. Bila volume rendah, sasaran adalah baseline yang lebih baik dan keputusan perpanjangan, bukan rasio kemenangan palsu.

P mempertahankan penjualan langsung; Q menguji onboarding dan biaya layanan. Konten berbasis pertanyaan menjadi kurva kanal berikutnya hanya setelah tiga akun mengajukan pertanyaan yang sama. Jangan merekrut marketer penuh waktu sebelum pendanaan dan beban kerja mendukungnya. Kontraktor untuk aset tertentu boleh diuji dengan scope dan cap tertulis.

## Kuartal 3: bulan 7-9

Keadaan dana: S1 atau S2 bersyarat, tanpa asumsi seed close. Fokus pada pengulangan dan retensi cohort yang matang. Sasaran kapasitas, bukan forecast: maksimum tiga akun live bersamaan untuk dua orang, atau lima untuk empat orang, dengan penilaian ulang dukungan. Target kontrol: 100% akun memiliki log biaya; semua renewal yang jatuh tempo mendapat review; nol ekspansi melewati gerbang data.

P boleh menjalankan satu uji kanal tambahan dengan batas waktu empat minggu dan kerugian kas maksimal Rp1.000.000 dari pos paid S2. Bila tidak menghasilkan percakapan ICP atau beban layanan memburuk, hentikan. Jangan mengambil sinyal klik sebagai bukti CAC. Produk dan pasar tetap pada wedge gedung awal; kampus hanya jika akses menghasilkan pembuktian lebih baik.

## Kuartal 4: bulan 10-12

Keadaan dana: pertahankan skenario yang lolos, turunkan pengeluaran bila kas atau hasil melemah. Fokus pada renewal, biaya layanan, dan pilihan tahun kedua. Sasaran bersyarat: tiga akun satu-site yang membayar pada akhir tahun sebagai skenario Rp54.000.000 run-rate ARR; bukan pendapatan kas tahunan dan bukan komitmen. Laporkan aktual walaupun nol. Target proses: semua cohort matang memiliki keputusan; semua permintaan publikasi memiliki izin; minimal satu kanal memiliki biaya per percakapan berkualifikasi yang dapat dihitung bila ada percakapan.

Jika satu kanal terbukti berulang, gunakan alokasi 70% pada kanal itu, 20% kanal berikutnya, 10% eksperimen di dalam budget yang sama. Jika belum ada, jangan mengklaim flywheel. Perekrutan Marketing Lead/Manager dengan kemampuan product marketing dan growth hanya dibuka setelah runway, kebutuhan, dan pengawasan jelas. Ekspansi internasional, reseller luas, dan tim agency tetap memerlukan rencana baru.

## Keputusan pembaruan

P dan Q meninjau bulanan kas, jam, konversi, beban layanan, dan alasan kalah. Dua bulan penambahan upaya tanpa percakapan ICP tambahan memicu perubahan kanal; dua minggu dukungan melebihi cap menahan akun baru. Review kuartalan menyusun ulang [roadmap](09-roadmap-90-days.md). Pendanaan membuka kapasitas, tetapi tidak membuktikan permintaan.
