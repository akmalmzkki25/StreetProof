# Ukuran pasar

Tanggal: 2026-10-20 | Status: Usulan / berbasis riset | ID dokumen: R-03

[English / Bahasa Indonesia](../../en/01-research/market-sizing.md)

## Rekomendasi

Sajikan peluang sebagai skenario dari bawah dengan titik acuan resmi yang sempit. Jangan menyebut proyeksi CMMS global, jumlah penduduk Indonesia, mahasiswa, atau semua gedung sebagai pelanggan potensial StreetProof. Unit tagihan adalah lokasi; satu akun pembeli dapat mengoperasikan 1-5 lokasi. Pisahkan lokasi, badan hukum, portofolio dan kontrak agar satu pembeli tidak dihitung berulang.

## Arti sebenarnya dari data publik

Ekstraksi pencarian domain resmi untuk tabel hotel bintang BPS tahun 2025 menampilkan 4.790 usaha akomodasi secara nasional. Halaman penuh menghasilkan 403/CAPTCHA saat dibaca langsung, sehingga ini acuan sementara yang perlu dikonfirmasi, bukan fakta yang halaman penuhnya sudah diverifikasi. Cakupannya kategori usaha perhotelan, bukan kantor, kampus, pembeli independen, adopsi atau permintaan. Tabel BPS dapat berbeda tanggal revisinya; simpan dan cocokkan ekstrak terpilih sebelum penggunaan eksternal. Model di bawah memakai 4.790 hanya sebagai input skenario eksplisit. [Tabel BPS untuk dikonfirmasi](https://www.bps.go.id/en/statistics-table/2/MzA3IzI%3D/jumlah-akomodasi-kamar-dan-tempat-tidur-yang-tersedia-pada-hotel-bintang.html)

PDDikti menyediakan jalur informasi institusi, tetapi jumlah institusi tidak sama dengan lokasi kampus atau unit pembeli fasilitas. Halaman langsungnya terblokir saat pembacaan Jina; dokumen ini tidak memakai angka total institusi. [PDDikti](https://pddikti.kemdiktisaintek.go.id/)

## Model kuantitatif

Semua harga, proporsi kelayakan, jumlah yang dapat dijangkau dan konversi di bawah adalah asumsi. Rp1.500.000/lokasi/bulan merupakan uji harga, sehingga nilai kontrak tahunan per lokasi adalah Rp18.000.000 sebelum diskon, pajak dan jasa terpisah.

| Lapisan | Rumus | Rentang ilustratif | Makna |
| --- | --- | --- | --- |
| Metode TAM luas | Lokasi komersial layak terverifikasi × harga tahunan per lokasi | Menunggu sensus lokasi; tidak ada klaim total nasional | Hanya kebutuhan korektif terdefinisi dan unit pembeli masuk akal |
| Proksi perhotelan berdekatan | 4.790 × asumsi kelayakan 20%-40% | 958-1.916 lokasi | Bukan total TAM komersial atau pelanggan tervalidasi |
| Nilai tahunan proksi | 958-1.916 × Rp18.000.000 | Rp17,244-34,488 miliar/tahun | Penetrasi penuh hipotetis atas lokasi proksi yang layak |
| Skenario SAM awal | 50-200 lokasi teridentifikasi terjangkau × asumsi kecocokan 40%-70% | 20-140 lokasi | Daftar harus disusun dan dibersihkan dari duplikasi; ujung rentang menggabungkan rendah-rendah dan tinggi-tinggi |
| Nilai tahunan SAM | 20-140 × Rp18.000.000 | Rp360 juta-2,52 miliar/tahun | Peluang dengan asumsi kecocokan, bukan pipeline |
| Kasus kapasitas SOM 12 bulan | 2-10 lokasi berbayar yang bertahan | Rp36-180 juta ARR akhir periode | Rentang target penyampaian, bukan ramalan penjualan |

ARR akhir periode adalah pendapatan berulang bulan terakhir ×12. Jika lokasi mulai pada bulan berbeda, pendapatan langganan yang diakui adalah jumlah(harga lokasi × bulan tertagih), bukan ARR akhir periode. Dua pilot bukan dua langganan berbayar, dan pilot gratis tidak masuk ARR.

## Sensitivitas dan kapasitas

Pada 10 lokasi yang bertahan, uji harga bulanan Rp1.000.000, Rp1.500.000 dan Rp2.000.000 menghasilkan ARR akhir Rp120.000.000, Rp180.000.000 dan Rp240.000.000. Perhitungan ini tidak membuktikan penerimaan harga. Tim dua orang dapat menjangkau lebih sedikit lokasi jika onboarding dan dukungan masih manual. Batas kapasitas: lokasi baru/bulan ≤ jam onboarding tersedia ÷ jam onboarding terukur/lokasi; lokasi yang dipertahankan ≤ kapasitas jam dukungan ÷ jam dukungan/lokasi.

## Kesenjangan data dan tindakan berikut

P harus menyusun daftar berizin berisi akun, alamat lokasi, grup operator, alat saat ini, perkiraan tiket layak bulanan, pembeli ekonomi dan tanggal sumber. Q memeriksa sepuluh catatan untuk duplikasi portofolio dan cakupan fasilitas nyata sebelum memakai total. Dapatkan jumlah gedung komersial dari geografi terdefinisi atau asosiasi properti dan catat cakupan, kekosongan serta pengecualian lokasi terkelola. Hitung ulang SAM setelah penemuan; biarkan kolom yang belum diketahui tetap demikian. Hentikan ekspansi jika daftar terjangkau realistis atau pembeli berbayar tidak dapat dibuktikan. Lihat [perbandingan segmen](segment-comparison.md) dan [ekonomi unit](../02-business/unit-economics-and-costs.md).
