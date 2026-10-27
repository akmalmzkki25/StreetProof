# Crosswalk of the 210 source feature bullets

Document ID: PRD-03A  
Date: 2026-10-20  
Status: Proposed for review; not implemented  
[Versi Indonesia](../../id/03-product/source-feature-crosswalk.md)

## Complete provenance

Each row represents one OR-01 §7 bullet in original order. Source wording remains Indonesian in both versions for audit, with the English capability name providing its counterpart. Grouping is author interpretation: a destination unit can contain several capabilities and linkage does not make the whole unit mandatory. Prohibitions map to policy units; security bullets omitted from OR-02's catalog map to N-05.

Source codes use section and bullet ordinal rather than mutable file line numbers. All 210 bullets have destinations. F-57/F-60 and other broad units include fields not always visible in the shortened catalog name. Build from the source bullet and PRD rather than the unit heading alone.

## Crosswalk

| Source code | Original OR-01 wording | Destination unit | Capability counterpart |
| --- | --- | --- | --- |
| OR-01:7.1:01 | Formulir web responsif. | F-01 | Responsive web/PWA, accessibility and Indonesian |
| OR-01:7.1:02 | PWA/mobile-friendly untuk pelapor dan petugas. | F-01 | Responsive web/PWA, accessibility and Indonesian |
| OR-01:7.1:03 | Upload foto, beberapa foto, video pendek, dan voice note. | F-02 | Multimodal evidence upload |
| OR-01:7.1:04 | Transkripsi voice note. | F-03 | Voice/audio transcription |
| OR-01:7.1:05 | Teks bebas dan template laporan. | F-06 | Categories and report templates |
| OR-01:7.1:06 | Lokasi GPS dengan izin pengguna. | F-04 | Manual/GPS location and building/room selection |
| OR-01:7.1:07 | Pencarian alamat atau penanda lokasi manual. | F-04 | Manual/GPS location and building/room selection |
| OR-01:7.1:08 | Pilih gedung, lantai, ruangan, aset, atau area. | F-04 | Manual/GPS location and building/room selection |
| OR-01:7.1:09 | Waktu kejadian dan waktu pelaporan. | F-13 | Structured field extraction |
| OR-01:7.1:10 | Kategori dan subkategori. | F-06 | Categories and report templates |
| OR-01:7.1:11 | Pertanyaan lanjutan adaptif berdasarkan kategori. | F-07 | Adaptive clarification and missing-field detection |
| OR-01:7.1:12 | Deteksi informasi yang belum lengkap. | F-07 | Adaptive clarification and missing-field detection |
| OR-01:7.1:13 | Preview laporan sebelum dikirim. | F-08 | Preview and saved drafts |
| OR-01:7.1:14 | Simpan draft dan lanjutkan nanti. | F-08 | Preview and saved drafts |
| OR-01:7.1:15 | Nomor tiket unik. | F-09 | Ticket reference and receipt |
| OR-01:7.1:16 | Notifikasi penerimaan. | F-09 | Ticket reference and receipt |
| OR-01:7.1:17 | Bahasa Indonesia; kemungkinan bahasa daerah di masa depan. | F-01 | Responsive web/PWA, accessibility and Indonesian |
| OR-01:7.1:18 | Mode aksesibilitas dan input sederhana. | F-01 | Responsive web/PWA, accessibility and Indonesian |
| OR-01:7.1:19 | Mode koneksi lemah/offline untuk petugas. | F-40 | Offline drafts and synchronization |
| OR-01:7.1:20 | Kanal WhatsApp sebagai kemungkinan integrasi, setelah aturan platform dan izin dipenuhi. | F-11 | WhatsApp Business channel |
| OR-01:7.1:21 | Email intake untuk organisasi yang sudah memakai helpdesk. | F-10 | Email intake and historical CSV import |
| OR-01:7.1:22 | QR code di ruangan/aset untuk membuka formulir dengan konteks lokasi. | F-05 | Asset/room QR context |
| OR-01:7.1:23 | Impor laporan lama dari CSV setelah data dibersihkan dan diizinkan. | F-10 | Email intake and historical CSV import |
| OR-01:7.2:01 | OCR teks pada foto jika relevan. | F-12 | Visual summary, captioning and OCR |
| OR-01:7.2:02 | Image captioning untuk merangkum bukti visual. | F-12 | Visual summary, captioning and OCR |
| OR-01:7.2:03 | Klasifikasi jenis kerusakan. | F-14 | Category suggestion, explanation and confidence |
| OR-01:7.2:04 | Ekstraksi lokasi/nomor aset dari teks yang disediakan. | F-13 | Structured field extraction |
| OR-01:7.2:05 | Transkripsi audio. | F-03 | Voice/audio transcription |
| OR-01:7.2:06 | Ringkasan laporan. | F-12 | Visual summary, captioning and OCR |
| OR-01:7.2:07 | Ekstraksi field terstruktur: lokasi, jenis masalah, dampak, aset, waktu, tindakan yang diminta. | F-13 | Structured field extraction |
| OR-01:7.2:08 | Deteksi laporan yang tidak jelas. | F-07 | Adaptive clarification and missing-field detection |
| OR-01:7.2:09 | Pertanyaan klarifikasi otomatis. | F-07 | Adaptive clarification and missing-field detection |
| OR-01:7.2:10 | Rekomendasi kategori. | F-14 | Category suggestion, explanation and confidence |
| OR-01:7.2:11 | Rekomendasi tim/penanggung jawab berdasarkan aturan organisasi. | F-15 | Organization-based team suggestion |
| OR-01:7.2:12 | Skor keyakinan dengan ambang yang dapat dikonfigurasi. | F-14 | Category suggestion, explanation and confidence |
| OR-01:7.2:13 | Rujukan ke SOP dan checklist internal. | F-16 | Approved SOP/checklist retrieval |
| OR-01:7.2:14 | Deteksi bahasa kasar atau konten yang tidak relevan untuk moderasi antrean---bukan untuk menolak aduan secara otomatis. | F-17 | Queue moderation, anti-spam and rate limits |
| OR-01:7.2:15 | Redaksi/blur informasi pribadi pada gambar sebagai bantuan, dengan opsi pemeriksaan manual. | F-18 | Image personal-data redaction with human review |
| OR-01:7.2:16 | Penjelasan mengapa kategori tertentu disarankan. | F-14 | Category suggestion, explanation and confidence |
| OR-01:7.2:17 | Feedback loop dari koreksi operator. | F-19 | Operator correction feedback |
| OR-01:7.3:01 | Rule engine berbasis kategori, lokasi, aset, jam kerja, dan tim. | F-20 | Routing rules, manual assignment and capacity |
| OR-01:7.3:02 | Daftar kategori darurat yang memicu eskalasi manusia segera. | F-21 | Emergency category escalation and early guidance |
| OR-01:7.3:03 | SLA per kategori. | F-22 | Category SLA and service calendars |
| OR-01:7.3:04 | Jam operasional dan kalender hari libur. | F-22 | Category SLA and service calendars |
| OR-01:7.3:05 | Penugasan manual dan otomatis berbasis aturan. | F-20 | Routing rules, manual assignment and capacity |
| OR-01:7.3:06 | Rotasi tim atau area. | F-20 | Routing rules, manual assignment and capacity |
| OR-01:7.3:07 | Batas kapasitas teknisi. | F-20 | Routing rules, manual assignment and capacity |
| OR-01:7.3:08 | Eskalasi jika tiket tidak diterima. | F-23 | Escalation for unaccepted/late tickets or failed messages |
| OR-01:7.3:09 | Eskalasi jika SLA mendekati batas. | F-23 | Escalation for unaccepted/late tickets or failed messages |
| OR-01:7.3:10 | Rekomendasi vendor berdasarkan kontrak/area---bukan keputusan pengadaan otomatis. | F-27 | Contract/area-based vendor suggestion |
| OR-01:7.3:11 | Riwayat routing. | F-25 | Wrong-team detection and reasoned reassignment |
| OR-01:7.3:12 | Reassignment dengan alasan. | F-25 | Wrong-team detection and reasoned reassignment |
| OR-01:7.3:13 | Deteksi kemungkinan salah unit. | F-25 | Wrong-team detection and reasoned reassignment |
| OR-01:7.3:14 | Antrian review untuk laporan dengan keyakinan rendah. | F-26 | Low-confidence review queue |
| OR-01:7.3:15 | Kebijakan anti-spam dan rate limiting. | F-17 | Queue moderation, anti-spam and rate limits |
| OR-01:7.3:16 | Deteksi duplikasi berbasis lokasi, waktu, kategori, dan kemiripan semantik. | F-24 | Duplicate candidates and retained report links |
| OR-01:7.3:17 | Kelompokkan beberapa laporan yang merujuk pada satu insiden tanpa menghilangkan pelapor dan bukti individual. | F-24 | Duplicate candidates and retained report links |
| OR-01:7.4:01 | Status: draft, masuk, perlu klarifikasi, terverifikasi, ditugaskan, diterima, dikerjakan, menunggu material, menunggu akses, selesai diajukan, diverifikasi, ditutup, dibuka kembali, ditolak dengan alasan. | F-28 | Validated ticket state machine |
| OR-01:7.4:02 | Penanggung jawab dan tim. | F-29 | Owner, team, priority and due information |
| OR-01:7.4:03 | Prioritas dan SLA. | F-29 | Owner, team, priority and due information |
| OR-01:7.4:04 | Checklist pekerjaan. | F-30 | Checklist, subtasks, material and scope changes |
| OR-01:7.4:05 | Catatan internal. | F-31 | Internal notes and reporter-visible comments |
| OR-01:7.4:06 | Komentar yang terlihat oleh pelapor. | F-31 | Internal notes and reporter-visible comments |
| OR-01:7.4:07 | Lampiran dokumen. | F-31 | Internal notes and reporter-visible comments |
| OR-01:7.4:08 | Riwayat aktivitas. | F-33 | Append-only ticket event history |
| OR-01:7.4:09 | Subtask dan dependensi. | F-30 | Checklist, subtasks, material and scope changes |
| OR-01:7.4:10 | Hubungkan tiket ke aset. | F-32 | Ticket links to assets, locations and vendors |
| OR-01:7.4:11 | Hubungkan tiket ke lokasi. | F-32 | Ticket links to assets, locations and vendors |
| OR-01:7.4:12 | Hubungkan tiket dengan laporan duplikat. | F-24 | Duplicate candidates and retained report links |
| OR-01:7.4:13 | Hubungkan tiket ke kontrak/vendor. | F-32 | Ticket links to assets, locations and vendors |
| OR-01:7.4:14 | Perkiraan waktu pengerjaan. | F-29 | Owner, team, priority and due information |
| OR-01:7.4:15 | Catatan material/suku cadang. | F-30 | Checklist, subtasks, material and scope changes |
| OR-01:7.4:16 | Pengajuan perubahan scope. | F-30 | Checklist, subtasks, material and scope changes |
| OR-01:7.4:17 | Reopen dan alasan pembukaan kembali. | F-34 | Reasoned reopen |
| OR-01:7.4:18 | Audit trail yang tidak dapat diubah oleh pengguna biasa. | F-33 | Append-only ticket event history |
| OR-01:7.4:19 | Bulk action untuk supervisor. | F-35 | Search, filtering and supervisor bulk actions |
| OR-01:7.4:20 | Pencarian, filter, dan saved views. | F-35 | Search, filtering and supervisor bulk actions |
| OR-01:7.5:01 | Daftar pekerjaan hari ini. | F-36 | Daily jobs and visit ordering |
| OR-01:7.5:02 | Peta rute atau daftar urutan kunjungan. | F-36 | Daily jobs and visit ordering |
| OR-01:7.5:03 | Informasi lokasi/aset. | F-37 | Field location/asset context and approved safety notes |
| OR-01:7.5:04 | Instruksi keselamatan dari SOP yang disetujui. | F-37 | Field location/asset context and approved safety notes |
| OR-01:7.5:05 | Checklist sebelum/sesudah. | F-38 | Field checklist, before/after evidence and work notes |
| OR-01:7.5:06 | Foto sebelum/sesudah. | F-38 | Field checklist, before/after evidence and work notes |
| OR-01:7.5:07 | Catatan suara atau teks. | F-38 | Field checklist, before/after evidence and work notes |
| OR-01:7.5:08 | Waktu mulai dan selesai. | F-38 | Field checklist, before/after evidence and work notes |
| OR-01:7.5:09 | Status menunggu akses/material/vendor. | F-39 | Waiting/blocker states and supervisor assistance |
| OR-01:7.5:10 | Tanda tangan/konfirmasi dari penanggung jawab lokasi jika sesuai. | F-41 | Site representative confirmation and time/location signals |
| OR-01:7.5:11 | Mode offline dengan sinkronisasi. | F-40 | Offline drafts and synchronization |
| OR-01:7.5:12 | Bukti lokasi/waktu sebagai sinyal tambahan, bukan bukti mutlak. | F-41 | Site representative confirmation and time/location signals |
| OR-01:7.5:13 | Pelaporan pekerjaan tidak dapat dilakukan dan alasannya. | F-39 | Waiting/blocker states and supervisor assistance |
| OR-01:7.5:14 | Permintaan bantuan supervisor. | F-39 | Waiting/blocker states and supervisor assistance |
| OR-01:7.5:15 | Daftar pekerjaan yang perlu diperiksa ulang. | F-36 | Daily jobs and visit ordering |
| OR-01:7.6:01 | Checklist berdasarkan kategori. | F-42 | Category verification checklist and required proof |
| OR-01:7.6:02 | Perbandingan foto sebelum dan sesudah. | F-43 | Before/after comparison assistance |
| OR-01:7.6:03 | Deteksi apakah foto after tampaknya berasal dari lokasi/objek yang sama---hanya sebagai bantuan, bukan keputusan final. | F-43 | Before/after comparison assistance |
| OR-01:7.6:04 | Validasi bahwa foto after tersedia. | F-42 | Category verification checklist and required proof |
| OR-01:7.6:05 | Wajibkan catatan jika bukti tidak dapat diberikan. | F-42 | Category verification checklist and required proof |
| OR-01:7.6:06 | Pemeriksaan supervisor untuk kategori berisiko tinggi. | F-44 | Supervisor review and separate claimed/verified completion |
| OR-01:7.6:07 | Konfirmasi pelapor jika proses dan kebijakan organisasi mengizinkan. | F-45 | Reporter confirmation and feedback |
| OR-01:7.6:08 | Reopen ticket dengan alasan. | F-34 | Reasoned reopen |
| OR-01:7.6:09 | Sampling audit acak. | F-46 | Audit sampling and suspicious-evidence review |
| OR-01:7.6:10 | Deteksi pola bukti berulang yang mencurigakan untuk review manusia. | F-46 | Audit sampling and suspicious-evidence review |
| OR-01:7.6:11 | Riwayat koreksi dan verifikasi. | F-46 | Audit sampling and suspicious-evidence review |
| OR-01:7.6:12 | Pisahkan "pekerjaan dilaporkan selesai" dari "pekerjaan diverifikasi selesai". | F-44 | Supervisor review and separate claimed/verified completion |
| OR-01:7.6:13 | Jangan menggunakan pengenalan wajah atau biometrik untuk mengesahkan petugas. | F-62 | No automatic AI penalties, blacklisting or biometrics |
| OR-01:7.7:01 | Konfirmasi penerimaan. | F-09 | Ticket reference and receipt |
| OR-01:7.7:02 | Permintaan klarifikasi. | F-07 | Adaptive clarification and missing-field detection |
| OR-01:7.7:03 | Pembaruan status. | F-47 | Reporter lifecycle notifications |
| OR-01:7.7:04 | Pemberitahuan penugasan jika sesuai. | F-48 | Internal assignment/SLA notifications |
| OR-01:7.7:05 | Peringatan SLA. | F-48 | Internal assignment/SLA notifications |
| OR-01:7.7:06 | Notifikasi pekerjaan selesai diajukan. | F-47 | Reporter lifecycle notifications |
| OR-01:7.7:07 | Notifikasi hasil verifikasi. | F-47 | Reporter lifecycle notifications |
| OR-01:7.7:08 | Pemberitahuan pembukaan kembali. | F-47 | Reporter lifecycle notifications |
| OR-01:7.7:09 | Email, in-app, atau kanal pesan yang disetujui. | F-47 | Reporter lifecycle notifications |
| OR-01:7.7:10 | Template per organisasi. | F-49 | Notification templates, frequency and history |
| OR-01:7.7:11 | Riwayat notifikasi. | F-49 | Notification templates, frequency and history |
| OR-01:7.7:12 | Pengaturan frekuensi. | F-49 | Notification templates, frequency and history |
| OR-01:7.7:13 | Eskalasi jika notifikasi gagal. | F-23 | Escalation for unaccepted/late tickets or failed messages |
| OR-01:7.7:14 | Bahasa yang mudah dipahami. | F-49 | Notification templates, frequency and history |
| OR-01:7.7:15 | Jangan menjanjikan tenggat penyelesaian jika belum disepakati tim operasional. | F-49 | Notification templates, frequency and history |
| OR-01:7.8:01 | Volume tiket per kategori. | F-50 | Operational queue, backlog and workload dashboard |
| OR-01:7.8:02 | Volume per lokasi/gedung/area. | F-50 | Operational queue, backlog and workload dashboard |
| OR-01:7.8:03 | Backlog saat ini. | F-50 | Operational queue, backlog and workload dashboard |
| OR-01:7.8:04 | Umur tiket. | F-50 | Operational queue, backlog and workload dashboard |
| OR-01:7.8:05 | Waktu ke triase. | F-51 | Elapsed-time and SLA metrics |
| OR-01:7.8:06 | Waktu ke penugasan. | F-51 | Elapsed-time and SLA metrics |
| OR-01:7.8:07 | Waktu ke respons pertama. | F-51 | Elapsed-time and SLA metrics |
| OR-01:7.8:08 | Waktu ke penyelesaian. | F-51 | Elapsed-time and SLA metrics |
| OR-01:7.8:09 | Kepatuhan SLA. | F-51 | Elapsed-time and SLA metrics |
| OR-01:7.8:10 | Persentase tiket dibuka kembali. | F-52 | Evidence completeness, reopen and duplicate metrics |
| OR-01:7.8:11 | Persentase tiket dengan bukti lengkap. | F-52 | Evidence completeness, reopen and duplicate metrics |
| OR-01:7.8:12 | Rasio laporan duplikat yang terkonfirmasi. | F-52 | Evidence completeness, reopen and duplicate metrics |
| OR-01:7.8:13 | Beban kerja per tim. | F-50 | Operational queue, backlog and workload dashboard |
| OR-01:7.8:14 | Kinerja vendor dengan konteks volume dan tingkat kesulitan. | F-53 | Contextual vendor-performance comparison |
| OR-01:7.8:15 | Tren kerusakan per aset. | F-54 | Asset/location trends and period comparisons |
| OR-01:7.8:16 | Peta heatmap agregat. | F-54 | Asset/location trends and period comparisons |
| OR-01:7.8:17 | Perbandingan periode. | F-54 | Asset/location trends and period comparisons |
| OR-01:7.8:18 | Filter berdasarkan lokasi/kategori/prioritas. | F-35 | Search, filtering and supervisor bulk actions |
| OR-01:7.8:19 | Export CSV/PDF. | F-55 | CSV/PDF export and scheduled reports |
| OR-01:7.8:20 | Laporan berkala otomatis. | F-55 | CSV/PDF export and scheduled reports |
| OR-01:7.8:21 | Analisis biaya pemeliharaan bila data biaya tersedia. | F-56 | Conditional cost and root-cause analytics |
| OR-01:7.8:22 | Analisis akar masalah hanya sebagai hipotesis yang perlu diperiksa. | F-56 | Conditional cost and root-cause analytics |
| OR-01:7.8:23 | Prediksi kebutuhan pemeliharaan hanya setelah dataset cukup dan dievaluasi. | F-56 | Conditional cost and root-cause analytics |
| OR-01:7.8:24 | Catatan kualitas dan kelengkapan data. | F-52 | Evidence completeness, reopen and duplicate metrics |
| OR-01:7.9:01 | Daftar aset. | F-57 | Asset register and maintenance history |
| OR-01:7.9:02 | ID aset dan QR code. | F-57 | Asset register and maintenance history |
| OR-01:7.9:03 | Lokasi dan metadata aset. | F-57 | Asset register and maintenance history |
| OR-01:7.9:04 | Produsen/model/tanggal instalasi bila tersedia. | F-57 | Asset register and maintenance history |
| OR-01:7.9:05 | Riwayat kerusakan. | F-57 | Asset register and maintenance history |
| OR-01:7.9:06 | Riwayat pekerjaan. | F-57 | Asset register and maintenance history |
| OR-01:7.9:07 | Kontrak pemeliharaan. | F-57 | Asset register and maintenance history |
| OR-01:7.9:08 | Garansi dan tanggal kedaluwarsa. | F-57 | Asset register and maintenance history |
| OR-01:7.9:09 | Jadwal inspeksi berkala. | F-58 | Preventive inspection schedule and reminders |
| OR-01:7.9:10 | Checklist inspeksi. | F-58 | Preventive inspection schedule and reminders |
| OR-01:7.9:11 | Pengingat pemeliharaan. | F-58 | Preventive inspection schedule and reminders |
| OR-01:7.9:12 | Hubungkan aset ke vendor dan SOP. | F-57 | Asset register and maintenance history |
| OR-01:7.9:13 | Analisis aset yang sering rusak. | F-59 | Repeatedly failing asset analysis |
| OR-01:7.9:14 | Import/export data aset. | F-57 | Asset register and maintenance history |
| OR-01:7.9:15 | Integrasi dengan CMMS/CAFM jika dimiliki organisasi. | F-68 | Customer CMMS/helpdesk/asset-system integration |
| OR-01:7.9:16 | Jangan mengklaim predictive maintenance sebelum data historis dan hasil evaluasi memadai. | F-56 | Conditional cost and root-cause analytics |
| OR-01:7.10:01 | Direktori vendor. | F-60 | Vendor directory, contracts and service coverage |
| OR-01:7.10:02 | Wilayah layanan. | F-60 | Vendor directory, contracts and service coverage |
| OR-01:7.10:03 | Jenis pekerjaan. | F-60 | Vendor directory, contracts and service coverage |
| OR-01:7.10:04 | Kontak operasional. | F-60 | Vendor directory, contracts and service coverage |
| OR-01:7.10:05 | Kontrak dan tanggal berlaku. | F-60 | Vendor directory, contracts and service coverage |
| OR-01:7.10:06 | SLA kontraktual. | F-60 | Vendor directory, contracts and service coverage |
| OR-01:7.10:07 | Assignment dan acceptance. | F-61 | Vendor acceptance, disputes and supervisor approval |
| OR-01:7.10:08 | Bukti kerja. | F-38 | Field checklist, before/after evidence and work notes |
| OR-01:7.10:09 | Waktu respons. | F-53 | Contextual vendor-performance comparison |
| OR-01:7.10:10 | Pekerjaan ulang. | F-53 | Contextual vendor-performance comparison |
| OR-01:7.10:11 | Catatan kualitas. | F-53 | Contextual vendor-performance comparison |
| OR-01:7.10:12 | Dispute workflow. | F-61 | Vendor acceptance, disputes and supervisor approval |
| OR-01:7.10:13 | Approval supervisor. | F-61 | Vendor acceptance, disputes and supervisor approval |
| OR-01:7.10:14 | Ringkasan performa berbasis data. | F-53 | Contextual vendor-performance comparison |
| OR-01:7.10:15 | Ekspor laporan untuk evaluasi vendor. | F-53 | Contextual vendor-performance comparison |
| OR-01:7.10:16 | Tidak ada auto-blacklisting atau penalti otomatis dari skor AI. | F-62 | No automatic AI penalties, blacklisting or biometrics |
| OR-01:7.11:01 | Multi-tenant architecture. | F-66 | Tenant isolation, encryption, backup and security assurance |
| OR-01:7.11:02 | Role-based access control. | F-63 | RBAC, scoped access, SSO and admin MFA |
| OR-01:7.11:03 | Scope akses berdasarkan organisasi, lokasi, tim, dan jenis data. | F-63 | RBAC, scoped access, SSO and admin MFA |
| OR-01:7.11:04 | Single sign-on bila dibutuhkan. | F-63 | RBAC, scoped access, SSO and admin MFA |
| OR-01:7.11:05 | MFA untuk akun admin. | F-63 | RBAC, scoped access, SSO and admin MFA |
| OR-01:7.11:06 | API key/service account dengan scope minimum. | N-05 | Restored security/operational control coverage |
| OR-01:7.11:07 | Audit log untuk login, akses, ekspor, dan perubahan tiket. | F-64 | Security access/export audit logs |
| OR-01:7.11:08 | Retensi dan penghapusan data yang dapat dikonfigurasi. | F-65 | Retention, deletion, classification and tenant export |
| OR-01:7.11:09 | Backup dan restore. | F-66 | Tenant isolation, encryption, backup and security assurance |
| OR-01:7.11:10 | Export seluruh data tenant. | F-65 | Retention, deletion, classification and tenant export |
| OR-01:7.11:11 | Incident response process. | N-05 | Restored security/operational control coverage |
| OR-01:7.11:12 | Rate limiting. | F-17 | Queue moderation, anti-spam and rate limits |
| OR-01:7.11:13 | File scanning dan pembatasan tipe/ukuran file. | N-05 | Restored security/operational control coverage |
| OR-01:7.11:14 | Enkripsi saat transit dan saat tersimpan. | F-66 | Tenant isolation, encryption, backup and security assurance |
| OR-01:7.11:15 | Secrets management. | N-05 | Restored security/operational control coverage |
| OR-01:7.11:16 | Environment terpisah untuk dev/staging/production. | F-66 | Tenant isolation, encryption, backup and security assurance |
| OR-01:7.11:17 | Approval untuk akses support ke data produksi. | N-05 | Restored security/operational control coverage |
| OR-01:7.11:18 | Watermark atau redaksi pada ekspor sensitif. | F-65 | Retention, deletion, classification and tenant export |
| OR-01:7.11:19 | Data classification. | F-65 | Retention, deletion, classification and tenant export |
| OR-01:7.11:20 | Pengujian penetrasi dan vulnerability management sebelum deployment skala besar. | F-66 | Tenant isolation, encryption, backup and security assurance |
| OR-01:7.12:01 | REST API. | F-67 | REST API and webhooks |
| OR-01:7.12:02 | Webhooks. | F-67 | REST API and webhooks |
| OR-01:7.12:03 | CSV import/export. | F-10 | Email intake and historical CSV import |
| OR-01:7.12:04 | Email ingestion. | F-10 | Email intake and historical CSV import |
| OR-01:7.12:05 | WhatsApp Business Platform, jika memenuhi kebijakan dan persetujuan yang berlaku. | F-11 | WhatsApp Business channel |
| OR-01:7.12:06 | Maps/geocoding provider. | F-04 | Manual/GPS location and building/room selection |
| OR-01:7.12:07 | Identity provider/SSO. | F-63 | RBAC, scoped access, SSO and admin MFA |
| OR-01:7.12:08 | CMMS/CAFM/helpdesk. | F-68 | Customer CMMS/helpdesk/asset-system integration |
| OR-01:7.12:09 | Asset registry. | F-68 | Customer CMMS/helpdesk/asset-system integration |
| OR-01:7.12:10 | Sistem ERP/finance untuk referensi biaya---read-only lebih dulu. | F-71 | BI and read-only finance/ERP integration |
| OR-01:7.12:11 | BI tools. | F-71 | BI and read-only finance/ERP integration |
| OR-01:7.12:12 | Sistem aduan resmi hanya setelah izin, dokumentasi, dan otorisasi tersedia. | F-69 | Authorized official complaint/Open311 adapter |
| OR-01:7.12:13 | Open311-compatible adapter jika sistem target mendukung standar tersebut. | F-69 | Authorized official complaint/Open311 adapter |
| OR-01:7.12:14 | MCP server untuk akses data/aksi oleh agent eksternal, dengan izin per tool dan audit log. | F-70 | Scoped external-agent MCP server |
