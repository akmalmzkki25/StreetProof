# Keamanan, privasi, dan tata kelola

TECH-07 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/04-technical/security-privacy-and-governance.md)

Daftar isi: [Rekomendasi dan tanggung jawab](#rekomendasi-dan-tanggung-jawab) · [Ancaman dan kontrol](#ancaman-dan-kontrol) · [Akses pelapor dan media](#akses-pelapor-dan-media) · [Jadwal retensi dan penghapusan](#jadwal-retensi-dan-penghapusan) · [Tinjauan hukum Indonesia dan pengadaan](#tinjauan-hukum-indonesia-dan-pengadaan) · [Tata kelola AI dan insiden](#tata-kelola-ai-dan-insiden) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Rekomendasi dan tanggung jawab

Gunakan konten demo sintetis atau berizin. Data pilot nyata memerlukan pemilik data pelanggan bernama, tujuan/pemberitahuan disepakati, izin peran/site, media privat, prosedur hapus, serta latihan pemulihan. Kontrol ini adalah usulan persyaratan, bukan sertifikasi kepatuhan atau kesimpulan hukum. Penasihat hukum/pemilik data pelanggan menentukan kewajiban Indonesia, dasar transfer, kontrak, dan tenggat insiden yang berlaku sebelum peluncuran. Sertifikasi penyedia tidak menyertifikasi StreetProof.

## Ancaman dan kontrol

| Ancaman | Usulan kontrol | Bukti sebelum pilot |
| --- | --- | --- |
| Akses objek lintas tenant | Otorisasi server + RLS + foreign key gabungan + path objek tenant | Uji izin/tolak dua tenant pada API, SQL, ekspor, media |
| Tanda terima pelapor bocor | Token acak 32 byte, hash tersimpan, scope/dapat dicabut | Pemeriksaan tebakan, kedaluwarsa, rotasi, redaksi log |
| Sesi/cache SSR bocor | Klaim terverifikasi/keanggotaan terkini, tanpa cache bersama | Panggilan API/Action langsung dan skenario cache dua pengguna |
| Unggahan berbahaya | Allowlist, batas byte/dimensi decode, karantina, pemeriksaan malware/decoder | Ukuran berlebih, executable diganti nama, gambar rusak, scanner mati |
| Prompt injection | Teks/foto sebagai data, skema ketat, tanpa mutasi model | Evaluasi adversarial dan alur manual |
| Akses istimewa berlebihan | Rahasia server terpisah, hak minimum, break-glass diaudit | Pemindaian rahasia, tinjauan akses, latihan pencabutan darurat |
| Spam/pengurasan anggaran | Kuota site/sesi/IP, batas unggah/job, circuit breaker | Skenario penyalahgunaan ramah NAT dan pemakaian per tenant |

[RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) (T-03) dan [kontrol akses Storage](https://supabase.com/docs/guides/storage/security/access-control) (T-06) menjelaskan mekanisme termasuk bypass berprivilege. Jangan letakkan kredensial rahasia/service di peramban. Batasi schema terekspos, hak tabel, dan view, bukan hanya tombol UI. Untuk SSR ikuti [panduan identitas terverifikasi/cache Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs) (T-02); objek sesi klien saja bukan otorisasi memadai.

## Akses pelapor dan media

Hasilkan minimal 128 bit entropi kriptografis; usulan 256 bit. Simpan hanya hash token, scope report, kedaluwarsa, dan metadata pencabutan. Tautan tanda terima menempatkan token mentah pada fragment, lalu klien menukarnya melalui POST dan menghapusnya dengan penggantian riwayat peramban. Tanpa analitik pihak ketiga di halaman itu, gunakan referrer policy ketat, dan redaksi body/authorization. Pertukaran menghasilkan cookie Secure HttpOnly SameSite terbatas. Scope default adalah status; scope clarify eksplisit. Tidak membuka report lain, kontak staf, atau catatan internal.

Usulkan token kedaluwarsa pada retensi operasional atau 90 hari, mana lebih awal; pemilik data dapat memperpendeknya. Pencabutan dan rotasi membatalkan sesi pelapor lama melalui pemeriksaan kredensial server. Token hilang tidak dipulihkan lewat ID report berurutan; operator berwenang mengikuti proses pemulihan identitas/channel terdokumentasi atau tidak memberikan data privat.

Simpan media privat dengan path tetap. Terbitkan unduhan bertanda tangan selama usulan lima menit setelah otorisasi. URL yang sudah diterbitkan dapat dipakai hingga TTL, jadi hentikan penerbitan tautan baru saat pencabutan dan dokumentasikan jendela tersisa itu. Hapus EXIF/geolokasi, buat turunan tersanitasi, minimalkan wajah/pelat bila layak, dan minta pelapor menghindari orang/dokumen yang tidak perlu. Objek karantina asli memiliki masa simpan singkat disepakati. Scanner mati mempertahankan karantina dengan penanganan teks manual, bukan pelepasan tidak aman.

## Jadwal retensi dan penghapusan

| Kelas | Usulan jadwal pilot | Pemilik dan perilaku hapus |
| --- | --- | --- |
| Media operasional dan kontak pelapor | 90 hari setelah acuan kasus/pengumpulan disepakati | Pemilik data memilih acuan; hapus asli, turunan, kontak |
| Catatan kerja/audit | 365 hari | Minimalkan/redaksi payload pribadi; simpan event non-identifikasi beralasan |
| Objek yatim unggah dibatalkan/kedaluwarsa | Bersihkan dalam 24 jam setelah izin berakhir | E memantau pembersihan gagal dan sisa objek penyedia |
| File ekspor | 24 jam | Hapus objek; tautan bertanda tangan berakhir lebih awal |
| Log aplikasi | 30 hari | Tanpa token mentah, kontak, gambar; pengecualian ditinjau |
| Backup | Inventaris retensi penyedia dan offsite nyata | Kedaluwarsa pada siklus terdokumentasi; restore menerapkan ulang ledger penghapusan |

Ini asumsi dapat dikonfigurasi, bukan periode wajib hukum. Legal hold memerlukan kewenangan, scope, dan tanggal tinjau tercatat. Alur hapus: verifikasi kewenangan, inventaris referensi, cabut kredensial, hapus objek aktif/turunan/ekspor dan kolom pribadi, catat tombstone jumlah kelas, tandai tanggal berakhir backup, lalu periksa penyelesaian. Jangan menjanjikan penghapusan fisik segera dari semua backup. Terapkan ulang ledger sebelum sistem dipulihkan tersambung ke pengguna/penyedia. Lihat [dokumentasi backup](https://supabase.com/docs/guides/platform/backups) (T-08) dan verifikasi cakupan objek terpisah dari pemulihan database.

## Tinjauan hukum Indonesia dan pengadaan

[Naskah resmi UU 27/2022](https://peraturan.go.id/files/Salinan+UU+Nomor+27+Tahun+2022.pdf) (T-14, dibaca melalui Jina) mendefinisikan pengendali/prosesor serta mengatur dasar pemrosesan pada Pasal 20, pengaturan prosesor pada Pasal 51, dan transfer luar negeri pada Pasal 56. Gunakan sebagai masukan tinjauan, bukan klaim rancangan memenuhi UU. Penasihat pelanggan menentukan peran nyata, dasar, pemberitahuan/hak, prosedur insiden termasuk Pasal 46, retensi, serta pengamanan transfer pilot.

| Isu terbuka | Keputusan/bukti sebelum data nyata |
| --- | --- |
| Hosting dan keberlakuan PSE | Tentukan klasifikasi sistem privat/publik, aturan registrasi/hosting berlaku, serta aturan pelaksana terkini; tanpa kesimpulan hosting dari laporan awal |
| Rantai penyedia/subprosesor | Inventaris Supabase DB/Auth/Storage, app/worker Render, inferensi Meta, serta email/monitoring; negara nyata, kontrak, subprosesor, akses, retensi, hapus masih perlu diverifikasi |
| Pemrosesan lintas negara | Petakan semua aliran termasuk inferensi, log, backup; dokumentasikan penilaian Pasal 56 dan otorisasi pelanggan sebelum memilih Singapura/penyedia |
| Instruksi prosesor | Sepakati tujuan, batas akses, prosesor lanjutan, serta persetujuan tertulis bila berlaku; hindari pelatihan/pemasaran di luar tujuan |
| Pembelian pemerintah/kampus publik | Pemilik pengadaan pelanggan menentukan entitas/pendanaan, metode, kualifikasi penyedia, kontrak, dan syarat hosting sebelum janji waktu pilot/pembelian |

[Register resmi LKPP untuk Perpres 46/2025](https://jdih.lkpp.go.id/regulation/peraturan-presiden/peraturan-presiden-nomor-46-tahun-2025) (T-15, halaman dibaca nyata) menyebut perubahan kedua Perpres 16/2018 tentang pengadaan pemerintah dan berstatus berlaku. Ini alasan memeriksa kerangka pengadaan terkini dengan pembeli, bukan bukti semua kampus mengikuti satu jalur. Keberlakuan rinci, aturan pelaksana, dan kewajiban khusus pelanggan belum selesai. Pembacaan halaman PP 71/2019 langsung timeout (T-17); tidak ada pernyataan hukum hosting berdasarkan itu. Pertahankan pilot sintetis bila persoalan ini terbuka.

## Tata kelola AI dan insiden

Gunakan Meta mode Standard sebagai default data nyata. [Ketentuan Meta pada halaman harga](https://dev.meta.ai/docs/pricing-rate-limits) (T-11) menyatakan konten Standard tidak dipakai melatih model; Contributor memberi izin pelatihan untuk diskon. Ini belum menentukan lokasi pemrosesan, retensi, subprosesor, atau semua kewajiban kontrak. Dapatkan jawabannya sebelum mengirim data pilot. Tanpa opt-in Contributor default.

P bertanggung jawab atas komunikasi pelanggan; E membatasi kebocoran akses, merotasi rahasia, dan menyimpan bukti minimum; Q mencatat alur terdampak; A menonaktifkan AI jika terkait. Ikuti kewajiban pemberitahuan hukum/disepakati setelah tinjauan penasihat, tanpa membuat tenggat rekaan. Rencana ini saja tidak mengotorisasi pesan eksternal. Lihat [dukungan](../05-delivery/operations-and-support.md).

## Ketergantungan dan tindakan berikutnya

P memperoleh persetujuan pemilik data serta jawaban transfer/pemroses. E menghasilkan inventaris aliran data, bukti penolakan akses, ledger hapus, dan catatan restore. Q memvalidasi pemberitahuan dan UX redaksi. Blokir pilot data nyata sampai celah kritis diselesaikan; demo sintetis dapat berlanjut terpisah.
