# Definisi metrik dan sumber event

Document ID: PRD-06  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/03-product/metrics-and-events.md)

Isi dokumen

- [Aturan pengukuran](#aturan-pengukuran)
- [Contoh perhitungan simulasi](#contoh-perhitungan-simulasi)
- [Kontrak analitik dan kualitas data](#kontrak-analitik-dan-kualitas-data)
- [Clock aktivasi dan waktu penyiapan](#clock-aktivasi-dan-waktu-penyiapan)
- [Dashboard dan keputusan](#dashboard-dan-keputusan)

## Aturan pengukuran

Metrik utama produk adalah verified resolution dengan definisi cohort yang tetap. Metrik bisnis membaca konversi berbayar dan biaya dukungan; keduanya tidak disamakan dengan akurasi model. Definisi di bawah adalah usulan operasional yang perlu disepakati sebelum pilot. Simpan numerator, denominator, window dan jumlah pending bersama persentase.

| ID | Metrik | Definisi | Sumber | Cadence |
| --- | --- | --- | --- | --- |
| MET-01 | Completeness | Laporan memiliki field wajib kategori/lokasi/bukti sesuai kebijakan / laporan valid dalam cohort masuk | report.submitted; triage.confirmed | Daily |
| MET-02 | AI correction | Draf yang diedit field material / draf yang selesai direview; tampilkan gagal/pending terpisah | ai.completed; triage.confirmed | Weekly |
| MET-03 | Active handling time | Jumlah interval aktif intake/klarifikasi/review draf/duplikat sampai penugasan pertama; jeda/antre dikeluarkan; tugas follow-up penutupan terpisah | Observed time log + report ID | Baseline/pilot |
| MET-04 | Time to triage | triage.confirmed_at - report.submitted_at; tampilkan distribusi dan kasus belum triase | report.submitted; triage.confirmed | Daily |
| MET-05 | First-pass routing | Penugasan pertama yang dinilai benar oleh reviewer sesuai aturan tim/kategori / penugasan pertama yang telah dinilai dan diamati penuh 7 hari; tampilkan coverage dan unassessed | ticket.assigned; routing.reviewed | Weekly matured reviewed cohort |
| MET-06 | Duplicate precision | Kandidat duplikat yang benar menurut review / kandidat yang sudah diberi label; bukan ukuran recall | duplicate.suggested; duplicate.reviewed | Weekly |
| MET-07 | Verified resolution | Tiket cohort masuk yang verified_closed dalam 14 hari / tiket valid dengan pengamatan penuh 14 hari; pending terpisah | report.submitted; ticket.verified_closed | Weekly matured cohort |
| MET-08 | Time to verified closure | verified_closed_at - submitted_at per siklus; median/p95 hanya pada closed dengan backlog terbuka terlihat | ticket.verified_closed; ticket.reopened | Weekly |
| MET-09 | Evidence completeness | Pengajuan memenuhi checklist bukti kategori / seluruh pengajuan yang dinilai; pengecualian ditampilkan | completion.submitted; verification.decided | Weekly |
| MET-10 | Reopen rate | Closure yang reopen dalam 14 hari / closure yang memiliki jendela 14 hari penuh | ticket.verified_closed; ticket.reopened | Weekly matured closure cohort |
| MET-11 | SLA compliance | Tiket eligible memenuhi deadline sesuai versi kalender / tiket eligible yang sudah due; laporkan pause dan exclusions | ticket.assigned; sla.due; ticket.verified_closed | Weekly |
| MET-12 | Technician input burden | Waktu aktif input/checklist/bukti per work order; bukan waktu perbaikan fisik | Observed task/time log | Baseline/pilot |
| MET-13 | Organizational activation | Organisasi menyelesaikan alur pertama dengan review dan status pelapor dalam 14 hari / organisasi onboard dengan jendela 14 hari penuh | org.onboarded; workflow.activated | Weekly matured cohort |
| MET-14 | Paid conversion | Pilot dengan kontrak berbayar ditandatangani/invoice sesuai definisi / pilot yang periode keputusan 30 hari telah selesai | pilot.completed; contract.signed | Monthly matured cohort |
| MET-15 | Cost per ticket | Biaya operasi periode / tiket valid periode; pisahkan biaya tetap, variabel dan tenaga kerja | Billing export + valid tickets | Monthly |

## Contoh perhitungan simulasi

Dari 20 organisasi onboard, 5 belum melewati jendela 14 hari. Jika 9 dari 15 organisasi matang aktif, activation = 9/15 = 60%; 5 tetap pending, bukan gagal. Dari 50 closure, 10 belum memiliki pengamatan penuh dan 4 dari 40 sisanya reopen: reopen rate = 4/40 = 10%. Jangan menggunakan 50 sebagai denominator.

Jika 100 tiket menghemat 5 menit aktif masing-masing, penghematan = 500 menit = 8.333 jam. Pada biaya tenaga Rp60.000/jam, nilainya Rp500.000. Ini lebih rendah daripada hipotesis harga Rp1.500.000/bulan. Dibutuhkan 300 tiket dengan asumsi yang sama hanya untuk menyamai biaya platform, sebelum biaya perubahan proses dan dukungan. Jangan mengklaim ROI positif dari pengurangan waktu tunggu.

## Kontrak analitik dan kualitas data

Nama event pada tabel adalah nama semantik analitik. Kontrak wire, envelope, revisi dan hak emisi mengikuti [api-and-event-contracts](../04-technical/api-and-event-contracts.md); adapter analitik memetakan wire event ke nama ini dan tidak menerbitkan event bisnis baru. Event server adalah sumber kebenaran, sedangkan klik klien hanya diagnostik UX.

Setiap event memuat tenant, ticket/report ID yang sesuai, waktu server UTC, aktor/peran, cycle/revision dan versi policy. Tampilkan waktu lokal Asia/Jakarta pada antarmuka tanpa mengubah waktu sumber. Jangan mengirim token status, isi media, identitas pelapor atau secret ke tools analitik. Dedup event berdasarkan event_id, bukan judul tiket. Link duplikat mempertahankan count laporan tetapi work order kanonik dihitung sekali.

Simpan data mentah pengukuran dengan izin dan audit perubahan. Tandai periode demo sintetis agar tidak bercampur pilot. Biaya dan outcome yang belum ada bernilai unknown, bukan nol. Kategori/kesulitan, jam layanan, material, cuaca dan volume merupakan potensi pembaur saat membandingkan baseline.

Batas MET-03 sama pada baseline dan intervensi: kerja aktif operator dari intake sampai penugasan pertama. Follow-up penutupan oleh operator dicatat terpisah; pemeriksaan supervisor dan input teknisi tidak dimasukkan ke penghematan operator. Jika satu orang memegang beberapa peran, labeli interval menurut peran dan jangan menghitung menit yang sama dua kali. Biaya tambahan peran lain tetap masuk perhitungan manfaat bersih.

## Clock aktivasi dan waktu penyiapan

Catat pilot.prepared ketika sponsor, protokol dan kesiapan baseline disepakati sebelum minggu 1. Untuk MET-13, org.onboarded baru dicatat ketika workflow limited-live diaktifkan setelah baseline dan shadow mode, biasanya awal minggu 5, dengan lokasi, peran, izin data dan petugas/supervisor siap. Jendela aktivasi 14 hari dimulai dari tanggal itu. Ukur time-to-live dari pilot.prepared ke org.onboarded secara terpisah agar penyiapan panjang tidak disembunyikan. Tanggal mulai kontrak/pilot tetap tersimpan dan tidak digeser demi metrik.

MET-05 membutuhkan label reviewer atas penugasan pertama, bukan sekadar tidak ada reassignment. Simpan routing.reviewed sebagai hasil penilaian analitik, reviewer, versi aturan dan alasan. Proxy routing stability 7 hari dapat menghitung tidak adanya koreksi pada semua penugasan matang, tetapi namanya tidak boleh diubah menjadi akurasi. Tampilkan proporsi yang dinilai dan yang belum dinilai agar sampel pilihan tidak menyembunyikan salah routing. Bila review tidak tersedia, akurasi tetap unknown.

## Dashboard dan keputusan

Operator melihat backlog, umur dan pemilik; supervisor melihat kelengkapan bukti, pengajuan ditolak dan reopen; P melihat cohort pilot, biaya penuh dan komitmen pembeli. A memeriksa false duplicate dan correction menurut kategori. Sampel kecil dilaporkan deskriptif dengan n, rentang dan konteks; tidak ada klaim signifikansi tanpa desain statistik.

Rencana eksperimen dan keputusan lanjut ada di [pilot-and-roi-validation](../05-delivery/pilot-and-roi-validation.md). Bila protokol metrik diubah, versi definisi ikut berubah dan hasil sebelum/sesudah tidak digabung diam-diam.
