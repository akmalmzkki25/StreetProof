# 06. Retensi

Date: 2026-10-20 | Status: Proposed / research-based | Document ID: MKT-06

[English version](../../en/06-marketing/06-retention.md)

## Daftar isi

- [Keputusan retensi](#keputusan-retensi)
- [Mekanisme layanan](#mekanisme-layanan)
- [Eksperimen dan kriteria berhenti](#eksperimen-dan-kriteria-berhenti)
- [Retensi komersial dan offboarding](#retensi-komersial-dan-offboarding)
- [Urutan pelaksanaan](#urutan-pelaksanaan)

## Keputusan retensi

Belum ada cohort penggunaan atau renewal StreetProof. Rekomendasi awal adalah memastikan alur dipakai kembali ketika pekerjaan yang sesuai terjadi, bukan mengejar login harian. Gedung dengan volume kecil tidak otomatis churn karena satu minggu tanpa tiket. Q harus memeriksa volume dan jadwal operasi sebelum mengirim pesan reaktivasi.

Definisi retensi operasional minggu keempat: akun yang sudah aktif memakai kembali alur triase sampai verifikasi pada jendela hari 22-28 setelah aktivasi pertama. Tampilkan dua angka: seluruh akun aktif yang jendelanya sudah matang, dan subset dengan minimal satu tiket yang layak pada jendela itu. Jangan membuang akun tanpa volume dari laporan keseluruhan; beri label tidak ada kesempatan kerja. Ini ukuran awal, bukan logo retention kontraktual.

## Mekanisme layanan

| Momen | Tindakan | Pemilik dan alat | Batas |
|---|---|---|---|
| Sesudah alur pertama | Debrief apa yang membantu dan menambah beban | Q, log bantuan dan catatan pengguna berizin | Satu sesi 20 menit; tanpa permintaan testimonial otomatis |
| Review mingguan pilot | Tinjau tiket macet, penolakan bukti, dan koreksi | Q+A dengan operator; ekspor event dan spreadsheet | 30 menit/site/minggu; hentikan bila menjadi input ulang yang tidak digunakan |
| Tugas menunggu akses/material | Tampilkan alasan dan pemilik tindak lanjut | Operator pelanggan; status aplikasi | Jangan mengirim pengingat yang meminta penutupan palsu |
| Tidak ada aktivitas | Konfirmasi apakah tidak ada tiket, akses rusak, atau alur ditinggalkan | Q; kontak yang disepakati | Maksimum dua tindak lanjut dalam 14 hari, lalu catat preferensi |
| Menjelang akhir pilot/kontrak | Rekap hasil, biaya layanan, ekspor, dan pilihan lanjut | P+Q; laporan evaluasi dan penawaran | Pilihan menolak/berhenti harus jelas |

Gunakan skill emails, churn-prevention, customer-research, dan copy-editing untuk merancang materi. Alat awal cukup email transaksional atau pesan manual yang disetujui, daftar preferensi, log dukungan, dan buku kontrak. Integrasi email/CRM belum terbukti terpasang. Jangan menganggap skill dapat mengakses akun pelanggan.

## Eksperimen dan kriteria berhenti

RET-01 menguji review mingguan pada satu site selama empat minggu pemakaian yang memenuhi syarat. Q membatasi analisis satu jam dan sesi 30 menit per minggu. Indikator awal adalah alasan hambatan yang memiliki pemilik dan tindakan, serta penurunan pertanyaan berulang. Jika dua review berturut-turut tidak menghasilkan tindakan atau menambah duplikasi pencatatan, ubah menjadi review berdasarkan pengecualian. Nilai dari wawancara deskriptif; jangan mengklaim review menyebabkan retensi dari satu site.

RET-02 menguji panduan satu halaman untuk kendala paling sering. Q membuatnya hanya setelah kendala sama terjadi tiga kali, maksimum dua jam. Ukur apakah pengguna menyelesaikan tugas tanpa bantuan pada tiga kejadian berikutnya. Jika masih memerlukan bantuan yang sama, perbaiki produk atau SOP sebelum menambah panduan. RET-03 menguji satu percakapan win-back setelah penyebab berhenti yang dapat diperbaiki selesai. Tidak ada diskon otomatis. P menghentikannya jika pelanggan menolak kontak atau masalah utama belum selesai.

RET-04 menyiapkan jalur ekspor, alasan keluar sukarela, dan permintaan penghapusan sebelum pilot dimulai. Q membatasi penyusunan checklist satu jam; E memeriksa bahwa janji ekspor/penghapusan sesuai kemampuan aktual. Jika jalur itu belum dapat dijalankan, tahan onboarding data nyata sampai ada proses yang disepakati.

Biaya dukungan harus masuk biaya layanan dan margin, bukan disembunyikan sebagai marketing. Catat menit P/Q/E/A per akun, keparahan, serta root cause. Bila satu site memakai lebih dari dua jam dukungan tidak terencana per minggu selama dua minggu, P menahan site baru sampai scope atau produk diperbaiki. Ini ambang usulan kapasitas, bukan SLA pelanggan.

## Retensi komersial dan offboarding

Paid logo retention menggunakan cohort pelanggan yang benar-benar membayar dan mencapai tanggal renewal. Pisahkan pilot selesai, pilot diperpanjang, pelanggan tidak memperpanjang, dan akun dorman. NRR memerlukan pendapatan awal cohort yang sama, ekspansi, kontraksi, dan churn; tampilkan N/A jika tidak ada pendapatan berulang awal. Jangan menghitung fee pilot sebagai MRR.

Saat berhenti, Q meminta alasan secara sukarela, memberi jalur ekspor yang disepakati, dan meneruskan proses penghapusan kepada pemilik data. Penghapusan media, metadata, dan backup mengikuti kontrak retensi serta batas pemulihan yang benar-benar tersedia. Janji marketing tidak boleh melebihi kemampuan produk. Customer dapat tetap menolak dipublikasikan walaupun hasil pilot baik.

## Urutan pelaksanaan

90 hari pertama menghasilkan log hambatan dan evaluasi satu pilot jika berjalan. Bulan 4-6 memeriksa pengulangan pada akun kedua dan biaya layanan. Bulan 7-12 baru mempertimbangkan lifecycle tersegmentasi jika pola peran dan kejadian cukup stabil. Q memiliki operasi retensi; P memutuskan kapasitas akun; E+A memperbaiki penyebab masalah. [Measurement](13-measurement-and-governance.md) menjelaskan penyebut matang dan [Revenue](08-revenue.md) menangani renewal serta ekspansi.
