# Register risiko

DEL-07 | 2026-10-20 | Status: Proposed / research-based

[Other language / Bahasa lain](../../en/05-delivery/risk-register.md)

Daftar isi: [Rekomendasi dan penilaian](#rekomendasi-dan-penilaian) · [Register](#register) · [Aturan stop dan eskalasi](#aturan-stop-dan-eskalasi) · [Bukti dan risiko tersisa](#bukti-dan-risiko-tersisa) · [Ritme review dan tindakan berikutnya](#ritme-review-dan-tindakan-berikutnya)

## Rekomendasi dan penilaian

Pertahankan register terbuka sepanjang demo dan pilot. Semua penilaian adalah hipotesis analis, bukan probabilitas insiden teramati. Dampak memakai kritis/tinggi/sedang; kemungkinan tinggi/sedang/belum diketahui. Belum diketahui bukan rendah. P memelihara register, pemilik bernama menyediakan bukti, dan pemilik pelanggan menentukan penerimaan data/operasi pelanggan. Risiko tidak ditutup hanya karena dokumen menjelaskan kontrol.

## Register

| ID | Risiko dan penilaian hipotesis | Pemicu atau peringatan | Pencegahan dan respons | Pemilik |
| --- | --- | --- | --- | --- |
| R-01 | Tanpa sponsor berkomitmen, tinggi/belum diketahui | Tanpa pembeli/operator/pemilik data bernama sebelum kesiapan | Kualifikasi akses/kewenangan; geser pilot atau pilih sponsor kampus lebih kuat | P |
| R-02 | Volume sebanding kurang, tinggi/belum diketahui | Kurang dari usulan 30 catatan layak/fase atau kategori tidak cocok | Perpanjang baseline/observasi atau tanpa kesimpulan; jangan menggelembungkan ROI | Q/P |
| R-03 | Penghematan di bawah harga, tinggi/belum diketahui | Penghematan aktif tidak menutup Rp1,5 juta plus beban | Uji harga/cakupan/ICP; pertahankan contoh negatif dan tenaga pelanggan | P/Q |
| R-04 | Tenant/media bocor, kritis/sedang | Akses lintas scope, sesi cache bersama, tanda terima bocor | Uji penolakan, media privat, hash/scope; stop langsung terdampak, cabut, selidiki | E |
| R-05 | AI mengklaim urgensi/diagnosis/penutupan tanpa dukungan, kritis/sedang | Model menyiratkan aman atau perbaikan tak teramati | Draf/batas ketat dan kewenangan manusia; nonaktif AI, koreksi panduan | A/Q |
| R-06 | Akses/batas penyedia gagal, tinggi/belum diketahui | Probe akun gagal, 429/latensi mengganggu intake | Probe awal, retry worker terbatas dan alur manual; label simulasi demo | A/E |
| R-07 | Ketentuan pelatihan/pemrosesan tak cocok, kritis/belum diketahui | Contributor atau lokasi/retensi/subprosesor belum tuntas | Default Standard, tanpa data tak disetujui; dapatkan ketentuan atau tetap sintetis | P/A |
| R-08 | Bukti penyelesaian lemah/dimanipulasi, tinggi/sedang | Gambar ulang/tidak relevan, verifikasi sendiri, reopen berulang | Bukti/checklist kategori, review supervisor, pengecualian terlihat; tolak/reopen | Q/supervisor pelanggan |
| R-09 | Mobile/jaringan/unggah gagal, tinggi/sedang | Respons hilang, izin berakhir, kiriman ganda | Unggah berlanjut/idempotensi, status tanda terima jelas; retry aman, jangan klaim tersimpan | E/Q |
| R-10 | Worker/outbox hilang atau efek berulang, tinggi/sedang | Umur antrean, job bermasalah, kirim/tagihan model ganda | Outbox transaksional, lease, dedup, rekonsiliasi; karantina/pulihkan | E/A |
| R-11 | Kapasitas tim dibesar-besarkan, tinggi/tinggi | E melebihi 50 jam demo atau peran gabungan melampaui 100 | Cakupan dua orang diperkecil, review beban/cadangan; geser milestone | P/E |
| R-12 | Biaya berlebih, tinggi/belum diketahui | Pemakaian model/gambar, egress, staging, tenaga dukungan tak terduga | Pisahkan workspace/compute/AI/tenaga, kuota/peringatan; batasi opsional | P/E |
| R-13 | Hukum/hosting/pengadaan tak cocok, tinggi/belum diketahui | Pelanggan mensyaratkan transfer, PSE, hosting lokal, pengadaan belum tuntas | Review hukum/pelanggan, inventaris pemroses, syarat resmi terverifikasi; tunda segmen/data nyata | P |
| R-14 | Migrasi merusak makna, tinggi/sedang | Kategori salah, lokasi hilang, penutupan impor disebut terverifikasi | Dry-run, pemetaan, ID sumber, rekonsiliasi; rollback impor belum berubah | E/Q |
| R-15 | Responder tunggal/celah dukungan, tinggi/sedang | Engineer tunggal tidak tersedia atau insiden melebihi cakupan | Cadangan bernama, proses manual pelanggan, jam eksplisit; kurangi langsung | P/E |
| R-16 | Metrik bias, tinggi/tinggi | Hanya AI berhasil/kasus tutup; tunggu disebut tenaga; kohort belum matang | Bekukan inklusi, label peninjau, kematangan/data hilang, beban terpisah | Q/A |
| R-17 | Data terhapus muncul dari backup, kritis/sedang | Restore tanpa ledger hapus atau media yatim tersisa | Inventaris siklus, restore terisolasi, terapkan hapus; periksa sebelum akses | E |
| R-18 | Asumsi acara salah, sedang/belum diketahui | Kelayakan/akses/tanggal/zona waktu berbeda dari rencana | Verifikasi ketentuan penyelenggara; demo dapat dipakai ulang dan waktu relatif | P |

## Aturan stop dan eskalasi

Hentikan pemrosesan langsung terbatas terdampak untuk kebocoran privat terkonfirmasi, penutupan terverifikasi tanpa kewenangan, panduan darurat tidak aman, bukti wajib hilang, atau transfer/mode pelatihan data pribadi tak disetujui. Pertahankan jalur operasional manual hanya bila aman dan berwenang. E membatasi insiden teknis; A menonaktifkan AI terkait; P/pelanggan menentukan komunikasi serta mulai kembali dengan nasihat bila perlu. Jangan menghapus bukti audit atau diam-diam melabel ulang insiden sebagai uji.

Jeda cakupan opsional saat jalur kritis kehilangan cadangan atau belanja melampaui batas. Perpanjang observasi atau tanpa kesimpulan saat volume/kecocokan kurang. Minat pembeli tanpa keputusan berbayar konkret tidak menutup R-01/R-03. Kampus adalah alternatif segmen bersyarat, bukan akses terjamin.

## Bukti dan risiko tersisa

Untuk setiap baris tambahkan alasan probabilitas nyata, pemilik pencegahan, tenggat, status, tautan bukti, dampak/kemungkinan tersisa, dan tanggal review berikut. Default terbuka. Penerimaan memerlukan pemilik keputusan bernama dan batas tersisa terdokumentasi. Risiko kritis privasi/kewenangan tidak dapat dikesampingkan hanya demi tenggat demo; pertahankan sintetis atau hapus cakupan langsung terkait.

Bukti berguna mencakup skenario lintas tenant berhasil/ditolak, rekonsiliasi restore DB+media, probe akun/ketentuan penyedia, baris waktu operator lengkap, label routing dinilai peninjau, riwayat bukti dikoreksi, dan catatan biaya nyata. Daftar fitur penyedia bukan bukti implementasi. [Keamanan](../04-technical/security-privacy-and-governance.md), [kualitas](quality-and-acceptance.md), dan [protokol pilot](pilot-and-roi-validation.md) menetapkan pemeriksaan tersebut.

## Ritme review dan tindakan berikutnya

P meninjau penghambat pada hari demo 2/5/8 dan mingguan saat persiapan/pilot. Penyedia, jenis media, tindakan otonom, integrasi, atau segmen baru memicu tinjauan risiko terkait sebelum rilis. Tetapkan orang nyata serta kewenangan pelanggan sebelum menyatakan siap. Estimasi ulang jadwal/anggaran berbukti; jangan mempertahankan tanggal usang dengan membuang baseline, pemulihan, atau bukti.
