# Hackathon, submission dan demo

Document ID: APP-03  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/07-appendices/hackathon-and-demo.md)

## Fakta acara dan batas verifikasi

[EV-01: halaman Cerebral Valley](https://cerebralvalley.ai/e/meta-ai-developer-hackathon) dibaca melalui Jina pada 20 Oktober 2026. Halaman menyebut acara virtual global, seleksi peserta, dua track, pool hadiah total USD1.000.000 dan aturan final yang akan dipublikasikan sebelum acara dimulai. Ini tidak membuktikan tim diterima, memperoleh kredit, atau memenuhi aturan final.

| Milestone pada halaman | Waktu sumber, belum dikonversi |
| --- | --- |
| Applications open | 13 October 2026, 09:00 ET |
| Applications deadline | 25 October 2026, 23:59 ET; earlier if capacity reached |
| Approval notification | 26 October 2026, by 09:00 ET |
| Hackathon start | 26 October 2026 |
| Workshops | 27 October-4 November 2026 |
| Project submission | 4 November 2026, 21:00 ET |
| Judging | 4-8 November 2026 |
| Closing | 9 November 2026 |

Halaman memakai ET pada daftar tanggal, sedangkan tampilan hasil pencarian pernah menampilkan EST. Pertahankan zona sumber dalam checklist; konfirmasi waktu final dengan penyelenggara sebelum konversi ke Asia/Jakarta. Jangan menghitung deadline hanya dengan menambahkan selisih zona tetap pada istilah ET. Pasang buffer internal setelah waktu resmi dipastikan.

## Track dan kelayakan

Track Indie ditujukan individu/pelajar; Startup ditujukan tim/founder produk. Rekomendasi untuk tim 2-4 orang yang membangun B2B adalah memeriksa track Startup terlebih dahulu, tanpa menganggap otomatis eligible. P memeriksa anggota, batas tim, karya sebelum acara, hak kekayaan intelektual, lisensi dataset/model, penggunaan layanan, format submission dan ketentuan hadiah pada aturan yang berlaku. Item yang belum diterbitkan berstatus belum terverifikasi, bukan bebas aturan.

## Checklist submission

- [ ] Pendaftaran/seleksi dan track benar-benar dikonfirmasi.
- [ ] Aturan final dibaca, tanggal akses dan versi dicatat.
- [ ] Akses model Meta diuji melalui akun berwenang; penggunaan nyata dibedakan dari mock.
- [ ] Data berizin atau sintetis, tanpa identitas sensitif.
- [ ] Video, README, diagram, tautan demo/repo dan format yang diminta siap.
- [ ] Demo dapat diulang, dengan jalur manual serta video cadangan.
- [ ] Secrets dihapus dari rekaman, screenshot, log dan repo publik.
- [ ] Klaim metrik menjelaskan n, metode, data sintetis atau pengukuran nyata.

Checklist ini masih kosong karena pekerjaan hanya menyusun dokumentasi.

## Naskah demo 90 detik

| Waktu | Adegan | Bukti yang ditunjukkan |
|---|---|---|
| 0-10 detik | Pelapor melihat kebocoran non-darurat dalam contoh sintetis | Foto awal dan lokasi yang dimasukkan pengguna |
| 10-25 detik | Laporan menjadi draf terstruktur | Ringkasan, kategori, field kurang dan sumber |
| 25-40 detik | Operator mengoreksi dan menilai duplikat | Dua laporan tetap tersimpan, keputusan manusia |
| 40-55 detik | Penugasan dan pekerjaan teknisi | Pemilik, status, checklist dan kendala |
| 55-75 detik | Bukti after dan keputusan supervisor | Penolakan contoh buruk, lalu verifikasi contoh yang cukup |
| 75-90 detik | Status pelapor dan dashboard | Satu sumber event, batas hasil dan rencana pilot |

## Dataset dan skenario sulit

Siapkan fixture sintetis: laporan jelas, foto kabur, lokasi kurang, kategori tidak didukung, dua lokasi serupa, duplikat benar, bukti after berbeda objek, model timeout, token invalid, dan reopen. Fixture menyebut hasil yang diharapkan tanpa mengklaim akurasi umum. Tampilan demo memberi label sintetis yang terlihat.

Utamakan alur lengkap sebelum menambah voice/SAM/MCP. Segmentasi ditambahkan hanya bila penandaan area membantu tugas pengguna. Jangan menggunakan demo foto untuk menyimpulkan keamanan struktur. Detail pekerjaan 10 hari mengikuti [implementation-roadmap](../05-delivery/implementation-roadmap.md).
