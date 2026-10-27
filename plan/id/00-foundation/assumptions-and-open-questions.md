# Asumsi dan pertanyaan terbuka

Document ID: FND-04  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/00-foundation/assumptions-and-open-questions.md)

## Cara menggunakan register

Tidak ada baris di bawah yang dianggap fakta pelanggan. Status awal semuanya terbuka. Owner memperbarui bukti dan keputusan setiap minggu. Hal yang menghambat data nyata atau pembayaran harus diselesaikan sebelum gerbangnya, sedangkan ketidakpastian ukuran pasar tidak harus menghentikan demo sintetis.

| ID | Asumsi/pertanyaan | Owner | Cara memperoleh jawaban | Gerbang terdampak |
| --- | --- | --- | --- | --- |
| A-01 | Volume dan upaya administrasi cukup besar | P | Observasi tiket terakhir dan baseline dua minggu | Pemilihan pilot/harga |
| A-02 | Pembeli bersedia membayar di luar sistem existing | P | Tawarkan scope dan harga eksperimen tertulis | Kontrak/scale |
| A-03 | Tim dapat memakai TypeScript/SQL | E | Spike upload, auth dan satu job selama discovery | Finalisasi stack |
| A-04 | API Meta dan model yang diperlukan dapat diakses | A | Uji akun berizin, schema output, biaya dan limit aktual | Demo AI nyata |
| A-05 | Hosting dan subprosesor diterima pemilik data | P + E | Review kontrak, lokasi pemrosesan dan aliran data | Data nyata |
| A-06 | Tambahan foto/checklist tidak membebani teknisi | Q | Tes task, waktu input dan wawancara sesudah pemakaian | Pilot live |
| A-07 | Retensi 90 hari media/365 hari audit sesuai tujuan | P + E | Persetujuan tertulis owner dan peninjauan hukum | Data nyata |
| A-08 | Anggaran cloud/AI/marketing tersedia | P | Tetapkan cap bulanan dan pemilik tagihan | Layanan berbayar |
| A-09 | Baseline sebanding dengan periode intervensi | A + Q | Samakan kategori/kesulitan/jam layanan; catat kasus belum selesai | Klaim ROI |
| A-10 | Sponsor memiliki wewenang proses dan data | P | Konfirmasi owner, operator dan approver sebelum sampel | Pilot |
| A-11 | Aturan hackathon lengkap tersedia sebelum submission | P | Baca halaman resmi dan simpan checklist aturan yang berlaku | Submission |
| A-12 | Operasi mendukung beban puncak dan restore | E | Uji batas job/upload dan latihan restore | Pelanggan nyata |

## Skenario dasar, bukan janji

Perhitungan menggunakan tiga volume simulasi: demo 100 tiket/bulan, pilot 1.000, dan 10 lokasi awal 10.000. Nilai tukar USD 1 = Rp16.000 hanya input sensitivitas. Hipotesis harga Rp1.500.000/lokasi/bulan dan pilot Rp5.000.000 untuk 8 minggu bukan hasil riset willingness-to-pay. Jangan memasukkannya sebagai harga pasar atau proyeksi pendapatan aktual.

## Penanganan jawaban yang belum tersedia

Catat tanggal upaya memperoleh bukti, sumber yang dapat diperiksa, dan apa yang masih hilang. Jangan mengganti biaya AI yang tidak diketahui dengan nol, CAC yang belum diukur dengan CAC iklan, atau pelanggan yang belum diwawancarai dengan persona sintetis. Skenario dapat dihitung selama input diberi label asumsi.

Untuk pertanyaan yang gagal dibuktikan, P memilih mempersempit scope, mengganti segmen, memperpanjang baseline, atau menghentikan pilot. Perubahan dicatat pada register keputusan dan diterapkan ke kedua bahasa. Target tidak diturunkan setelah hasil terlihat hanya agar pilot tampak berhasil.
