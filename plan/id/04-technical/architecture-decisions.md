# Keputusan arsitektur

TECH-10 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/04-technical/architecture-decisions.md)

Daftar isi: [Register keputusan](#register-keputusan) · [ADR-001 Monolit modular dengan worker terpisah](#adr-001-monolit-modular-dengan-worker-terpisah) · [ADR-002 PostgreSQL, Auth, dan Storage privat terkelola](#adr-002-postgresql-auth-dan-storage-privat-terkelola) · [ADR-003 Job tahan lama dan outbox sebelum panggilan model](#adr-003-job-tahan-lama-dan-outbox-sebelum-panggilan-model) · [ADR-004 Kewenangan manusia dan status AI terpisah](#adr-004-kewenangan-manusia-dan-status-ai-terpisah) · [ADR-005 Tanda terima pelapor terbatas tanpa akun](#adr-005-tanda-terima-pelapor-terbatas-tanpa-akun) · [ADR-006 Adapter AI server mode Standard](#adr-006-adapter-ai-server-mode-standard) · [ADR-007 Alur mandiri dan pendamping ekspor](#adr-007-alur-mandiri-dan-pendamping-ekspor) · [ADR-008 Retensi dapat dikonfigurasi dan wilayah bersyarat](#adr-008-retensi-dapat-dikonfigurasi-dan-wilayah-bersyarat) · [Penerimaan dan tindakan berikutnya](#penerimaan-dan-tindakan-berikutnya)

## Register keputusan

Semua catatan berikut berstatus usulan pada 2026-10-20. Catatan mendokumentasikan tradeoff untuk ditinjau, bukan penerimaan pendiri atau implementasi. P memiliki batas produk, E penerimaan teknis, A evaluasi model, dan Q alur/kualitas. Perubahan mencatat alasan dan ID pengganti; jangan menulis ulang riwayat diam-diam. Kosakata mengikuti [model domain](domain-and-data-model.md): report berarti pengamatan, ticket berarti pekerjaan yang dikelola, dan verification berarti keputusan supervisor.

## ADR-001 Monolit modular dengan worker terpisah

Tim 2-4 orang memerlukan alur bukti lengkap sebelum spesialisasi infrastruktur. Usulkan modul Next.js + TypeScript/Node dengan deployment app/worker terpisah, dibanding microservices atau dua runtime Next.js/FastAPI. Validasi bersama dan operasi lebih sedikit lebih bernilai daripada kemudahan Python untuk cakupan awal. Konsekuensi: kerja media berat CPU perlu batas sumber worker. Tinjau ketika kebutuhan khusus Python tervalidasi atau hambatan skala terukur mengalahkan biaya runtime tambahan.

## ADR-002 PostgreSQL, Auth, dan Storage privat terkelola

Status: digantikan pada 2026-10-30 oleh D-11 di [register keputusan](../00-foundation/decision-register.md): PostgreSQL dan MinIO self-hosted di Docker, dengan autentikasi di aplikasi.

Usulkan Supabase untuk mengurangi kerja integrasi identitas/storage sambil mempertahankan model domain relasional. Alternatif adalah PostgreSQL/Auth/object storage terpisah atau self-hosting yang menambah operasi tim. Konsekuensi: kunci service, API storage, ketersediaan wilayah, dan backup menciptakan kewajiban khusus penyedia. Portabilitas memerlukan migrasi SQL, ekspor data/manifest media, dan rencana pemulihan eksplisit. Terima hanya setelah latihan akses dua tenant dan pulih/hapus. [Dokumentasi RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) (T-03) mendukung mekanisme, bukan bukti konfigurasi kita.

## ADR-003 Job tahan lama dan outbox sebelum panggilan model

Usulkan event/outbox ter-commit transaksional serta Supabase Queues/pgmq tervalidasi dibanding tugas dalam memori atau infrastruktur Redis sendiri. Report diterima harus bertahan saat worker/penyedia gagal. Konsekuensi: retry dapat menggandakan kerja eksternal, sehingga kunci hasil, catatan pengiriman, dan retry terbatas wajib. [Jaminan jendela visibilitas](https://supabase.com/docs/guides/queues) (T-05) lebih sempit daripada efek bisnis exactly-once. Tinjau antrean bila perilaku ekstensi/transaksi gagal dalam spike.

## ADR-004 Kewenangan manusia dan status AI terpisah

Pisahkan draf AI dari mesin status kerja. Pengaitan duplikat oleh manusia mempertahankan report asli; hanya verifikasi supervisor menutup pekerjaan. Penugasan/penutupan AI otomatis mengurangi klik tetapi memberi kewenangan tanpa dukungan dan mengaburkan pengukuran kesalahan. Konsekuensi: biaya tinjauan operator dan input teknisi harus diukur jujur. Tinjau bantuan hanya setelah evaluasi disepakati, jangan mengubah respons AI sukses menjadi verified_closed.

## ADR-005 Tanda terima pelapor terbatas tanpa akun

Gunakan token acak dapat dicabut dengan hash tersimpan dan sesi terbatas dibanding pencarian ID berurutan publik atau registrasi pelapor wajib. Ini menurunkan beban pengiriman sambil membatasi pengungkapan. Konsekuensi: pemulihan token hilang dan sisa TTL tautan bertanda tangan memerlukan kebijakan eksplisit. Akses terbatas pada status/klarifikasi report sendiri yang disaring. [Rancangan keamanan](security-privacy-and-governance.md) menetapkan kedaluwarsa, rotasi, dan aturan tanpa log. Login akun dapat ditambah ketika pelanggan memiliki kebutuhan identitas nyata.

## ADR-006 Adapter AI server mode Standard

Gunakan adapter penyedia dan usulkan Meta Standard untuk data nyata. Diskon Contributor menukar izin pelatihan konten yang dikirim menurut [ketentuan harga Meta](https://dev.meta.ai/docs/pricing-rate-limits) (T-11). Konsekuensi: anggaran memakai tarif Standard dan tinjauan privasi tetap menyelesaikan retensi, lokasi pemrosesan, serta ketentuan akun. Akses/kepatuhan tidak diasumsikan. ID model ditetapkan setelah pemeriksaan akun/evaluasi, dengan alur manual jika tidak tersedia.

## ADR-007 Alur mandiri dan pendamping ekspor

Mulai dengan satu site, beberapa kategori, dan CSV ditinjau. Pengganti CMMS lengkap atau integrasi dua arah memperluas persoalan kepemilikan/konflik sebelum nilai diukur. Konsekuensi: sebagian pelanggan tidak cocok dan integrasi khusus perlu harga terpisah. Tinjau saat pembeli bernama menyediakan API/sampel layak dan menyepakati catatan acuan. Lihat [migrasi](integrations-and-migration.md).

## ADR-008 Retensi dapat dikonfigurasi dan wilayah bersyarat

Usulkan media operasional 90 hari dan audit minimum 365 hari, ditambah siklus backup terinventaris terpisah. Usulkan Singapura hanya setelah ketersediaan/persetujuan transfer. Alternatif retensi tanpa batas atau pemilihan wilayah tanpa syarat memudahkan setup tetapi menciptakan asumsi privasi/biaya tidak beralasan. Konsekuensi: ledger hapus dan pembersihan data restore wajib. Pemilik data dan penasihat hukum menentukan periode nyata; nilai ini bukan klaim periode wajib.

## Penerimaan dan tindakan berikutnya

E mencatat bukti spike untuk ADR-001/002/003/005; A memeriksa model/ketentuan serta evaluasi ADR-006; P/Q memvalidasi kewenangan pelanggan, alur, dan retensi ADR-004/007/008. Tandai diterima hanya dengan peninjau, tanggal, bukti, serta batas tersisa. Jika keputusan gagal, catat usulan pengganti dan perbarui kedua bahasa beserta [kontrak](api-and-event-contracts.md), biaya, dan estimasi delivery bersama.
