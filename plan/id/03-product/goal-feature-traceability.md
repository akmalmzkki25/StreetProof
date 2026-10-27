# Pemetaan goal dan fitur yang diperbaiki

Document ID: PRD-03  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/03-product/goal-feature-traceability.md)

Isi dokumen

- [Metode dan batas interpretasi](#metode-dan-batas-interpretasi)
- [Goal asal dan perlakuan](#goal-asal-dan-perlakuan)
- [Child goal yang dapat diuji](#child-goal-yang-dapat-diuji)
- [Katalog 71 kelompok fitur](#katalog-71-kelompok-fitur)
- [Penilaian ulang 121 pasangan asal](#penilaian-ulang-121-pasangan-asal)
- [Hubungan pendukung skor 2](#hubungan-pendukung-skor-2)
- [Tambahan dan pengamanan yang harus terlihat](#tambahan-dan-pengamanan-yang-harus-terlihat)
- [Cakupan per goal](#cakupan-per-goal)
- [Kesimpulan dan self-review](#kesimpulan-dan-self-review)

## Metode dan batas interpretasi

Dokumen ini memperbaiki pemetaan OR-02 tanpa menyamakan cakupan spesifikasi dengan keberhasilan produk. Katalog mempertahankan 27 ID goal, 71 ID fitur dan provenance 210 butir OR-01 §7. Setiap skor adalah penilaian penulis terhadap kemampuan yang dijelaskan, bukan pengukuran pengguna. Skor 5 berarti satu kemampuan cukup untuk hasil yang sempit; 4 berarti langsung dengan satu kemampuan pendukung; 3 berarti kontribusi parsial; 2 berarti penopang; 1 bersinggungan; 0 tidak terkait. Tidak ada hasil pilot yang tersedia.

Semua goal gabungan diperiksa sebagai rangkaian hasil. Matriks parent tidak diberi skor tinggi hanya karena satu bagian tertutup. Keyakinan tinggi berarti teks sumber jelas, bukan probabilitas AI atau jaminan adopsi. Pasangan yang tidak ditulis belum dinilai secara terpisah atau paling tinggi 1; angka nol tidak otomatis diberikan. Hubungan skor 2 tambahan ditampilkan secara eksplisit.

## Goal asal dan perlakuan


| Goal | Hasil asal | Prioritas asal | Sumber | Perlakuan |
| --- | --- | --- | --- | --- |
| G-01 | Mengirim laporan lengkap dengan lokasi dan bukti dalam waktu singkat, tanpa harus tahu kategori atau tim yang tepat | Must | §3.3, §3.2A, §8.1 | Pecah hasil; lihat child goal |
| G-02 | Mengetahui laporan sudah diterima dan mengikuti statusnya tanpa bertanya berulang kali | Must | §3.3, §3.2D | Pertahankan hasil; uji dependensi |
| G-03 | Yakin masalahnya benar-benar sudah diperbaiki | Should | §3.2D, §8.1 langkah 9 | Pertahankan hasil; uji dependensi |
| G-04 | Identitasnya dan data pribadi orang di foto terlindungi | Must | §3.2A, §3.2D, §14.1 | Pecah hasil; lihat child goal |
| G-05 | Diarahkan langsung ke layanan darurat saat menghadapi bahaya, tanpa menunggu analisis AI | Must | §8.5, §3.2B, §2.3 | Pertahankan hasil; uji dependensi |
| G-06 | Mengubah laporan mentah menjadi tiket terstruktur dengan cepat | Must | §3.3, §3.2B, §3.5 H1 | Pertahankan hasil; uji dependensi |
| G-07 | Menangani satu masalah yang dilaporkan banyak orang sebagai satu insiden, tanpa kehilangan jejak setiap pelapor | Must | §3.2B, §3.5 H2, §8.2 | Pertahankan hasil; uji dependensi |
| G-08 | Meneruskan tiket ke tim yang tepat pada percobaan pertama | Must | §3.2B, §3.3, §15.2 | Pertahankan hasil; uji dependensi |
| G-09 | Menetapkan prioritas berdasarkan dampak, bukan berdasarkan siapa yang paling keras mengeluh | Should | §3.2B | Pertahankan hasil; uji dependensi |
| G-10 | Menerima laporan dari semua kanal dalam satu antrean | Should | §3.3, §4.2 Persona A | Pecah hasil; lihat child goal |
| G-11 | Memahami masalah, lokasi, dan aset sebelum tiba di lapangan | Must | §3.3, §3.2C | Pertahankan hasil; uji dependensi |
| G-12 | Mencatat hasil kerja dan bukti dengan input minimal, termasuk saat sinyal lemah | Must | §3.3, §15.3, §17.1 | Pecah hasil; lihat child goal |
| G-13 | Menerima pekerjaan, mengunggah bukti yang diterima, dan melaporkan kendala dalam satu proses yang seragam | Should | §3.3 | Pecah hasil; lihat child goal |
| G-14 | Memverifikasi kualitas pekerjaan dengan bukti standar sebelum tiket ditutup | Must | §3.3, §3.2C, §8.4 | Pertahankan hasil; uji dependensi |
| G-15 | Merekonstruksi kronologi lengkap setiap tiket: siapa, kapan, apa, dan mengapa | Must | §3.3 | Pertahankan hasil; uji dependensi |
| G-16 | Memastikan setiap tiket punya penanggung jawab dan tenggat, serta mengetahui pekerjaan yang tertunda | Must | §3.2C, §3.3, §4.2 Persona A | Pecah hasil; lihat child goal |
| G-17 | Membandingkan SLA dan kualitas bukti kerja antarvendor, tim, dan lokasi | Should | §3.2E, §4.2 Persona B | Pecah hasil; lihat child goal |
| G-18 | Melihat masalah yang berulang dan merencanakan pemeliharaan dari riwayat aset | Could | §3.2E, §4.2 Persona A | Pecah hasil; lihat child goal |
| G-19 | Menyerahkan laporan bulanan tanpa menyusunnya manual | Should | §4.2 Persona A | Pertahankan hasil; uji dependensi |
| G-20 | Melihat performa operasional dan biaya pemeliharaan yang terhubung ke bukti pekerjaan | Should | §3.3, §3.2E | Pecah hasil; lihat child goal |
| G-21 | Membuktikan ROI (waktu administrasi, keterlambatan, dan pekerjaan ulang turun) sebelum membayar | Must | §4.1, §3.5 H6, §12.3, §20.5 | Pecah hasil; lihat child goal |
| G-22 | Memastikan kontrol akses, hosting, audit, dan kepatuhan data terpenuhi sebelum menyetujui | Must | §4.1, §14 | Pecah hasil; lihat child goal |
| G-23 | Membeli dengan ruang lingkup, harga, dan kontrak yang jelas | Should | §4.1, §13.2 | Pertahankan hasil; uji dependensi |
| G-24 | Menjalankan StreetProof sesuai SOP yang berlaku tanpa menambah beban kerja tim | Must | §4.1, §15.3 | Pecah hasil; lihat child goal |
| G-25 | Tidak dinilai atau dihukum otomatis oleh skor AI, dan tidak terbebani migrasi | Should | §4.1, §7.10, §7.6 | Pecah hasil; lihat child goal |
| G-26 | Memastikan laporan dari berbagai kanal masuk ke instansi atau unit yang tepat, serta memantau backlog | Could | §4.2 Persona C, §3.3 | Pecah hasil; lihat child goal |
| G-27 | Menerima rujukan dari StreetProof ke kanal resmi tanpa menduplikasi sistem | Could | §5, §10.2, §20.4 | Pecah hasil; lihat child goal |

## Child goal yang dapat diuji

| ID | Hasil tunggal | Kemampuan kandidat |
| --- | --- | --- |
| G-01a | Laporan memiliki lokasi yang dapat dipakai | F-04/F-05 |
| G-01b | Bukti dan konteks wajib lengkap | F-02/F-07 |
| G-04a | Identitas hanya diakses peran berwenang | F-63 |
| G-04b | Media pihak ketiga diminimalkan/redaksi | F-18 |
| G-04c | Data dihapus sesuai kebijakan yang disetujui | F-65 |
| G-10a | Kanal pilot masuk antrean yang sama | F-01/F-10 |
| G-10b | Kanal luar tersambung dengan izin | F-11/F-68 |
| G-12a | Petugas mencatat hasil dengan sedikit input | F-38 |
| G-12b | Draft tetap tersimpan ketika jaringan putus | F-40 |
| G-13a | Vendor menerima/menolak pekerjaan dengan alasan | F-61 |
| G-13b | Bukti mengikuti standar kategori | F-38/F-42 |
| G-13c | Kendala dapat diajukan untuk keputusan | F-39 |
| G-16a | Tiket memiliki pemilik yang dapat dihubungi | F-29 |
| G-16b | Tenggat dihitung dari kebijakan layanan | F-22/F-29 |
| G-16c | Pekerjaan tertunda terlihat dan dieskalasi | F-50/F-23 |
| G-17a | SLA dibandingkan pada kelompok sebanding | F-51/F-53 |
| G-17b | Mutu bukti dibandingkan dengan definisi sama | F-52/F-53 |
| G-18a | Aset berulang rusak teridentifikasi | F-57/F-59 |
| G-18b | Inspeksi terjadwal sesuai keputusan manusia | F-58 |
| G-20a | Performa operasional terhubung event tiket | F-50/F-51 |
| G-20b | Biaya pekerjaan ditautkan bukti | F-56/F-71 |
| G-21a | Waktu kerja aktif dibanding baseline sebanding | N-02 |
| G-21b | Biaya/manfaat dihitung transparan | N-02/F-55 |
| G-21c | Pembeli memutuskan penawaran nyata | N-03 |
| G-22a | Akses mengikuti peran dan tenant | F-63/F-66 |
| G-22b | Akses/perubahan dapat diaudit | F-33/F-64 |
| G-22c | Hosting/subprosesor disetujui owner | N-04/F-66 |
| G-22d | Retensi/penghapusan dapat dijalankan | F-65 |
| G-22e | Insiden dan akses support terkendali | N-05 |
| G-24a | Workflow sesuai SOP yang disepakati | F-16/F-20/N-06 |
| G-24b | Beban input tidak naik tanpa manfaat | N-02/F-38 |
| G-25a | Skor AI tidak memberi penalti otomatis | F-62 |
| G-25b | Migrasi dapat dilakukan bertahap | F-10/F-68 |
| G-25c | Dampak pengawasan/perubahan proses dibahas | N-06 |
| G-26a | Rujukan mengikuti kewenangan instansi | F-15/F-69 |
| G-26b | Backlog lintas kanal dapat dipantau | F-50/F-10 |
| G-27a | Data dikirim melalui jalur yang diizinkan | F-69/F-55 |
| G-27b | Serah terima dapat direkonsiliasi | F-67/N-06 |

## Katalog 71 kelompok fitur

Kolom tahap menyebut irisan minimum yang dibutuhkan, bukan seluruh isi unit. Contoh F-02 pada demo hanya foto, bukan video/voice. F-63 pada demo mencakup peran/tenant dasar, bukan SSO; F-66 mencakup isolasi dan media privat, bukan klaim pentest selesai.


| ID | Kemampuan OR-02 | Asal | Dependensi luar asal | Tahap usulan |
| --- | --- | --- | --- | --- |
| F-01 | Formulir web/PWA responsif, mode aksesibilitas, Bahasa Indonesia | §7.1 | - | Demo minimum |
| F-02 | Upload bukti multimodal: foto, beberapa foto, video pendek, voice note | §7.1 | - | Demo minimum |
| F-03 | Transkripsi voice note dan audio | §7.1, §7.2 | - | Conditional experiment after core |
| F-04 | Lokasi: GPS, pencarian alamat, pilih gedung/lantai/ruang/aset | §7.1, §7.12 | Provider peta | Demo minimum |
| F-05 | QR code di ruangan atau aset dengan konteks lokasi | §7.1, §7.9 | - | Pilot |
| F-06 | Kategori, subkategori, dan template laporan | §7.1 | - | Demo minimum |
| F-07 | Pertanyaan lanjutan adaptif, deteksi informasi kurang, klarifikasi otomatis | §7.1, §7.2 | - | Demo minimum |
| F-08 | Preview laporan sebelum dikirim dan simpan draft | §7.1 | - | Demo minimum |
| F-09 | Nomor tiket unik dan notifikasi penerimaan | §7.1, §7.7 | - | Demo minimum |
| F-10 | Email intake dan impor laporan lama dari CSV | §7.1, §7.12 | - | Later / validate |
| F-11 | Kanal WhatsApp Business | §7.1, §7.12, §10.4 | Izin platform | Later / validate |
| F-12 | Ringkasan laporan, image captioning, OCR | §7.2 | - | Demo minimum |
| F-13 | Ekstraksi field terstruktur: lokasi, jenis masalah, dampak, aset, waktu, tindakan | §7.2 | - | Demo minimum |
| F-14 | Rekomendasi kategori dengan penjelasan dan skor keyakinan berambang | §7.2 | - | Demo minimum |
| F-15 | Rekomendasi tim atau penanggung jawab berdasarkan aturan organisasi | §7.2 | - | Later / validate |
| F-16 | Rujukan ke SOP dan checklist internal | §7.2 | - | Pilot |
| F-17 | Moderasi antrean (bahasa kasar, konten tidak relevan), anti-spam, rate limiting | §7.2, §7.3 | - | Before public intake: rate limits; AI moderation later |
| F-18 | Redaksi atau blur informasi pribadi pada gambar, dengan pemeriksaan manual | §7.2 | - | Before real data: minimize/manual redact; automatic blur conditional |
| F-19 | Feedback loop dari koreksi operator | §7.2 | - | Pilot |
| F-20 | Rule engine routing (kategori, lokasi, aset, jam kerja, tim), penugasan manual dan otomatis, rotasi, batas kapasitas | §7.3 | - | Demo minimum |
| F-21 | Kategori darurat yang memicu eskalasi manusia, ditambah pesan keselamatan | §7.3, §8.5 | - | Demo minimum |
| F-22 | SLA per kategori, jam operasional, kalender libur | §7.3 | - | Pilot |
| F-23 | Eskalasi otomatis: tiket tidak diterima, SLA mendekati batas, notifikasi gagal | §7.3, §7.7 | - | Pilot |
| F-24 | Deteksi duplikasi (lokasi, waktu, kategori, kemiripan semantik), pengelompokan insiden dengan jejak pelapor, tautan tiket duplikat | §7.3, §7.4 | - | Demo minimum |
| F-25 | Deteksi salah unit, riwayat routing, reassignment dengan alasan | §7.3 | - | Later / validate |
| F-26 | Antrean review untuk laporan berkeyakinan rendah | §7.3 | - | Demo minimum |
| F-27 | Rekomendasi vendor berdasarkan kontrak dan area | §7.3 | - | Later / validate |
| F-28 | State machine status tiket, dari draft sampai ditutup, dibuka kembali, atau ditolak dengan alasan | §7.4, §11.4 | - | Demo minimum |
| F-29 | Penanggung jawab, tim, prioritas, SLA, dan perkiraan waktu di setiap tiket | §7.4 | - | Demo minimum |
| F-30 | Checklist pekerjaan, subtask dan dependensi, catatan material, pengajuan perubahan scope | §7.4 | - | Later / validate |
| F-31 | Catatan internal terpisah dari komentar yang terlihat pelapor, lampiran dokumen | §7.4 | - | Demo minimum |
| F-32 | Relasi tiket ke aset, lokasi, dan kontrak/vendor | §7.4 | - | Later / validate |
| F-33 | Audit trail yang tidak dapat diubah pengguna biasa, riwayat aktivitas | §7.4 | - | Demo minimum |
| F-34 | Reopen dengan alasan | §7.4, §7.6 | - | Demo minimum |
| F-35 | Bulk action supervisor, pencarian, filter, saved views | §7.4 | - | Demo minimum |
| F-36 | Daftar pekerjaan hari ini dan urutan kunjungan | §7.5 | - | Pilot |
| F-37 | Konteks lokasi/aset dan instruksi keselamatan dari SOP di aplikasi petugas | §7.5 | - | Demo minimum |
| F-38 | Checklist dan foto sebelum/sesudah, catatan suara atau teks, waktu mulai dan selesai | §7.5 | - | Demo minimum |
| F-39 | Status menunggu akses/material/vendor, laporan pekerjaan tidak dapat dilakukan, permintaan bantuan supervisor | §7.5 | - | Demo minimum |
| F-40 | Mode offline dengan sinkronisasi | §7.1, §7.5 | - | Pilot: durable drafts; full offline conditional |
| F-41 | Konfirmasi penanggung jawab lokasi dan sinyal lokasi/waktu | §7.5 | - | Pilot |
| F-42 | Checklist verifikasi per kategori, foto after wajib, catatan wajib bila bukti tidak tersedia | §7.6 | - | Demo minimum |
| F-43 | Perbandingan foto before/after dan deteksi objek yang sama, sebagai bantuan | §7.6 | - | Later / validate |
| F-44 | Pemeriksaan supervisor, dengan pemisahan "dilaporkan selesai" dan "diverifikasi selesai" | §7.6, §8.4 | - | Demo minimum |
| F-45 | Konfirmasi dan umpan balik pelapor | §7.6, §8.1 | Kebijakan organisasi | Pilot |
| F-46 | Sampling audit acak, deteksi pola bukti mencurigakan, riwayat verifikasi | §7.6 | - | Pilot |
| F-47 | Notifikasi ke pelapor: pembaruan status, pekerjaan selesai diajukan, hasil verifikasi, pembukaan kembali | §7.7 | - | Demo minimum |
| F-48 | Notifikasi internal: penugasan dan peringatan SLA | §7.7 | - | Pilot |
| F-49 | Template notifikasi per organisasi, pengaturan frekuensi, bahasa yang mudah dipahami, riwayat | §7.7 | - | Pilot |
| F-50 | Dashboard operasional: volume per kategori/lokasi, backlog, umur tiket, beban kerja tim | §7.8 | - | Demo minimum |
| F-51 | Metrik waktu dan SLA: time to triage, assignment, first response, resolution, kepatuhan SLA | §7.8 | - | Demo minimum |
| F-52 | Metrik kualitas: reopen rate, bukti lengkap, rasio duplikat, catatan kualitas data | §7.8 | - | Demo minimum |
| F-53 | Kinerja vendor dengan konteks volume dan kesulitan, ekspor evaluasi vendor | §7.8, §7.10 | - | Later / validate |
| F-54 | Tren kerusakan per aset, heatmap agregat, perbandingan periode | §7.8 | - | Later / validate |
| F-55 | Ekspor CSV/PDF dan laporan berkala otomatis | §7.8 | - | Pilot |
| F-56 | Analisis biaya pemeliharaan, analisis akar masalah sebagai hipotesis, prediksi setelah data memadai | §7.8 | Data biaya | Later / validate |
| F-57 | Registry aset: ID, QR, lokasi, metadata, garansi, kontrak, riwayat kerusakan dan pekerjaan | §7.9 | - | Later / validate |
| F-58 | Preventive maintenance: jadwal inspeksi, checklist inspeksi, pengingat | §7.9 | - | Later / validate |
| F-59 | Analisis aset yang sering rusak | §7.9 | - | Later / validate |
| F-60 | Direktori vendor: wilayah, jenis pekerjaan, kontrak, SLA kontraktual | §7.10 | - | Later / validate |
| F-61 | Assignment dan acceptance vendor, dispute workflow, approval supervisor | §7.10 | - | Later / validate |
| F-62 | Kebijakan produk: tanpa auto-blacklisting, tanpa penalti otomatis dari skor AI, tanpa biometrik | §7.10, §7.6 | - | Demo minimum |
| F-63 | RBAC, scope akses per organisasi/lokasi/tim/jenis data, SSO, MFA admin | §7.11 | IdP (SSO) | Demo minimum |
| F-64 | Audit log untuk login, akses, ekspor, dan perubahan tiket | §7.11 | - | Demo minimum |
| F-65 | Retensi dan penghapusan data, klasifikasi data, redaksi ekspor, ekspor data tenant | §7.11 | - | Demo minimum |
| F-66 | Multi-tenant, backup dan restore, enkripsi, environment terpisah, uji penetrasi | §7.11 | - | Demo minimum |
| F-67 | REST API dan webhooks | §7.12 | - | Later / validate |
| F-68 | Integrasi CMMS/CAFM/helpdesk dan registry aset eksternal | §7.12 | Sistem pelanggan | Later / validate |
| F-69 | Integrasi sistem aduan resmi dan adapter Open311 | §7.12, §10.2 | Otorisasi instansi | Later / validate |
| F-70 | MCP server dengan izin per tool dan audit log | §7.12, §10.5 | - | Later / validate |
| F-71 | BI tools dan ERP/finance read-only | §7.12 | Sistem pelanggan | Later / validate |

## Penilaian ulang 121 pasangan asal

Bukti per baris mengacu OR-01. Semua nilai diturunkan atau dipertahankan dari OR-02 melalui uji hasil parent lengkap. Confidence sedang berarti teks jelas tetapi pemenuhan memerlukan integrasi/proses/validasi; tinggi hanya pada kecocokan kemampuan yang sempit. Alasan menyebut kontribusi dan rantai yang masih dibutuhkan.


| Goal | Fitur | Skor OR-02 | Skor revisi | Keyakinan | Alasan dan batas | Bukti |
| --- | --- | --- | --- | --- | --- | --- |
| G-01 | F-07 | 4 | 3 | sedang | Pertanyaan lanjutan adaptif memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.1, §3.5 H3, §8.1 langkah 5 |
| G-01 | F-04 | 4 | 3 | sedang | Lokasi: GPS memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.1, §3.2A |
| G-01 | F-05 | 4 | 3 | sedang | QR code di ruangan atau aset dengan konteks lokasi memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.1, §8.1 langkah 1 |
| G-01 | F-02 | 4 | 3 | sedang | Upload bukti multimodal: foto memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.1 |
| G-01 | F-14 | 4 | 3 | sedang | Rekomendasi kategori dengan penjelasan dan skor keyakinan berambang memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.2, §3.2A, §8.1 langkah 4 |
| G-01 | F-13 | 3 | 3 | sedang | Ekstraksi field terstruktur: lokasi memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.2 |
| G-01 | F-03 | 3 | 3 | sedang | Transkripsi voice note dan audio memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.1 |
| G-01 | F-01 | 3 | 3 | sedang | Formulir web/PWA responsif memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.1 |
| G-01 | F-08 | 3 | 3 | sedang | Preview laporan sebelum dikirim dan simpan draft memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §8.1 langkah 6 |
| G-01 | F-06 | 3 | 3 | sedang | Kategori memberi kontribusi; hasil parent tetap membutuhkan lokasi, bukti, klarifikasi dan review bersama. | §7.1 |
| G-02 | F-47 | 5 | 4 | tinggi | Notifikasi ke pelapor: pembaruan status memberi kontribusi; hasil parent tetap membutuhkan event status, otorisasi pelapor dan pengiriman yang andal. | §7.7, §3.2D |
| G-02 | F-09 | 4 | 3 | sedang | Nomor tiket unik dan notifikasi penerimaan memberi kontribusi; hasil parent tetap membutuhkan event status, otorisasi pelapor dan pengiriman yang andal. | §7.1, §8.1 langkah 7 |
| G-02 | F-28 | 3 | 3 | sedang | State machine status tiket memberi kontribusi; hasil parent tetap membutuhkan event status, otorisasi pelapor dan pengiriman yang andal. | §7.4 |
| G-02 | F-31 | 3 | 3 | sedang | Catatan internal terpisah dari komentar yang terlihat pelapor memberi kontribusi; hasil parent tetap membutuhkan event status, otorisasi pelapor dan pengiriman yang andal. | §7.4 |
| G-02 | F-49 | 3 | 3 | sedang | Template notifikasi per organisasi memberi kontribusi; hasil parent tetap membutuhkan event status, otorisasi pelapor dan pengiriman yang andal. | §7.7 |
| G-03 | F-45 | 4 | 3 | sedang | Konfirmasi dan umpan balik pelapor memberi kontribusi; hasil parent tetap membutuhkan bukti lapangan, pemeriksaan supervisor dan jalur keberatan. | §7.6, §8.1 langkah 9 |
| G-03 | F-47 | 3 | 3 | sedang | Notifikasi ke pelapor: pembaruan status memberi kontribusi; hasil parent tetap membutuhkan bukti lapangan, pemeriksaan supervisor dan jalur keberatan. | §7.7 |
| G-03 | F-44 | 3 | 3 | sedang | Pemeriksaan supervisor memberi kontribusi; hasil parent tetap membutuhkan bukti lapangan, pemeriksaan supervisor dan jalur keberatan. | §7.6 |
| G-03 | F-34 | 3 | 3 | sedang | Reopen dengan alasan memberi kontribusi; hasil parent tetap membutuhkan bukti lapangan, pemeriksaan supervisor dan jalur keberatan. | §7.4 |
| G-04 | F-18 | 4 | 3 | sedang | Redaksi atau blur informasi pribadi pada gambar memberi kontribusi; hasil parent tetap membutuhkan minimisasi, akses, retensi dan tata kelola bersama. | §7.2, §3.2A |
| G-04 | F-63 | 4 | 3 | sedang | RBAC memberi kontribusi; hasil parent tetap membutuhkan minimisasi, akses, retensi dan tata kelola bersama. | §7.11 |
| G-04 | F-65 | 4 | 3 | sedang | Retensi dan penghapusan data memberi kontribusi; hasil parent tetap membutuhkan minimisasi, akses, retensi dan tata kelola bersama. | §7.11, §14.1 |
| G-04 | F-31 | 3 | 3 | sedang | Catatan internal terpisah dari komentar yang terlihat pelapor memberi kontribusi; hasil parent tetap membutuhkan minimisasi, akses, retensi dan tata kelola bersama. | §7.4 |
| G-05 | F-21 | 5 | 4 | tinggi | Kategori darurat yang memicu eskalasi manusia memberi kontribusi; hasil parent tetap membutuhkan panduan sebelum AI dan kontak/SOP organisasi. | §7.3, §8.5 |
| G-05 | F-23 | 3 | 3 | sedang | Eskalasi otomatis: tiket tidak diterima memberi kontribusi; hasil parent tetap membutuhkan panduan sebelum AI dan kontak/SOP organisasi. | §7.3 |
| G-06 | F-13 | 4 | 4 | sedang | Ekstraksi field terstruktur: lokasi memberi kontribusi; hasil parent tetap membutuhkan schema valid, kategori dan konfirmasi operator. | §7.2, §3.5 H1 |
| G-06 | F-12 | 4 | 3 | sedang | Ringkasan laporan memberi kontribusi; hasil parent tetap membutuhkan schema valid, kategori dan konfirmasi operator. | §7.2, §3.2A |
| G-06 | F-14 | 4 | 3 | sedang | Rekomendasi kategori dengan penjelasan dan skor keyakinan berambang memberi kontribusi; hasil parent tetap membutuhkan schema valid, kategori dan konfirmasi operator. | §7.2 |
| G-06 | F-03 | 3 | 3 | sedang | Transkripsi voice note dan audio memberi kontribusi; hasil parent tetap membutuhkan schema valid, kategori dan konfirmasi operator. | §3.2A |
| G-06 | F-26 | 3 | 3 | sedang | Antrean review untuk laporan berkeyakinan rendah memberi kontribusi; hasil parent tetap membutuhkan schema valid, kategori dan konfirmasi operator. | §7.3 |
| G-06 | F-19 | 3 | 3 | sedang | Feedback loop dari koreksi operator memberi kontribusi; hasil parent tetap membutuhkan schema valid, kategori dan konfirmasi operator. | §7.2, §15.2 |
| G-06 | F-07 | 3 | 3 | sedang | Pertanyaan lanjutan adaptif memberi kontribusi; hasil parent tetap membutuhkan schema valid, kategori dan konfirmasi operator. | §7.1 |
| G-07 | F-24 | 5 | 4 | tinggi | Deteksi duplikasi (lokasi memberi kontribusi; hasil parent tetap membutuhkan keputusan operator serta jejak laporan individual. | §7.3, §3.5 H2, §8.2 langkah 6 |
| G-08 | F-20 | 4 | 4 | sedang | Rule engine routing (kategori memberi kontribusi; hasil parent tetap membutuhkan kategori/kewenangan benar serta review penugasan. | §7.3 |
| G-08 | F-15 | 4 | 3 | sedang | Rekomendasi tim atau penanggung jawab berdasarkan aturan organisasi memberi kontribusi; hasil parent tetap membutuhkan kategori/kewenangan benar serta review penugasan. | §7.2 |
| G-08 | F-25 | 4 | 3 | sedang | Memulihkan salah routing; tidak membuktikan benar pada percobaan pertama. | §7.3, §15.2 |
| G-08 | F-14 | 3 | 3 | sedang | Rekomendasi kategori dengan penjelasan dan skor keyakinan berambang memberi kontribusi; hasil parent tetap membutuhkan kategori/kewenangan benar serta review penugasan. | §7.2 |
| G-08 | F-27 | 3 | 3 | sedang | Rekomendasi vendor berdasarkan kontrak dan area memberi kontribusi; hasil parent tetap membutuhkan kategori/kewenangan benar serta review penugasan. | §7.3 |
| G-08 | F-19 | 3 | 3 | sedang | Feedback loop dari koreksi operator memberi kontribusi; hasil parent tetap membutuhkan kategori/kewenangan benar serta review penugasan. | §7.2 |
| G-09 | F-20 | 4 | 3 | sedang | Rule engine routing (kategori memberi kontribusi; hasil parent tetap membutuhkan aturan dampak dan penilaian operator yang disetujui. | §7.3, §3.2B |
| G-09 | F-22 | 3 | 3 | sedang | SLA per kategori memberi kontribusi; hasil parent tetap membutuhkan aturan dampak dan penilaian operator yang disetujui. | §7.3 |
| G-09 | F-13 | 3 | 3 | sedang | Ekstraksi field terstruktur: lokasi memberi kontribusi; hasil parent tetap membutuhkan aturan dampak dan penilaian operator yang disetujui. | §7.2 |
| G-09 | F-21 | 3 | 3 | sedang | Kategori darurat yang memicu eskalasi manusia memberi kontribusi; hasil parent tetap membutuhkan aturan dampak dan penilaian operator yang disetujui. | §3.2B |
| G-10 | F-10 | 4 | 3 | sedang | Email intake dan impor laporan lama dari CSV memberi kontribusi; hasil parent tetap membutuhkan konektor setiap kanal serta rekonsiliasi identitas. | §7.1, §7.12 |
| G-10 | F-11 | 3 | 3 | sedang | Kanal WhatsApp Business memberi kontribusi; hasil parent tetap membutuhkan konektor setiap kanal serta rekonsiliasi identitas. | §7.1, §10.4 |
| G-10 | F-05 | 3 | 3 | sedang | QR code di ruangan atau aset dengan konteks lokasi memberi kontribusi; hasil parent tetap membutuhkan konektor setiap kanal serta rekonsiliasi identitas. | §7.1 |
| G-10 | F-01 | 3 | 3 | sedang | Formulir web/PWA responsif memberi kontribusi; hasil parent tetap membutuhkan konektor setiap kanal serta rekonsiliasi identitas. | §7.1 |
| G-10 | F-68 | 3 | 3 | sedang | Integrasi CMMS/CAFM/helpdesk dan registry aset eksternal memberi kontribusi; hasil parent tetap membutuhkan konektor setiap kanal serta rekonsiliasi identitas. | §7.12 |
| G-11 | F-37 | 5 | 3 | sedang | Konteks lokasi/aset dan instruksi keselamatan dari SOP di aplikasi petugas memberi kontribusi; hasil parent tetap membutuhkan ringkasan masalah serta konteks lokasi/aset yang lengkap. | §7.5 |
| G-11 | F-32 | 3 | 3 | sedang | Relasi tiket ke aset memberi kontribusi; hasil parent tetap membutuhkan ringkasan masalah serta konteks lokasi/aset yang lengkap. | §7.4 |
| G-11 | F-12 | 3 | 3 | sedang | Ringkasan laporan memberi kontribusi; hasil parent tetap membutuhkan ringkasan masalah serta konteks lokasi/aset yang lengkap. | §7.2 |
| G-11 | F-57 | 3 | 3 | sedang | Registry aset: ID memberi kontribusi; hasil parent tetap membutuhkan ringkasan masalah serta konteks lokasi/aset yang lengkap. | §7.9 |
| G-11 | F-36 | 3 | 3 | sedang | Daftar pekerjaan hari ini dan urutan kunjungan memberi kontribusi; hasil parent tetap membutuhkan ringkasan masalah serta konteks lokasi/aset yang lengkap. | §7.5 |
| G-12 | F-38 | 4 | 3 | sedang | Checklist dan foto sebelum/sesudah memberi kontribusi; hasil parent tetap membutuhkan UX input ringan dan persistensi/sinkronisasi. | §7.5 |
| G-12 | F-40 | 4 | 3 | sedang | Mode offline dengan sinkronisasi memberi kontribusi; hasil parent tetap membutuhkan UX input ringan dan persistensi/sinkronisasi. | §7.1, §7.5 |
| G-12 | F-39 | 3 | 3 | sedang | Status menunggu akses/material/vendor memberi kontribusi; hasil parent tetap membutuhkan UX input ringan dan persistensi/sinkronisasi. | §7.5 |
| G-12 | F-03 | 3 | 3 | sedang | Transkripsi voice note dan audio memberi kontribusi; hasil parent tetap membutuhkan UX input ringan dan persistensi/sinkronisasi. | §7.1 |
| G-12 | F-36 | 3 | 3 | sedang | Daftar pekerjaan hari ini dan urutan kunjungan memberi kontribusi; hasil parent tetap membutuhkan UX input ringan dan persistensi/sinkronisasi. | §7.5 |
| G-13 | F-61 | 4 | 3 | sedang | Assignment dan acceptance vendor memberi kontribusi; hasil parent tetap membutuhkan acceptance, bukti dan jalur kendala dalam satu alur. | §7.10 |
| G-13 | F-38 | 4 | 3 | sedang | Checklist dan foto sebelum/sesudah memberi kontribusi; hasil parent tetap membutuhkan acceptance, bukti dan jalur kendala dalam satu alur. | §7.5 |
| G-13 | F-39 | 3 | 3 | sedang | Status menunggu akses/material/vendor memberi kontribusi; hasil parent tetap membutuhkan acceptance, bukti dan jalur kendala dalam satu alur. | §7.5 |
| G-13 | F-30 | 3 | 3 | sedang | Checklist pekerjaan memberi kontribusi; hasil parent tetap membutuhkan acceptance, bukti dan jalur kendala dalam satu alur. | §7.4 |
| G-13 | F-42 | 3 | 3 | sedang | Checklist verifikasi per kategori memberi kontribusi; hasil parent tetap membutuhkan acceptance, bukti dan jalur kendala dalam satu alur. | §7.6 |
| G-14 | F-44 | 5 | 4 | tinggi | Pemeriksaan supervisor memberi kontribusi; hasil parent tetap membutuhkan checklist, bukti dan otorisasi supervisor. | §7.6, §8.4 |
| G-14 | F-42 | 4 | 3 | sedang | Checklist verifikasi per kategori memberi kontribusi; hasil parent tetap membutuhkan checklist, bukti dan otorisasi supervisor. | §7.6 |
| G-14 | F-43 | 3 | 3 | sedang | Perbandingan foto before/after dan deteksi objek yang sama memberi kontribusi; hasil parent tetap membutuhkan checklist, bukti dan otorisasi supervisor. | §7.6 |
| G-14 | F-46 | 3 | 3 | sedang | Sampling audit acak memberi kontribusi; hasil parent tetap membutuhkan checklist, bukti dan otorisasi supervisor. | §7.6 |
| G-14 | F-41 | 3 | 3 | sedang | Konfirmasi penanggung jawab lokasi dan sinyal lokasi/waktu memberi kontribusi; hasil parent tetap membutuhkan checklist, bukti dan otorisasi supervisor. | §7.5 |
| G-14 | F-38 | 3 | 3 | sedang | Checklist dan foto sebelum/sesudah memberi kontribusi; hasil parent tetap membutuhkan checklist, bukti dan otorisasi supervisor. | §7.5 |
| G-15 | F-33 | 5 | 4 | tinggi | Audit trail yang tidak dapat diubah pengguna biasa memberi kontribusi; hasil parent tetap membutuhkan cakupan event lengkap dan alasan perubahan wajib. | §7.4, §8.4 langkah 4 |
| G-15 | F-64 | 4 | 3 | sedang | Audit log untuk login memberi kontribusi; hasil parent tetap membutuhkan cakupan event lengkap dan alasan perubahan wajib. | §7.11 |
| G-15 | F-25 | 3 | 3 | sedang | Deteksi salah unit memberi kontribusi; hasil parent tetap membutuhkan cakupan event lengkap dan alasan perubahan wajib. | §7.3 |
| G-15 | F-46 | 3 | 3 | sedang | Sampling audit acak memberi kontribusi; hasil parent tetap membutuhkan cakupan event lengkap dan alasan perubahan wajib. | §7.6 |
| G-16 | F-29 | 5 | 3 | sedang | Penanggung jawab memberi kontribusi; hasil parent tetap membutuhkan penanggung jawab, kalender tenggat dan visibilitas backlog. | §7.4, §3.2C |
| G-16 | F-50 | 4 | 3 | sedang | Dashboard operasional: volume per kategori/lokasi memberi kontribusi; hasil parent tetap membutuhkan penanggung jawab, kalender tenggat dan visibilitas backlog. | §7.8 |
| G-16 | F-23 | 4 | 3 | sedang | Eskalasi otomatis: tiket tidak diterima memberi kontribusi; hasil parent tetap membutuhkan penanggung jawab, kalender tenggat dan visibilitas backlog. | §7.3 |
| G-16 | F-28 | 3 | 3 | sedang | State machine status tiket memberi kontribusi; hasil parent tetap membutuhkan penanggung jawab, kalender tenggat dan visibilitas backlog. | §7.4 |
| G-16 | F-48 | 3 | 3 | sedang | Notifikasi internal: penugasan dan peringatan SLA memberi kontribusi; hasil parent tetap membutuhkan penanggung jawab, kalender tenggat dan visibilitas backlog. | §7.7 |
| G-16 | F-35 | 3 | 3 | sedang | Bulk action supervisor memberi kontribusi; hasil parent tetap membutuhkan penanggung jawab, kalender tenggat dan visibilitas backlog. | §7.4 |
| G-16 | F-22 | 3 | 3 | sedang | SLA per kategori memberi kontribusi; hasil parent tetap membutuhkan penanggung jawab, kalender tenggat dan visibilitas backlog. | §7.3 |
| G-17 | F-53 | 5 | 3 | sedang | Kinerja vendor dengan konteks volume dan kesulitan memberi kontribusi; hasil parent tetap membutuhkan data sebanding, segmentasi tim/lokasi dan konteks vendor. | §7.8, §7.10, §4.2 Persona B |
| G-17 | F-51 | 4 | 3 | sedang | Metrik waktu dan SLA: time to triage memberi kontribusi; hasil parent tetap membutuhkan data sebanding, segmentasi tim/lokasi dan konteks vendor. | §7.8 |
| G-17 | F-52 | 4 | 3 | sedang | Metrik kualitas: reopen rate memberi kontribusi; hasil parent tetap membutuhkan data sebanding, segmentasi tim/lokasi dan konteks vendor. | §7.8 |
| G-17 | F-60 | 3 | 3 | sedang | Direktori vendor: wilayah memberi kontribusi; hasil parent tetap membutuhkan data sebanding, segmentasi tim/lokasi dan konteks vendor. | §7.10 |
| G-18 | F-59 | 4 | 3 | sedang | Analisis aset yang sering rusak memberi kontribusi; hasil parent tetap membutuhkan riwayat berkualitas dan keputusan jadwal inspeksi. | §7.9 |
| G-18 | F-54 | 4 | 3 | sedang | Tren kerusakan per aset memberi kontribusi; hasil parent tetap membutuhkan riwayat berkualitas dan keputusan jadwal inspeksi. | §7.8 |
| G-18 | F-58 | 4 | 3 | sedang | Preventive maintenance: jadwal inspeksi memberi kontribusi; hasil parent tetap membutuhkan riwayat berkualitas dan keputusan jadwal inspeksi. | §7.9 |
| G-18 | F-57 | 4 | 3 | sedang | Registry aset: ID memberi kontribusi; hasil parent tetap membutuhkan riwayat berkualitas dan keputusan jadwal inspeksi. | §7.9, §3.2E |
| G-18 | F-56 | 3 | 3 | sedang | Analisis biaya pemeliharaan memberi kontribusi; hasil parent tetap membutuhkan riwayat berkualitas dan keputusan jadwal inspeksi. | §7.8 |
| G-19 | F-55 | 5 | 4 | tinggi | Ekspor CSV/PDF dan laporan berkala otomatis memberi kontribusi; hasil parent tetap membutuhkan data sumber yang lengkap dan template laporan yang disepakati. | §7.8 |
| G-19 | F-50 | 3 | 3 | sedang | Dashboard operasional: volume per kategori/lokasi memberi kontribusi; hasil parent tetap membutuhkan data sumber yang lengkap dan template laporan yang disepakati. | §7.8 |
| G-19 | F-51 | 3 | 3 | sedang | Metrik waktu dan SLA: time to triage memberi kontribusi; hasil parent tetap membutuhkan data sumber yang lengkap dan template laporan yang disepakati. | §7.8 |
| G-20 | F-50 | 4 | 3 | sedang | Dashboard operasional: volume per kategori/lokasi memberi kontribusi; hasil parent tetap membutuhkan data biaya dan tautan bukti yang dapat diakses. | §7.8 |
| G-20 | F-52 | 4 | 3 | sedang | Metrik kualitas: reopen rate memberi kontribusi; hasil parent tetap membutuhkan data biaya dan tautan bukti yang dapat diakses. | §7.8 |
| G-20 | F-51 | 4 | 3 | sedang | Metrik waktu dan SLA: time to triage memberi kontribusi; hasil parent tetap membutuhkan data biaya dan tautan bukti yang dapat diakses. | §7.8 |
| G-20 | F-56 | 3 | 3 | sedang | Analisis biaya pemeliharaan memberi kontribusi; hasil parent tetap membutuhkan data biaya dan tautan bukti yang dapat diakses. | §7.8 |
| G-20 | F-55 | 3 | 3 | sedang | Ekspor CSV/PDF dan laporan berkala otomatis memberi kontribusi; hasil parent tetap membutuhkan data biaya dan tautan bukti yang dapat diakses. | §7.8 |
| G-21 | F-51 | 3 | 3 | sedang | Metrik waktu dan SLA: time to triage memberi kontribusi; hasil parent tetap membutuhkan baseline, waktu aktif, biaya dan keputusan pembeli. | §7.8, §15.3 |
| G-21 | F-52 | 3 | 3 | sedang | Metrik kualitas: reopen rate memberi kontribusi; hasil parent tetap membutuhkan baseline, waktu aktif, biaya dan keputusan pembeli. | §7.8 |
| G-21 | F-54 | 3 | 3 | sedang | Tren kerusakan per aset memberi kontribusi; hasil parent tetap membutuhkan baseline, waktu aktif, biaya dan keputusan pembeli. | §7.8 |
| G-21 | F-55 | 3 | 3 | sedang | Ekspor CSV/PDF dan laporan berkala otomatis memberi kontribusi; hasil parent tetap membutuhkan baseline, waktu aktif, biaya dan keputusan pembeli. | §7.8 |
| G-22 | F-63 | 5 | 3 | sedang | RBAC memberi kontribusi; hasil parent tetap membutuhkan kontrol teknis, hosting, kontrak dan persetujuan owner. | §7.11 |
| G-22 | F-64 | 5 | 3 | sedang | Audit log untuk login memberi kontribusi; hasil parent tetap membutuhkan kontrol teknis, hosting, kontrak dan persetujuan owner. | §7.11 |
| G-22 | F-65 | 5 | 3 | sedang | Retensi dan penghapusan data memberi kontribusi; hasil parent tetap membutuhkan kontrol teknis, hosting, kontrak dan persetujuan owner. | §7.11, §14.5 |
| G-22 | F-66 | 4 | 3 | sedang | Multi-tenant memberi kontribusi; hasil parent tetap membutuhkan kontrol teknis, hosting, kontrak dan persetujuan owner. | §7.11 |
| G-24 | F-16 | 3 | 3 | sedang | Rujukan ke SOP dan checklist internal memberi kontribusi; hasil parent tetap membutuhkan konfigurasi SOP, pelatihan dan pengamatan beban kerja. | §7.2 |
| G-24 | F-20 | 3 | 3 | sedang | Rule engine routing (kategori memberi kontribusi; hasil parent tetap membutuhkan konfigurasi SOP, pelatihan dan pengamatan beban kerja. | §7.3 |
| G-24 | F-49 | 3 | 3 | sedang | Template notifikasi per organisasi memberi kontribusi; hasil parent tetap membutuhkan konfigurasi SOP, pelatihan dan pengamatan beban kerja. | §7.7 |
| G-24 | F-10 | 3 | 3 | sedang | Email intake dan impor laporan lama dari CSV memberi kontribusi; hasil parent tetap membutuhkan konfigurasi SOP, pelatihan dan pengamatan beban kerja. | §7.1 |
| G-24 | F-68 | 3 | 3 | sedang | Integrasi CMMS/CAFM/helpdesk dan registry aset eksternal memberi kontribusi; hasil parent tetap membutuhkan konfigurasi SOP, pelatihan dan pengamatan beban kerja. | §7.12 |
| G-25 | F-62 | 5 | 3 | sedang | Kebijakan produk: tanpa auto-blacklisting memberi kontribusi; hasil parent tetap membutuhkan kebijakan penilaian, migrasi dan beban input terukur. | §7.10, §7.6 |
| G-25 | F-10 | 3 | 3 | sedang | Email intake dan impor laporan lama dari CSV memberi kontribusi; hasil parent tetap membutuhkan kebijakan penilaian, migrasi dan beban input terukur. | §7.1 |
| G-25 | F-61 | 3 | 3 | sedang | Assignment dan acceptance vendor memberi kontribusi; hasil parent tetap membutuhkan kebijakan penilaian, migrasi dan beban input terukur. | §7.10 |
| G-26 | F-14 | 4 | 3 | sedang | Rekomendasi kategori dengan penjelasan dan skor keyakinan berambang memberi kontribusi; hasil parent tetap membutuhkan aturan kewenangan, konektor dan dashboard backlog. | §7.2, §4.2 Persona C |
| G-26 | F-12 | 4 | 3 | sedang | Ringkasan laporan memberi kontribusi; hasil parent tetap membutuhkan aturan kewenangan, konektor dan dashboard backlog. | §7.2 |
| G-26 | F-24 | 4 | 3 | sedang | Deteksi duplikasi (lokasi memberi kontribusi; hasil parent tetap membutuhkan aturan kewenangan, konektor dan dashboard backlog. | §7.3 |
| G-26 | F-50 | 4 | 3 | sedang | Dashboard operasional: volume per kategori/lokasi memberi kontribusi; hasil parent tetap membutuhkan aturan kewenangan, konektor dan dashboard backlog. | §7.8 |
| G-26 | F-15 | 3 | 3 | sedang | Rekomendasi tim atau penanggung jawab berdasarkan aturan organisasi memberi kontribusi; hasil parent tetap membutuhkan aturan kewenangan, konektor dan dashboard backlog. | §7.2, §5.2 |
| G-27 | F-69 | 3 | 3 | sedang | Integrasi sistem aduan resmi dan adapter Open311 memberi kontribusi; hasil parent tetap membutuhkan otorisasi, kontrak data dan rekonsiliasi serah terima. | §7.12, §20.4 |
| G-27 | F-55 | 3 | 3 | sedang | Ekspor CSV/PDF dan laporan berkala otomatis memberi kontribusi; hasil parent tetap membutuhkan otorisasi, kontrak data dan rekonsiliasi serah terima. | §1, §7.8 |
| G-27 | F-67 | 3 | 3 | sedang | REST API dan webhooks memberi kontribusi; hasil parent tetap membutuhkan otorisasi, kontrak data dan rekonsiliasi serah terima. | §7.12 |

## Hubungan pendukung skor 2

| Goal | Fitur | Skor | Keyakinan | Alasan | Bukti |
| --- | --- | --- | --- | --- | --- |
| G-06 | F-17 | 2 | sedang | Antrean tidak dibanjiri spam; tidak membuat laporan menjadi tiket | §7.2/§7.3/§7.11 |
| G-22 | F-70 | 2 | sedang | Izin tool perlu diaudit tetapi bukan persetujuan hosting/data | §10.5 |
| G-20 | F-71 | 2 | sedang | Mengambil data biaya di sistem lain bila akses tersedia | §7.12 |
| G-14 | F-28 | 2 | sedang | State machine mencegah lompatan status tetapi tidak memeriksa bukti sendiri | §11.4 |
| G-21 | F-33 | 2 | sedang | Event menjadi waktu proses, bukan ukuran kerja aktif operator | §7.4/§15.2 |
| G-04 | F-66 | 2 | sedang | Enkripsi/isolasi menopang privasi; tidak menetapkan tujuan pemrosesan | §7.11/§14 |

## Tambahan dan pengamanan yang harus terlihat

N-01 adalah desain baru untuk menutup loop status. N-02/N-03/N-04/N-06 terutama proses dan artefak operasional. N-05 mengangkat butir keamanan yang sudah ada di OR-01 §7.11 tetapi kurang tampak dalam 71 unit OR-02; bukan seluruhnya fitur baru.

| ID | Kemampuan/proses | Goal | Tahap |
| --- | --- | --- | --- |
| N-01 | Tautan status token acak, minim data dan dapat dicabut | G-02/G-04 | Demo |
| N-02 | Instrumen baseline, upaya aktif dan biaya; boleh spreadsheet terkendali | G-21/G-24 | Before pilot |
| N-03 | Paket penawaran, scope, kontrak dan kelayakan vendor | G-23/G-21 | Commercial |
| N-04 | Review hosting/subprosesor dan persetujuan pemilik data | G-22c | Before real data |
| N-05 | Kontrol credential/service account, file scanning, incident response dan akses support | G-22e/G-04 | Before real data |
| N-06 | Konfigurasi SOP, pelatihan dan rekonsiliasi integrasi | G-24/G-25/G-27 | Pilot |

## Cakupan per goal

| Goal | Skor parent tertinggi | Pasangan asal dinilai | Tindakan |
| --- | --- | --- | --- |
| G-01 | 3 | 10 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-02 | 4 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-03 | 3 | 4 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-04 | 3 | 4 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-05 | 4 | 2 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-06 | 4 | 7 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-07 | 4 | 1 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-08 | 4 | 6 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-09 | 3 | 4 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-10 | 3 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-11 | 3 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-12 | 3 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-13 | 3 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-14 | 4 | 6 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-15 | 4 | 4 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-16 | 3 | 7 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-17 | 3 | 4 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-18 | 3 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-19 | 4 | 3 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-20 | 3 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-21 | 3 | 4 | N-02/N-03: baseline dan penawaran nyata |
| G-22 | 3 | 4 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-23 | 0 | 0 | N-03: proses komersial, bukan gap fitur |
| G-24 | 3 | 5 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-25 | 3 | 3 | Rantai spesifikasi perlu dilengkapi dan diuji |
| G-26 | 3 | 5 | Tunda dari ICP awal; otorisasi wajib |
| G-27 | 3 | 3 | Tunda dari ICP awal; otorisasi wajib |

## Kesimpulan dan self-review

Matriks kini mencantumkan confidence, perubahan skor, bukti dan batas rantai. Tidak ada skor 5 untuk parent gabungan; hasil sempit dinilai pada child goal dan acceptance test. Tidak diterbitkan persentase kesehatan baru karena spesifikasi belum merupakan hasil pengguna. F-17 tetap kontrol operasional/keamanan; F-70 ditunda sampai ada kebutuhan agent eksternal; F-71 ditunda kecuali buyer membutuhkan rekonsiliasi biaya. Ketiganya tidak otomatis dihapus karena skor pengguna rendah.

G-23 memperoleh penanganan N-03 meskipun tidak ada baris fitur asal. Semua 71 unit diperiksa melalui katalog dan crosswalk; beberapa butir keamanan dipulihkan sebagai N-05. Seluruh 121 pasangan ditinjau sekali dengan aturan hasil lengkap, lalu diperiksa ulang untuk konsistensi broad-goal. Pemeriksaan ini tidak mengklaim tiga putaran stabil atau evaluasi independen yang tidak dilakukan.

Lihat [source-feature-crosswalk](source-feature-crosswalk.md) untuk semua 210 butir asli, [product-requirements](product-requirements.md) untuk acceptance criteria, dan [mvp-and-release-scope](mvp-and-release-scope.md) untuk irisan tahap. Skor bukan pengganti keputusan readiness.
