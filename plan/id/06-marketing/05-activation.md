# 05. Aktivasi

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-05

[English version](../../en/06-marketing/05-activation.md)

## Daftar isi

- [Nilai pertama pada tingkat akun](#nilai-pertama-pada-tingkat-akun)
- [Rencana onboarding yang dibantu tim](#rencana-onboarding-yang-dibantu-tim)
- [Eksperimen aktivasi](#eksperimen-aktivasi)
- [Pengukuran cohort](#pengukuran-cohort)
- [Horizon dan tindakan berikutnya](#horizon-dan-tindakan-berikutnya)

## Nilai pertama pada tingkat akun

Aktivasi StreetProof bukan signup pelapor atau login operator. Definisi usulan: satu akun pilot menyelesaikan alur nyata yang diizinkan dari laporan, triase operator, penugasan, bukti penyelesaian, sampai keputusan supervisor `verified_closed`, supervisor dapat membuka jejak keputusannya, dan pelapor menerima status/tanda terima yang sesuai. AI tidak boleh memverifikasi pekerjaan sendiri. Demo sintetis membuktikan alur demo, bukan aktivasi pelanggan.

Pisahkan dua peristiwa. `pilot.prepared` mencatat kesiapan perencanaan dan data sebelum baseline, bukan awal Activation14. `org.onboarded` baru dicatat saat limited-live diaktifkan setelah baseline dan shadow selesai, yaitu awal minggu pilot ke-5 dalam jadwal usulan. Pada saat itu site, peran, izin data nyata, akses, teknisi, dan supervisor harus siap menjalankan alur nyata. Ukur Activation14 selama 14 hari kalender sejak `org.onboarded`; jangan memulai clock pada persiapan atau latihan sintetis.

Ukur juga `TimeToLive = org.onboarded_at - pilot.prepared_at` agar persiapan panjang tidak hilang dari laporan. Tampilkan durasi tiap akun, median untuk yang sudah live, dan akun yang belum live beserta umur tunggu serta hambatannya. Tiket yang menunggu material atau akses boleh tetap terbuka; jangan menutupnya demi metrik. Jika tidak ada tiket yang layak dalam window aktivasi, tampilkan alasan. Perpanjangan observasi adalah keputusan terpisah dan tidak mengubah hasil atau penyebut Activation14 yang sudah ditetapkan.

## Rencana onboarding yang dibantu tim

| Langkah | Hasil yang diperiksa | Pemilik | Hambatan dan respons |
|---|---|---|---|
| Persiapan sebelum baseline | Sponsor, pembeli, operator, teknisi, supervisor, pemilik data bernama; catat pilot.prepared | P+Q | Tahan data nyata jika izin atau pemilik tidak ada; belum memulai Activation14 |
| Konfigurasi satu site | Lokasi manual, 2-4 kategori, penugasan, bukti wajib, jam operasi | E+Q dengan pelanggan | Hindari import seluruh registry sebagai syarat mencoba |
| Latihan sintetis | Operator mengoreksi draf AI; supervisor menolak bukti yang kurang | Q+A | Ulangi latihan jika orang mengira AI memberi keputusan final |
| Mengaktifkan limited-live setelah baseline dan shadow | Catat org.onboarded hanya ketika site, peran, data nyata, teknisi, dan supervisor siap; mulai Activation14 dan akhiri TimeToLive | P+Q+E | Gerbang gagal menahan live; catat waktu tunggu sejak pilot.prepared |
| Alur nyata terbatas | Teknisi mengirim bukti tanpa input berlebihan; supervisor menerima/menolak dengan alasan | Q+operator pelanggan | Rekam waktu input dan kendala koneksi; sediakan proses manual yang disepakati |
| Debrief | Pengguna mengulang alur tanpa dipandu dan menjelaskan status | Q | Catat kebutuhan bantuan sebagai biaya, bukan menghapusnya dari time-to-value |

Pelapor memakai tanda terima/status dengan token acak, berlingkup dan dapat dicabut. Token tidak menjadi parameter analytics atau contoh publik. Pemasaran tidak meminta seluruh pelapor membuat akun. Instruksi darurat terlihat sejak awal dan tidak menunggu klasifikasi AI. Voice, peta, WhatsApp Business, dan offline sync luas tidak menjadi janji onboarding awal.

## Eksperimen aktivasi

| ID | Pertanyaan dan pelaksanaan | Batas | Keputusan |
|---|---|---|---|
| ACT-01 | Apakah checklist satu halaman mengurangi pertanyaan yang menghalangi setup? Q memakai checklist pada satu site dan mencatat semua bantuan | Maksimum dua sesi 45 menit per site, persiapan dua jam; kas masuk enablement S1 | Jika setup tetap membutuhkan integrasi khusus atau lebih dari empat jam bantuan, sempitkan scope dan revisi checklist sebelum merekrut site kedua |
| ACT-02 | Apakah contoh bukti diterima/ditolak membantu teknisi dan supervisor? Q menyiapkan dua contoh sintetis dan mengamati lima latihan jika tersedia | Maksimum dua jam pembuatan; tidak mengklaim signifikansi dari lima latihan | Jika dua peserta masih salah memahami siapa yang memverifikasi, ubah instruksi dan ulangi sebelum live |
| ACT-03 | Apakah pengingat tugas membantu tanpa menambah beban? Q menguji satu pengingat pada tugas yang memang terlambat menurut aturan pelanggan | Satu pengingat per peristiwa, tanpa broadcast harian; waktu engineering dalam cap marketing | Hentikan otomatisasi jika salah penerima, bocor data, atau keluhan berulang; lanjutkan manual saat diperbaiki |

Skill utama: onboarding, copywriting, customer-research, analytics. Alat awal: checklist Markdown, sesi yang disetujui, log bantuan, dan event aplikasi yang dapat diekspor. Emails membantu instruksi setelah UI stabil; tidak perlu Customer.io, paywall, App Store, atau OAuth baru hanya untuk menyebut onboarding selesai.

## Pengukuran cohort

`Activation14 = akun org.onboarded yang mencapai alur terverifikasi pertama dan status/tanda terima pelapor dalam 14 hari / akun org.onboarded yang sudah melewati seluruh 14 hari pengamatan.` Akun yang baru diaktifkan untuk limited-live kemarin berstatus pending dan tidak masuk penyebut. Akun yang baru pilot.prepared belum masuk cohort aktivasi; tampilkan dalam laporan TimeToLive. Tampilkan `x/n`, jumlah pending, median waktu untuk yang berhasil, serta akun tanpa tiket layak. Median yang hanya menghitung keberhasilan harus selalu disertai non-aktivasi agar kegagalan tidak hilang.

Time-to-first-draft dan login membantu diagnosis, tetapi tidak menggantikan aktivasi. Beban teknisi, koreksi operator, dan supervisor rejection menjadi guardrail. [Measurement](13-measurement-and-governance.md) memisahkan cohort ini dari cohort retensi dan penutupan tiket.

## Horizon dan tindakan berikutnya

Dalam 90 hari, siapkan onboarding satu site dan amati satu cohort kecil jika pilot diizinkan. Pada bulan 4-6, revisi berdasarkan hambatan aktual dan uji apakah site kedua dapat mengulang tanpa menambah bantuan. Pada bulan 7-12, self-serve setup hanya layak jika peran, kontrol data, dan pola konfigurasi terbukti berulang. Q memiliki checklist; P menyetujui readiness; E+A mengatasi masalah produk yang benar-benar menghalangi nilai pertama.
