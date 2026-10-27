# Ekonomi unit dan biaya

Tanggal: 2026-10-20 | Status: Usulan / berbasis riset | ID dokumen: B-04

[English / Bahasa Indonesia](../../en/02-business/unit-economics-and-costs.md)

## Keputusan dan status model

Ukur nilai pembeli dan kontribusi penjual secara terpisah. Setiap skenario finansial di bawah adalah simulasi, bukan pengeluaran nyata, penawaran diterima atau ramalan. USD1 = Rp16.000 hanya asumsi konversi. Anggaran, gaji, ketentuan akun AI, volume tiket dan kesediaan membayar pelanggan belum diketahui. Pertahankan tampilan kas serta biaya lengkap agar upaya pendiri tanpa bayaran tidak hilang.

Isi: [ROI pembeli](#roi-pembeli-dan-contoh-negatif), [rumus biaya](#rumus-biaya), [skenario volume](#skenario-volume-bulanan), [kontribusi](#kontribusi-penjual-dan-biaya-pilot), [akuisisi](#akuisisi-payback-dan-runway).

## ROI pembeli dan contoh negatif

Nilai kapasitas tenaga kerja bulanan = tiket layak × menit operator bersih hemat/tiket ÷60 × nilai jam kerja pelanggan lengkap. Menit bersih harus memperhitungkan koreksi tambahan; beban teknisi dan supervisor diukur terpisah. Kapasitas hemat tidak otomatis mengurangi gaji. Jangan menghitung nilai downtime atau kecelakaan terhindar tanpa pembanding pelanggan yang dapat dipertanggungjawabkan.

| Input atau hasil | Simulasi |
| --- | --- |
| Tiket layak/bulan | 100 |
| Menit operator hemat/tiket | 5 |
| Total waktu hemat | 500 menit = 8,333 jam |
| Nilai jam kerja pelanggan | Rp60.000/jam |
| Nilai kapasitas kotor/bulan | Rp500.000 |
| Uji langganan yang diusulkan | Rp1.500.000/lokasi/bulan |
| Nilai bersih sebelum penyiapan dan beban lain | -Rp1.000.000/bulan |
| ROI sederhana hanya langganan | (Rp500.000 - Rp1.500.000)/Rp1.500.000 = -66,7% |
| Volume impas dengan asumsi itu | Rp1.500.000 ÷ (5/60 × Rp60.000) = 300 tiket/bulan |

Tiga ratus tiket hanya menutup langganan. Penyiapan, unggahan teknisi dan pemeriksaan tambahan menaikkan titik impas nyata. Jika 1.000 tiket benar-benar menghemat lima menit bersih masing-masing, nilai kapasitas menjadi Rp5.000.000/bulan, tetap bergantung kemudahan penggunaan serta asumsi tenaga nyata. Perbaikan 20% bukan lima menit kecuali baseline penanganan 25 menit. Pisahkan asumsi itu.

## Rumus biaya

Biaya layanan kas bulanan = hosting aplikasi/worker + basis database/auth + penyimpanan/egress/observabilitas + pemakaian AI + pesan + biaya vendor lain. Biaya AI = token input × tarif input + token output × tarif output + biaya gambar/audio + embedding/pencarian + percobaan ulang, dengan unit tagihan provider konsisten. Akses atau harga Meta/provider yang belum diketahui tetap belum diketahui; harga provider lain tidak dipinjam sebagai tarif Meta terkonfirmasi. WhatsApp ditunda dan tidak diam-diam dihitung sebagai pesan gratis.

Halaman resmi Supabase yang diakses mencantumkan Pro mulai $25/bulan, proyek pertama termasuk, dengan kuota serta kelebihan pemakaian. Pada kurs skenario, nilai awal ini Rp400.000. Ini acuan harga daftar yang diperiksa, bukan tagihan produksi penuh, jaminan regional, perjanjian ditandatangani atau rencana cadangan menyeluruh. Compute, proyek tambahan, retensi, egress, pajak dan add-on perlu pemeriksaan akun sesuai lingkup. [Harga Supabase](https://supabase.com/pricing)

Acuan pilot terpilih menambah workspace Render Pro $25/bulan serta dua layanan compute 1 CPU / 2 GB seharga $25/bulan masing-masing untuk aplikasi dan worker. Bersama nilai awal Supabase Pro $25, basisnya $100/bulan = Rp1.600.000 sebelum AI, alokasi media/egress/log, staging, pajak dan kelebihan pemakaian. Ini konfigurasi harga daftar untuk divalidasi, bukan benchmark kapasitas terpasang atau persetujuan region. Render menagih workspace dan compute terpisah. [Harga Render](https://render.com/pricing)

## Skenario volume bulanan

Pilihan aplikasi/worker serta workspace pilot memakai harga daftar Render dengan batas tersebut; database memakai nilai awal Supabase. Compute demo dan operasi awal merupakan alokasi perencanaan, bukan konfigurasi dengan penawaran harga. Media dan AI selalu alokasi. AI Rp100/tiket merupakan placeholder sensitivitas, bukan tarif vendor. Demo memakai data sintetis; baris database gratis adalah pilihan perencanaan, bukan persetujuan memakai free tier untuk data pelanggan langsung.

| Biaya bulanan dalam IDR | Demo, 100 tiket | Pilot, 1.000 tiket | Operasi awal, 10 lokasi / 10.000 tiket |
| --- | ---: | ---: | ---: |
| Aplikasi + worker terpisah; pilot terpilih, kolom lain alokasi | 320.000 | 800.000 | 1.280.000 |
| Workspace; Render Pro terpilih untuk pilot/awal | 0 | 400.000 | 400.000 |
| Basis database/auth | 0 | 400.000 | 400.000 |
| Alokasi media, egress, log dan pemulihan | 160.000 | 240.000 | 640.000 |
| Placeholder AI, Rp100/tiket | 10.000 | 100.000 | 1.000.000 |
| Total biaya layanan kas model | 490.000 | 1.940.000 | 3.720.000 |
| Biaya layanan kas/tiket | 4.900 | 1.940 | 372 |

Alokasi media tidak membuktikan cakupan pemulihan atau retensi wajib. Validasi pemulihan object storage dan database terpisah. Pada 10.000 tiket, AI Rp10/Rp100/Rp1.000 per tiket menghasilkan biaya AI bulanan Rp100.000/Rp1.000.000/Rp10.000.000, sehingga biaya layanan kas total Rp2.820.000/Rp3.720.000/Rp12.720.000. Lacak p50/p95 pemakaian token/gambar nyata, percobaan ulang gagal dan cadangan manual, bukan hanya rata-rata keberhasilan.

## Kontribusi penjual dan biaya pilot

Pada 10 lokasi × Rp1.500.000, MRR Rp15.000.000. Asumsikan dukungan 2 jam/lokasi/bulan dengan Rp100.000/jam, menambah tenaga langsung Rp2.000.000. Total biaya layanan model menjadi Rp5.720.000 dan kontribusi Rp9.280.000, atau 61,9% pendapatan. Ini belum termasuk akuisisi serta pengembangan produk. Jika dukungan 8 jam/lokasi/bulan, kontribusi turun menjadi Rp3.280.000, atau 21,9%, dengan alokasi AI dasar. Pemakaian AI tinggi ditambah dukungan tinggi dapat membuatnya negatif.

Pada satu lokasi beroperasi dengan acuan kas pilot Rp1.940.000 ditambah 2 jam dukungan senilai Rp200.000, langganan Rp1.500.000 menghasilkan kontribusi -Rp640.000/bulan sebelum pengembangan dan akuisisi. Rata-rata sepuluh lokasi tidak boleh menyiratkan pelanggan mandiri pertama menguntungkan. Berbagi infrastruktur membutuhkan isolasi tenant serta kapasitas teruji, bukan hanya membagi biaya tetap.

Contoh jasa sempit yang optimistis mengasumsikan dua bulan tagihan: 2 × Rp1.940.000 = Rp3.880.000 infrastruktur; 12 jam penyiapan × Rp100.000 = Rp1.200.000; serta 16 jam dukungan × Rp100.000 = Rp1.600.000. Total Rp6.680.000 melampaui uji harga pilot Rp5.000.000 sebesar Rp1.680.000. Tenaga 28 jam itu tidak mencakup seluruh usulan beban kesiapan, dukungan dan pengukuran. Ini bukan anggaran pendanaan rencana penyampaian terpilih.

[Rincian pekerjaan dan estimasi](../05-delivery/work-breakdown-and-estimates.md) mengusulkan 92-164 jam kesiapan setelah demo serta 88-144 jam dukungan/pengukuran selama pilot delapan minggu. Dengan asumsi sama Rp100.000/jam, keseluruhan kebutuhan perencanaannya adalah:

| Pekerjaan atau biaya | Rentang perencanaan |
| --- | --- |
| Kesiapan setelah demo, 92-164 jam | Tenaga Rp9.200.000-16.400.000 |
| Dukungan/pengukuran pilot, 88-144 jam | Tenaga Rp8.800.000-14.400.000 |
| Gabungan, 180-308 jam | Tenaga Rp18.000.000-30.800.000 |
| Acuan infrastruktur dua bulan | Rp3.880.000 |
| Total kebutuhan pendanaan kesiapan ditambah pilot | Rp21.880.000-34.680.000 |
| Kekurangan pendanaan terhadap biaya pilot Rp5.000.000 | Rp16.880.000-29.680.000 |

Rentang ini belum termasuk pekerjaan demo, pengembangan lain belum teralokasi, penjualan, perjalanan, pajak dan tenaga internal pelanggan. Jam nyata, nilai per jam dan pendanaan tersedia belum diketahui. P harus menyetujui keputusan pendanaan sebelum menjanjikan pilot. Pisahkan investasi kesiapan produk yang dapat dipakai ulang dari onboarding, dukungan dan pengukuran khusus pelanggan saat memperkirakan COGS per pelanggan; pembagiannya belum terukur. Membebankan seluruh pekerjaan yang dapat dipakai ulang kepada setiap pelanggan berikutnya maupun menghapusnya dari kebutuhan pendanaan pilot pertama sama-sama memberi gambaran tidak adil. Contoh 28 jam merupakan sensitivitas sempit alternatif, bukan tambahan tenaga di atas WBS ini.

Untuk ilustrasi bulanan biaya lengkap yang terpisah, tambahkan biaya peluang pengembangan Rp16.000.000/bulan (dua beban kerja setara penuh waktu × asumsi Rp8.000.000) dan komersial/admin Rp4.000.000. Kontribusi dasar Rp9.280.000 menjadi -Rp10.720.000/bulan sebelum pajak. Ini beban skenario, bukan status pegawai atau gaji terkonfirmasi. Metode bulanan Rp20.000.000 ini serta metode jam WBS adalah cara alternatif menilai pekerjaan tim yang bertumpang tindih. Jangan menjumlahkannya untuk orang, jam dan periode sama, atau menghitung jam sama sebagai dukungan sekaligus pengembangan.

## Akuisisi, payback dan runway

CAC = kas penjualan teratribusi + nilai jam penjualan, dibagi akun berbayar baru dalam kohor yang selesai. Ilustrasi biaya akuisisi Rp500.000 ditambah 30 jam × Rp100.000 menghasilkan Rp3.500.000 untuk satu akun. Akun satu lokasi dengan alokasi kontribusi rata-rata sepuluh lokasi Rp928.000/bulan menghasilkan payback sederhana 3,77 bulan. Ini tidak berlaku pada operasi satu lokasi yang rugi di atas, ketika payback belum terdefinisi sampai kontribusi positif. Alokasi biaya tetap bersama, onboarding dan churn dapat mengubahnya. Dengan nol pelanggan berbayar, CAC tidak terdefinisi, bukan nol; keputusan tertunda tetap tertunda.

Jangan menerbitkan LTV dari asumsi churn yang belum diamati. Lacak kohor retensi serta kontribusi dahulu. Runway bulan = kas tanpa pembatasan ÷ pembakaran kas bersih bulanan; kedua input belum diketahui. P memiliki ledger biaya dan keputusan kas; E/A mencatat pemakaian provider; Q pendampingan/dukungan; pembeli memastikan asumsi tenaga. Tindakan berikut: ganti setiap alokasi dengan ketentuan akun nyata atau pemakaian terukur sebelum berkomitmen. Lihat [harga](pricing-packaging.md) dan [validasi lapangan](../01-research/field-validation.md).
