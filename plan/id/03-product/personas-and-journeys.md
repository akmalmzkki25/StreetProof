# Persona hipotesis dan perjalanan pengguna

Document ID: PRD-02  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/03-product/personas-and-journeys.md)

## Status persona

Persona berasal dari OR-01 §3-4 dan analisis penulis. Persona ini belum merupakan hasil wawancara. Tidak ada nama pelanggan, kutipan atau angka beban kerja yang dikarang. Gunakan saat merekrut peserta dan koreksi berdasarkan observasi tiket nyata.

| Peran | Hasil yang dicari | Interaksi utama | Batas keberhasilan |
| --- | --- | --- | --- |
| Pelapor/penghuni | Mengirim konteks yang cukup dan mengetahui tindak lanjut | Foto, lokasi manual, receipt, status terbatas | Keberhasilan: laporan diterima; bukan semua identitas terkumpul |
| Operator/helpdesk | Menyiapkan tiket tanpa input ulang berlebihan | Review AI, klarifikasi, kandidat duplikat, assignment | Ukur menit aktif dan salah routing |
| Teknisi internal | Memahami pekerjaan dan mencatat hasil dengan ringan | Konteks lokasi/aset, checklist, bukti, kendala | Ukur input tambahan, bukan jumlah foto semata |
| Vendor | Menerima scope dan bukti yang dapat disepakati | Acceptance, perubahan scope, dispute beralasan | Hindari skor AI sebagai sanksi otomatis |
| Supervisor/facility manager | Memastikan hasil dapat diperiksa dan backlog terkendali | Review before/after, reject/reopen, pemilik dan tenggat | Closure harus punya keputusan manusia |
| Pembeli operasional | Membayar jika manfaat dan risiko dapat diterima | Baseline, biaya, laporan pilot dan scope kontrak | Minat demo belum berarti pembelian |
| IT/legal/DPO | Menyetujui akses, hosting dan tujuan pemrosesan | Dataflow, subprosesor, audit, retensi dan exit | Kontrol teknis tidak mengesahkan kepatuhan sendiri |
| Procurement/finance | Membeli layanan dengan batas dan harga jelas | Penawaran, vendor eligibility, pajak dan dukungan | Kebutuhan ini sebagian non-fitur |
| Admin aduan pemerintah | Menyalurkan laporan sesuai kewenangan | Rujukan berizin dan rekonsiliasi | Di luar pelanggan awal |

## Journey pelaporan sampai penutupan

| Titik serah terima | Kebutuhan penerima | Risiko putus alur | Rancangan dan pengukuran |
|---|---|---|---|
| Pelapor ke operator | Lokasi, bukti dan ringkasan | Foto tanpa konteks; AI mengarang ruangan | Field lokasi manual, missing_fields, koreksi; completeness rate |
| Operator ke teknisi | Masalah, scope, akses dan penanggung jawab | Salah tim atau konteks tidak sampai | Review manusia, assignment event, acceptance; first-pass routing |
| Teknisi ke supervisor | Bukti awal/akhir dan tindakan | Foto gagal unggah tetapi dianggap selesai | Upload terkonfirmasi, checklist, completion_submitted; evidence completeness |
| Supervisor ke pelapor | Keputusan yang dapat dimengerti | Tiket ditutup tetapi pelapor tidak tahu | Status minim data dan notifikasi yang disetujui; status-access task test |
| Produk ke pembeli | Manfaat dibanding proses lama | Dashboard terlihat baik tetapi menambah kerja | Baseline upaya aktif, biaya dan input teknisi; keputusan pilot |

## Alur alternatif

Foto kabur meminta perbaikan bukti tanpa menghapus kiriman asli. Laporan salah kategori dapat dikoreksi dan alasannya disimpan. Kandidat duplikat hanya saran; operator dapat menolak saran atau membatalkan link. Tiket menunggu akses/material tetap memiliki pemilik dan alasan. Penolakan bukti mengembalikan pekerjaan untuk koreksi dan tidak menghilangkan jejak pengajuan sebelumnya.

Jika pelapor kehilangan token, proses bantuan memverifikasi hak akses tanpa membuka data berdasarkan nomor tiket saja. Jika pengguna tidak memiliki smartphone, operator dapat memasukkan laporan assisted intake dengan asal kanal yang jelas. Emergency guidance tidak menunggu foto atau keluaran model.

## Pembelian dan adopsi

P memulai dari champion, mengonfirmasi pembeli dan approver sebelum pilot. Q mengamati teknisi, bukan hanya manajer. IT meninjau aliran data sebelum sampel nyata; procurement menerima scope dan cara keluar. Vendor lama dilibatkan untuk menghindari perubahan proses tersembunyi. Bila manfaat hanya terasa bagi manajer tetapi kerja teknisi naik, hipotesis adopsi belum lulus.

Template wawancara ada di [interview-and-usability-kits](../07-appendices/interview-and-usability-kits.md). Setiap temuan mencatat peran, konteks, metode, dan izin penggunaan, bukan generalisasi ke seluruh pasar.
