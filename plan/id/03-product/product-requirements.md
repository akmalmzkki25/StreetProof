# Kebutuhan produk dan kriteria penerimaan

Document ID: PRD-01  
Date: 2026-10-20  
Status: Usulan untuk ditinjau; belum diimplementasikan  
[English version](../../en/03-product/product-requirements.md)

Isi dokumen

- [Problem dan hasil](#problem-dan-hasil)
- [Peran dan hak keputusan](#peran-dan-hak-keputusan)
- [Skenario inti](#skenario-inti)
- [Kriteria penerimaan](#kriteria-penerimaan)
- [Batas data dan ketidakpastian](#batas-data-dan-ketidakpastian)
- [Non-goal dan gerbang rilis](#non-goal-dan-gerbang-rilis)

## Problem dan hasil

Hipotesis masalah: operator menghabiskan waktu menata laporan yang tidak lengkap, meminta lokasi ulang, memilih tim, serta menagih bukti penyelesaian. StreetProof menguji apakah langkah tersebut dapat dibantu tanpa memindahkan beban berlebihan ke teknisi. Tidak ada prevalensi atau besaran manfaat yang sudah terbukti dari bahan awal.

Produk harus menyelesaikan satu siklus yang dapat dipertanggungjawabkan. Hasil minimal adalah laporan asli tetap tersimpan, satu tiket kanonik ditugaskan, bukti diajukan, supervisor membuat keputusan, dan pelapor memperoleh status yang dapat diakses secara terbatas. Semua angka kualitas di sini merupakan target usulan, bukan performa implementasi.

## Peran dan hak keputusan

Pelapor memasukkan bukti/konteks dan memperoleh status minim data. Operator mengoreksi draf, mengonfirmasi prioritas, menautkan duplikat, dan menugaskan. Teknisi menerima pekerjaan, melaporkan kendala dan mengajukan selesai. Supervisor menilai bukti serta menerima, menolak atau membuka kembali. Admin mengatur lokasi, anggota dan kebijakan; admin tidak mendapat kewenangan menutup pekerjaan hanya karena jabatan teknis. Hak rinci dijelaskan pada [state-machine-and-permissions](../04-technical/state-machine-and-permissions.md).

## Skenario inti

1. Pelapor membuka tautan lokasi dan melihat batas layanan/bahaya. Ia memilih lokasi manual, menambahkan foto dan keterangan.
2. Server membuat laporan/tiket setelah validasi; pekerjaan AI berjalan asinkron. Receipt muncul tanpa menunggu model.
3. AI menyusun draf, menunjuk data yang tidak diketahui, dan memberikan kandidat kategori/duplikat. Operator dapat melanjutkan manual jika AI gagal.
4. Operator mengonfirmasi konteks, mengaitkan laporan yang sama, menetapkan prioritas dan penanggung jawab.
5. Teknisi menerima pekerjaan, memeriksa konteks dan checklist, serta mencatat kemajuan atau kendala akses/material.
6. Teknisi mengunggah bukti setelah pekerjaan dan mengajukan selesai. Pengajuan belum mengubah tiket menjadi verified_closed.
7. Supervisor membandingkan bukti awal/akhir. Ia menerima dengan alasan atau meminta perbaikan. Pelapor memperoleh pembaruan yang tidak membuka data internal.
8. Jika masalah berulang, supervisor membuka kembali dengan alasan; jejak siklus sebelumnya tetap utuh.

## Kriteria penerimaan

| ID | Goal terkait | Perilaku yang harus dibuktikan | Owner |
| --- | --- | --- | --- |
| AC-01 | G-01 | Pelapor memilih lokasi manual dan mengirim foto/teks; field wajib hilang memicu klarifikasi spesifik tanpa menebak lokasi | E/Q |
| AC-02 | G-06 | AI mengembalikan schema valid berisi fakta terlihat, konteks pengguna, inferensi dan missing_fields yang terpisah | A/E |
| AC-03 | G-06/G-08 | Operator dapat mengedit kategori, lokasi, prioritas dan tim; sumber asli tetap dapat dibandingkan | E/Q |
| AC-04 | G-07 | Kandidat duplikat tidak otomatis menghapus laporan; link/unlink menyimpan pelapor dan bukti individual | E/A |
| AC-05 | G-16 | Penugasan manual mencatat penanggung jawab, revisi, waktu dan alasan; perubahan bersaing mendapat conflict | E |
| AC-06 | G-11/G-12 | Teknisi hanya melihat pekerjaan yang diizinkan beserta lokasi, bukti dan checklist; gagal upload tidak mengubah status menjadi selesai | E/Q |
| AC-07 | G-14 | Pengajuan selesai mensyaratkan bukti/checklist kategori atau pengecualian beralasan untuk keputusan supervisor | E/Q |
| AC-08 | G-14/G-03 | Hanya supervisor berwenang menerima verifikasi menjadi verified_closed; penolakan beralasan memungkinkan perbaikan bukti | E/Q |
| AC-09 | G-02/G-04 | Pelapor memperoleh receipt dan tautan token acak; token tidak membuka identitas, catatan internal, lokasi sensitif atau tenant lain | E/Q |
| AC-10 | G-15 | Event penting memuat aktor/peran, waktu server, perubahan, alasan dan correlation_id; pengguna biasa tidak mengedit event | E |
| AC-11 | G-05 | Panduan bahaya tampil sebelum AI; sistem tidak memberi label aman atau menjanjikan respons darurat | P/Q |
| AC-12 | G-04/G-22 | Akses lintas tenant/role ditolak server; media privat dan token kadaluarsa diuji; akun demo tidak membuka data nyata | E/Q |
| AC-13 | G-06 | Timeout, quota atau schema AI gagal menghasilkan status analisis gagal dan jalur triase manual, tanpa tiket ganda | A/E |
| AC-14 | G-20 | Dashboard dihitung dari event tiket yang sama; event sintetis berlabel, tiket belum selesai tidak dipalsukan sebagai closure | E/A |
| AC-15 | G-12/G-24 | Pilot menguji draft tahan putus jaringan dan retry tanpa duplikasi; antrean offline lengkap tetap fitur terpisah | E/Q |
| AC-16 | G-21 | Sebelum pilot tersedia baseline, catatan waktu aktif, biaya aktual dan aturan perbandingan yang disepakati | P/A |
| AC-17 | G-22 | Sebelum data nyata, owner menyetujui tujuan, hosting/subprosesor, retensi, penghapusan dan respons insiden | P/E |
| AC-18 | G-03/G-14 | Reopen memerlukan alasan dan membuat siklus baru tanpa menghapus closure/verifikasi sebelumnya | E/Q |
| AC-19 | G-09 | Saran prioritas memuat alasan; operator menyetujui aturan dampak; status sosial pelapor bukan input prioritas | P/A |
| AC-20 | G-23/G-21 | Penawaran menyebut scope, batas, biaya, akses data, dukungan dan exit; keputusan pembeli dicatat tanpa menganggap minat sebagai pembayaran | P |

## Batas data dan ketidakpastian

Lokasi, aset dan kategori merupakan field terstruktur; identitas reporter dipisahkan sesuai kebutuhan akses. Ringkasan AI bukan pengganti media atau teks asli. Confidence model bukan probabilitas bahwa lokasi aman. Fakta terlihat, keterangan pengguna dan inferensi harus dapat dibedakan di UI serta audit AI run. Jika foto kabur, sistem meminta foto/konteks yang lebih baik atau memilih review manual.

Tiket dan analisis AI memiliki status yang berbeda. Pengulangan job tidak boleh mengulang assignment atau closure. Pilihan kebijakan, batas upload, timeout, token TTL, serta kontrak event mengikuti [api-and-event-contracts](../04-technical/api-and-event-contracts.md). Perubahan membutuhkan revisi bersama, bukan default baru tersembunyi.

## Non-goal dan gerbang rilis

Versi pertama tidak menjanjikan diagnosis teknik, keselamatan, pemilihan kontraktor, pembayaran, predictive maintenance atau integrasi pemerintah. Voice, SAM, peta, WhatsApp Business, MCP dan sinkronisasi offline lengkap tidak boleh menggusur acceptance inti. Sumber SOP hanya dokumen yang disetujui organisasi; model tidak mengarang instruksi perbaikan berbahaya.

Sebelum data nyata, AC-12/AC-17 dan latihan restore harus lulus. Sebelum klaim manfaat, AC-16 dan metode perbandingan harus ada. Sebelum penawaran komersial, AC-20 harus jelas. Readiness produk tidak dapat digantikan jumlah fitur yang terpetakan.
