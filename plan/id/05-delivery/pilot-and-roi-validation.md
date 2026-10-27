# Validasi pilot dan ROI

DEL-04 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/05-delivery/pilot-and-roi-validation.md)

Daftar isi: [Rekomendasi dan prasyarat](#rekomendasi-dan-prasyarat) · [Protokol delapan minggu](#protokol-delapan-minggu) · [Definisi waktu dan metrik](#definisi-waktu-dan-metrik) · [Usulan gerbang lanjut, ubah, dan stop](#usulan-gerbang-lanjut-ubah-dan-stop) · [Perhitungan ROI dan contoh yang tidak nyaman](#perhitungan-roi-dan-contoh-yang-tidak-nyaman) · [Ketergantungan dan tindakan berikutnya](#ketergantungan-dan-tindakan-berikutnya)

## Rekomendasi dan prasyarat

Jalankan satu pilot delapan minggu dengan sponsor gedung komersial bernama, satu site, dan 2-4 kategori non-darurat. Kampus dapat menggantikannya bila sponsor berkomitmen memberi akses serta data baseline lebih baik. Belum ada akses, volume tiket, kesediaan membayar, atau hasil nyata terbukti. Persiapan sebelum minggu 1: izin, media privat, retensi/hapus, penutupan terverifikasi, notifikasi, metode waktu, latihan restore, dan cakupan dukungan harus siap.

Sepakati protokol, pengecualian, aturan stop, dan pemilik keputusan komersial sebelum observasi. Uji biaya pilot Rp5.000.000 untuk delapan minggu tidak mencakup tenaga pelanggan; harga lanjutan Rp1.500.000/site/bulan adalah uji, bukan permintaan tervalidasi. Setup dan integrasi khusus terpisah. Jangan mengubah ambang setelah melihat hasil untuk membuat keberhasilan semu.

## Protokol delapan minggu

| Minggu | Fase | Kerja dan bukti |
| --- | --- | --- |
| 1-2 | Baseline sepadan | Amati proses kini, campuran kategori/keparahan, waktu aktif operator, input teknisi, alasan menunggu |
| 3-4 | Shadow | Buat draf berdampingan proses kini tanpa mengubah keputusan langsung; beri label koreksi/duplikat |
| 5-6 | Langsung terbatas | Operator meninjau draf; penugasan manual; bukti dan keputusan supervisor; pantau beban dan aturan stop |
| 7-8 | Evaluasi | Rekonsiliasi catatan sepadan, bekukan kohort, kumpulkan masukan pembeli/operator/teknisi, analisis nilai/biaya |

Volume baseline rendah berarti memperpanjang observasi atau melaporkan tanpa kesimpulan. Usulan minimum operasional 30 catatan layak per fase dibandingkan adalah pemeriksaan perencanaan, bukan kekuatan statistik. Bahkan di atasnya, pilot observasional kecil tetap deskriptif. Bandingkan kategori, lokasi, shift, dan keparahan sepadan; dokumentasikan perubahan staf, kampanye, pembersihan backlog, serta musim. Jangan mengklaim sebab-akibat dari rata-rata sebelum/sesudah.

## Definisi waktu dan metrik

Ukur penanganan aktif operator sebagai jumlah menit fokus membaca, mengklarifikasi, mengedit, memeriksa duplikat, dan menugaskan. Hentikan pengukuran saat menunggu pelapor, teknisi, suku cadang, akses, supervisor, atau antrean sistem. Catat kerja klarifikasi saat operator benar-benar melakukannya. Scope utama MET-03 berakhir pada penugasan pertama: intake, klarifikasi, tinjauan draf, dan pemeriksaan duplikat sampai penugasan pertama itu. Tindak lanjut penutupan operator terpisah, dan verifikasi supervisor selalu dicatat terpisah berdasarkan peran meski satu orang mengerjakan keduanya. Pisahkan durasi penyelesaian berlalu dari waktu aktif. Spreadsheet terkendali dan observasi valid; timer bawaan opsional dan tidak boleh menciptakan beban input semu.

Baris minimum: ID report/tiket pseudonim, fase, site/kategori/keparahan/shift, peran operator, interval mulai/berhenti aktif, alasan jeda, AI ditampilkan, koreksi material, penugasan awal, alasan pengalihan, kelengkapan bukti, tanggal penyelesaian/verifikasi/reopen, menit input teknisi, alasan pengecualian, flag data hilang. Simpan kontak/foto di luar lembar pengukuran. Q memeriksa sampel terhadap event setiap minggu.

| Ukuran | Denominator dan aturan kematangan |
| --- | --- |
| Median penanganan aktif operator | Tiket sepadan layak dengan waktu valid; laporkan jumlah hilang/dikecualikan dan distribusi |
| Koreksi draf | Draf ditinjau AI; koreksi kategori/prioritas/ringkasan material dihitung sekali per draf |
| Routing pertama, MET-05 | Penugasan pertama dinilai benar oleh peninjau sesuai kebijakan routing / penugasan pertama matang tujuh hari yang dinilai; jelaskan cakupan penilaian dan kasus belum dinilai. Tanpa pengalihan tujuh hari adalah proxy stabilitas terpisah |
| Penyelesaian terverifikasi, MET-07 | Kohort intake empat belas hari; kasus belum selesai/tersensor tetap terlihat |
| Reopen, MET-10 | Kohort penutupan empat belas hari; bandingkan penutupan matang dan pisahkan verifikasi sendiri |
| Bukti wajib | Kiriman penyelesaian layak; bukti disetujui tersedia sesuai aturan |
| Aktivasi | Kohort organisasi empat belas hari memakai definisi metrik produk; tampilkan kematangan |
| Konversi berbayar | Keputusan pembeli layak dengan jendela keputusan 30 hari; bedakan komitmen ditandatangani dari minat |

Jangan membagi seluruh penutupan pilot hanya dengan draf AI berhasil. Pertahankan timestamp baseline/perlakuan, aturan inklusi, dan koreksi mentah. Laporkan jumlah, median, rentang, ketidakpastian; jangan membuat signifikansi rekaan. Kohort terlambat perlu tindak lanjut setelah minggu 8 dan mungkin melewati horizon 90 hari.

Waktu aktivasi: catat `pilot.prepared` sebelum baseline. Catat `org.onboarded` hanya saat penggunaan langsung terbatas diaktifkan minggu 5 dengan site, peran, autentikasi, teknisi, dan supervisor siap. Activation14 dimulai dari `org.onboarded`; laporkan waktu berlalu dari `pilot.prepared` sampai aktivasi langsung secara terpisah agar keterlambatan persiapan tetap terlihat.

## Usulan gerbang lanjut, ubah, dan stop

Usulan lanjut memerlukan seluruhnya: median waktu aktif operator >=20% lebih rendah pada kerja sebanding; koreksi <=20%; salah routing atau reopen matang tidak naik dibanding baseline sepadan; bukti wajib >=95%; tanpa insiden privasi/keamanan kritis; pembeli bernama dan komitmen berbayar konkret. Sepakati perlakuan data hilang dan jumlah kecil sebelum pilot. Satu baseline tanpa kejadian bukan bukti tingkat tidak dapat memburuk.

Hentikan penggunaan langsung terbatas untuk kebocoran tenant/media privat, panduan darurat tidak aman, penutupan tanpa kewenangan, atau bukti wajib hilang. Nonaktifkan AI untuk draf tidak valid/tanpa dukungan berulang sambil mempertahankan kerja manual. Ubah cakupan ketika beban input teknisi menghapus penghematan operator atau volume kurang. Respons demo positif tanpa pembeli bukan sinyal lanjut. P dan pemilik pelanggan memutuskan lanjutan dari readout Q/A; [RACI](team-and-raci.md) menetapkan tanggung jawab.

## Perhitungan ROI dan contoh yang tidak nyaman

`Nilai bersih bulanan pelanggan = tenaga aktif dihemat + biaya terhindar berbukti terpisah - langganan - tambahan admin/pelatihan pelanggan - amortisasi integrasi - tambahan beban teknisi/supervisor`. Hitung menit dihemat sekali. Turunnya waktu tunggu tidak bernilai tunai tenaga kecuali terbukti membebaskan kapasitas dibayar atau menghindari biaya terpisah berbukti. Kerusakan terhindar atau perbaikan lebih cepat bukan manfaat default.

Simulasi: 100 tiket/bulan x 5 menit aktif dihemat = 500 menit = 8,333 jam. Pada Rp60.000/jam, nilai tenaga bruto Rp500.000/bulan. Dibanding Rp1.500.000/bulan, nilai bersih sederhana negatif Rp1.000.000 sebelum biaya lain dan ROI `(500.000 - 1.500.000)/1.500.000 = -66,7%`. Impas tenaga saja 300 tiket/bulan pada asumsi ini, sebelum beban lain. Contoh ini menjadikan volume, menit nyata, dan kesediaan membayar sebagai kebutuhan validasi. Ini bukan hasil pelanggan teramati.

Laporkan biaya tunai dan opportunity cost terpisah. Biaya pilot delapan minggu, tenaga pelanggan, serta biaya delivery internal StreetProof adalah perspektif berbeda. Pilot gratis/berdiskon tidak membuktikan harga lanjutan. Jangan menghitung usulan penghematan biaya penyedia sebagai ROI pelanggan.

## Ketergantungan dan tindakan berikutnya

P merekrut hanya setelah otorisasi dan menunjuk pembeli/pemilik data; Q memfinalkan lembar serta instruksi observer; E menyediakan timestamp tepercaya; A membekukan label/versi prompt. Dapatkan protokol disepakati sebelum baseline. Saat readout, terbitkan jumlah layak, data hilang, jendela matang, koreksi, beban teknisi, insiden, biaya, keputusan pembeli, dan ketidakpastian, termasuk hasil tanpa kesimpulan bila sesuai.
