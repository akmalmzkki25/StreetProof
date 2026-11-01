import { ID_ERRORS } from "./messages-id-errors";

// Indonesian for the interface. The key is the English sentence as written in
// the code, so a missing entry falls back to English instead of breaking.
export const ID_MESSAGES: Record<string, string> = {
  ...ID_ERRORS,

  // Status, category, priority and role names
  "New report": "Laporan baru",
  "Needs clarification": "Perlu klarifikasi",
  "Ready to assign": "Siap ditugaskan",
  Ready: "Siap",
  Assigned: "Ditugaskan",
  Accepted: "Diterima",
  "In progress": "Sedang dikerjakan",
  "Waiting for parts": "Menunggu suku cadang",
  "Waiting for access": "Menunggu akses",
  "Awaiting verification": "Menunggu verifikasi",
  "Verified closed": "Terverifikasi dan ditutup",
  "Proof rejected": "Bukti ditolak",
  Reopened: "Dibuka kembali",
  Cancelled: "Dibatalkan",
  Plumbing: "Pipa dan air",
  Electrical: "Listrik",
  "Air conditioning": "Pendingin ruangan",
  "Walls, floors and ceilings": "Dinding, lantai, dan plafon",
  Other: "Lainnya",
  Low: "Rendah",
  Normal: "Normal",
  High: "Tinggi",
  Urgent: "Mendesak",
  Operator: "Operator",
  Technician: "Teknisi",
  Supervisor: "Supervisor",
  "Tenant admin": "Admin gedung",
  System: "Sistem",
  Worker: "Sistem",
  "low uncertainty": "ketidakpastian rendah",
  "medium uncertainty": "ketidakpastian sedang",
  "high uncertainty": "ketidakpastian tinggi",

  // Dashboard stages and ages
  "Needs triage": "Perlu triase",
  "With technicians": "Di tangan teknisi",
  "Waiting on parts or access": "Menunggu suku cadang atau akses",
  "needs triage": "perlu triase",
  "is ready to assign": "siap ditugaskan",
  "is with a technician": "sedang dikerjakan teknisi",
  "is waiting on parts or access": "menunggu suku cadang atau akses",
  "is awaiting verification": "menunggu verifikasi",
  "Under 1 day": "Kurang dari 1 hari",
  "1 to 3 days": "1 sampai 3 hari",
  "3 to 7 days": "3 sampai 7 hari",
  "Over 7 days": "Lebih dari 7 hari",

  // Audit log
  "Audit log": "Log audit",
  "Signed in": "Masuk",
  "Failed sign-in": "Gagal masuk",
  "Reset their password": "Mengatur ulang kata sandinya",
  "Added a member": "Menambahkan anggota",
  "Changed a member's access": "Mengubah akses anggota",
  "Deactivated a member": "Menonaktifkan anggota",
  "Reactivated a member": "Mengaktifkan kembali anggota",
  "Set a member's password": "Menetapkan kata sandi anggota",
  "Added a team": "Menambahkan tim",
  "Retired a team": "Menghapus tim",
  "Created a new status link": "Membuat tautan status baru",
  "Opened a ticket": "Membuka tiket",
  "The latest 200 sign-ins, account changes and ticket views. Changes to a ticket itself are in that ticket's history.":
    "200 aktivitas terbaru berupa login, perubahan akun, dan tiket yang dibuka. Perubahan pada tiket ada di riwayat tiket tersebut.",
  "Nothing recorded yet.": "Belum ada yang tercatat.",
  "Removed account": "Akun terhapus",
  Who: "Siapa",
  What: "Apa",
  When: "Kapan",

  // Members and teams
  Members: "Anggota",
  "Manage members": "Kelola anggota",
  "Manage members and teams, and check who did what in the audit log.":
    "Kelola anggota dan tim, lalu periksa siapa melakukan apa di log audit.",
  "Current members": "Anggota saat ini",
  "Add a member": "Tambah anggota",
  "Add member": "Tambah anggota",
  "Member added.": "Anggota ditambahkan.",
  "Adding…": "Menambahkan…",
  Name: "Nama",
  Email: "Email",
  "First password": "Kata sandi awal",
  'Pass it on privately. They can change it through "Forgot your password?" when email is set up.':
    'Sampaikan secara pribadi. Mereka bisa menggantinya lewat "Lupa kata sandi?" jika email sudah disiapkan.',
  Roles: "Peran",
  "Your roles": "Peran Anda",
  "All sites": "Semua lokasi",
  "Save access": "Simpan akses",
  "New password": "Kata sandi baru",
  "Set password": "Tetapkan kata sandi",
  "Password set. They were signed out everywhere.":
    "Kata sandi ditetapkan. Mereka telah dikeluarkan dari semua perangkat.",
  Deactivate: "Nonaktifkan",
  Deactivated: "Nonaktif",
  Reactivate: "Aktifkan kembali",
  Teams: "Tim",
  Team: "Tim",
  "Team (optional)": "Tim (opsional)",
  "New team": "Tim baru",
  "Add team": "Tambah tim",
  "No team": "Tanpa tim",
  "No teams yet.": "Belum ada tim.",
  Retire: "Hapus",

  // Navigation and shell
  Main: "Utama",
  Workspace: "Ruang kerja",
  Queue: "Antrean",
  "My work": "Pekerjaan saya",
  Reviews: "Pemeriksaan",
  Overview: "Ringkasan",
  "Open the menu": "Buka menu",
  "Open the full page": "Buka halaman penuh",
  Close: "Tutup",
  "Skip to content": "Lewati ke konten",
  "Sign out": "Keluar",
  "Toggle theme": "Ganti tema",
  Theme: "Tema",
  Language: "Bahasa",
  Day: "Terang",
  Night: "Gelap",
  "Hello, {name}": "Halo, {name}",
  "Open the queue": "Buka antrean",
  "Open my work": "Buka pekerjaan saya",
  "Open reviews": "Buka pemeriksaan",
  "Review incoming reports, triage them into tickets and assign technicians.":
    "Periksa laporan masuk, triase menjadi tiket, lalu tugaskan teknisi.",
  "Accept assigned work, record progress and submit completion proof.":
    "Terima pekerjaan yang ditugaskan, catat progres, lalu kirim bukti penyelesaian.",
  "Verify completion proof, reject it with a reason, or reopen closed work.":
    "Verifikasi bukti penyelesaian, tolak dengan alasan, atau buka kembali pekerjaan yang sudah ditutup.",
  "This page could not be found.": "Halaman ini tidak ditemukan.",
  "Back to the start": "Kembali ke awal",

  // Home
  "Reports become": "Laporan menjadi",
  "repair work.": "pekerjaan perbaikan.",
  "Facility damage reports turn into assigned tickets with completion evidence and supervisor-controlled closure. AI drafts; people decide.":
    "Laporan kerusakan fasilitas menjadi tiket yang ditugaskan, lengkap dengan bukti penyelesaian dan penutupan oleh supervisor. AI menyusun draf, manusia yang memutuskan.",
  "Try the report form": "Coba formulir laporan",
  "Report forms:": "Formulir laporan:",
  "Demo accounts (synthetic data)": "Akun demo (data sintetis)",
  "Synthetic data": "Data sintetis",

  // Sign in and passwords
  "Sign in": "Masuk",
  "Signing in…": "Sedang masuk…",
  Password: "Kata sandi",
  "Operators, technicians and supervisors sign in with the account their building admin created.":
    "Operator, teknisi, dan supervisor masuk dengan akun yang dibuat admin gedung.",
  "Forgot your password": "Lupa kata sandi",
  "Forgot your password?": "Lupa kata sandi?",
  "Back to sign in": "Kembali ke halaman masuk",
  "Send reset link": "Kirim tautan atur ulang",
  "If that address has an account, a reset link is on its way.":
    "Jika alamat itu punya akun, tautan atur ulang sedang dikirim.",
  "Email isn't set up on this server, so your building admin has to set a new password for you.":
    "Email belum disiapkan di server ini, jadi admin gedung yang perlu menetapkan kata sandi baru untuk Anda.",
  "Set a new password": "Tetapkan kata sandi baru",
  "Set new password": "Tetapkan kata sandi baru",
  "At least 8 characters.": "Minimal 8 karakter.",
  "Your password is changed. You can sign in with it.":
    "Kata sandi Anda sudah diganti. Anda bisa masuk dengan kata sandi itu.",
  "Saving…": "Menyimpan…",
  "Sending…": "Mengirim…",

  // Report form
  "Report damage": "Laporkan kerusakan",
  "No account needed. For fire, injury or anything dangerous, leave the area and call building security first. This form is not monitored for emergencies.":
    "Tidak perlu akun. Untuk kebakaran, cedera, atau hal berbahaya, tinggalkan area dan hubungi keamanan gedung dulu. Formulir ini tidak dipantau untuk keadaan darurat.",
  "Where is the damage?": "Di mana kerusakannya?",
  "Choose a location": "Pilih lokasi",
  "Somewhere else": "Tempat lain",
  "Describe the location": "Jelaskan lokasinya",
  "Floor 2, west corridor": "Lantai 2, koridor barat",
  "What did you see?": "Apa yang Anda lihat?",
  "Water dripping from the ceiling near the lift":
    "Air menetes dari plafon di dekat lift",
  Photos: "Foto",
  "Up to {count} photos, JPEG, PNG or WebP, 10 MB each. Avoid showing people's faces.":
    "Maksimal {count} foto, JPEG, PNG, atau WebP, masing-masing 10 MB. Hindari menampilkan wajah orang.",
  "Email (optional)": "Email (opsional)",
  "We only use it to tell you when the status changes, and to send a new status link if you lose yours.":
    "Kami hanya memakainya untuk memberi tahu perubahan status, dan mengirim tautan status baru jika tautan Anda hilang.",
  "Submit report": "Kirim laporan",
  "Sending report…": "Mengirim laporan…",
  "Opening your report…": "Membuka laporan Anda…",
  "Report sent": "Laporan terkirim",
  "Your reference is {reference}. The building team will review it.":
    "Nomor referensi Anda {reference}. Tim gedung akan memeriksanya.",
  "Open it now, because this link isn't shown again. After that, the status page stays available on this device at /status.":
    "Buka sekarang, karena tautan ini tidak ditampilkan lagi. Setelah itu, halaman status tetap tersedia di perangkat ini di /status.",
  "View status": "Lihat status",
  "Record a voice note": "Rekam pesan suara",
  "Recording. Up to one minute.": "Merekam. Maksimal satu menit.",
  "Stop recording": "Berhenti merekam",
  "Writing it down…": "Menuliskannya…",
  "We write it down for you to check. The recording isn't kept.":
    "Kami menuliskannya agar bisa Anda periksa. Rekamannya tidak disimpan.",

  // Reporter status page
  "Report status": "Status laporan",
  "Last update": "Pembaruan terakhir",
  Reference: "Referensi",
  Received: "Diterima",
  "In review": "Sedang ditinjau",
  "Being repaired": "Sedang diperbaiki",
  Resolved: "Selesai",
  "Closed without repair": "Ditutup tanpa perbaikan",
  "Waiting for the reporter": "Menunggu pelapor",
  "The building team has your report and will review it.":
    "Tim gedung sudah menerima laporan Anda dan akan memeriksanya.",
  "The building team is deciding what work is needed.":
    "Tim gedung sedang menentukan pekerjaan yang diperlukan.",
  "The work has been handed to the repair team.":
    "Pekerjaan sudah diserahkan ke tim perbaikan.",
  "A supervisor checked the repair and closed the report.":
    "Supervisor sudah memeriksa perbaikan dan menutup laporan.",
  "The building team closed this report without repair work.":
    "Tim gedung menutup laporan ini tanpa pekerjaan perbaikan.",
  "The building team has a question": "Tim gedung punya pertanyaan",
  "Question from the building team": "Pertanyaan dari tim gedung",
  "Your answer": "Jawaban Anda",
  "Send answer": "Kirim jawaban",
  "You answered this question": "Anda sudah menjawab pertanyaan ini",
  "Your report": "Laporan Anda",
  "This status link isn't available": "Tautan status ini tidak tersedia",
  "It may have expired or been replaced. Ask the building team if you need an update.":
    "Tautannya mungkin kedaluwarsa atau sudah diganti. Tanyakan ke tim gedung jika Anda perlu kabar terbaru.",
  "Ask for a new one": "Minta tautan baru",
  "Get a new status link": "Dapatkan tautan status baru",
  "The address you gave when you sent the report. Without one, ask the building team for a new link.":
    "Alamat yang Anda berikan saat mengirim laporan. Jika tidak ada, minta tautan baru ke tim gedung.",
  "Send my links": "Kirim tautan saya",
  "If a report was sent with that address, new links are on their way. Your old links keep working.":
    "Jika ada laporan dengan alamat itu, tautan baru sedang dikirim. Tautan lama Anda tetap berfungsi.",
  "Email isn't set up on this server. Ask the building team for a new link, and give them your report's reference if you have it.":
    "Email belum disiapkan di server ini. Minta tautan baru ke tim gedung, dan sebutkan nomor referensi laporan Anda jika ada.",

  // Queue, tables and filters
  "Operator queue": "Antrean operator",
  Search: "Cari",
  "Search reports": "Cari laporan",
  Status: "Status",
  "Any status": "Semua status",
  Category: "Kategori",
  "Any category": "Semua kategori",
  Priority: "Prioritas",
  "Any priority": "Semua prioritas",
  Site: "Lokasi",
  Loading: "Memuat",
  Clear: "Hapus",
  Ticket: "Tiket",
  Report: "Laporan",
  Location: "Lokasi",
  "Location not set": "Lokasi belum diisi",
  "Not set": "Belum diisi",
  Unknown: "Tidak diketahui",
  "Open ticket": "Buka tiket",
  "Open this report": "Buka laporan ini",
  "No open tickets.": "Tidak ada tiket terbuka.",
  "Nothing assigned to you": "Belum ada pekerjaan untuk Anda",
  "Work appears here when an operator assigns it to you.":
    "Pekerjaan muncul di sini saat operator menugaskannya kepada Anda.",
  "Nothing to verify": "Tidak ada yang perlu diverifikasi",
  "Work appears here when a technician submits completion proof.":
    "Pekerjaan muncul di sini saat teknisi mengirim bukti penyelesaian.",
  "Awaiting your verification": "Menunggu verifikasi Anda",
  "No closed work yet": "Belum ada pekerjaan yang ditutup",
  "Tickets you verify move here, and you can reopen them from their page.":
    "Tiket yang Anda verifikasi pindah ke sini, dan bisa dibuka kembali dari halamannya.",

  // Ticket: next step and triage
  "Your next step": "Langkah Anda berikutnya",
  "No action is needed from you right now.":
    "Saat ini Anda belum perlu melakukan apa pun.",
  "Confirm triage": "Konfirmasi triase",
  Summary: "Ringkasan",
  "Keep the reporter's description": "Pakai deskripsi dari pelapor",
  "Choose a category": "Pilih kategori",
  "Choose a priority": "Pilih prioritas",
  "Choose a site": "Pilih lokasi",
  "Assign the work": "Tugaskan pekerjaan",
  "Assign technician": "Tugaskan teknisi",
  "Assigning…": "Menugaskan…",
  "Choose a technician": "Pilih teknisi",
  "Due by": "Tenggat",
  "Due by, WIB (optional)": "Tenggat, WIB (opsional)",
  "Due {date}": "Tenggat {date}",
  "Overdue since {date}": "Lewat tenggat sejak {date}",
  "(overdue)": "(lewat tenggat)",
  "Accept work": "Terima pekerjaan",
  "Start work": "Mulai kerjakan",
  "Resume work": "Lanjutkan pekerjaan",
  "Can't continue yet?": "Belum bisa dilanjutkan?",
  "Pause the work": "Jeda pekerjaan",
  "Choose what's blocking the work": "Pilih yang menghambat pekerjaan",
  "Waiting for": "Menunggu",
  Parts: "Suku cadang",
  "Access to the area": "Akses ke area",
  "What's needed": "Yang dibutuhkan",
  "What's stopping you?": "Apa yang menghambat Anda?",
  "Check again on (WIB)": "Periksa lagi pada (WIB)",
  "Cancel this ticket": "Batalkan tiket ini",
  "Cancel ticket": "Batalkan tiket",
  "Cancelling…": "Membatalkan…",
  "Reason for cancelling": "Alasan pembatalan",
  Reason: "Alasan",
  "Your reason": "Alasan Anda",
  Why: "Alasan",
  "Waiting for a decision": "Menunggu keputusan",
  "Reporter answered": "Pelapor sudah menjawab",
  "The reporter answered": "Pelapor sudah menjawab",
  Reporter: "Pelapor",
  "Back to triage": "Kembali ke triase",

  // Ticket: questions to the reporter
  "Need more from the reporter?": "Perlu info tambahan dari pelapor?",
  "Ask the reporter": "Tanya pelapor",
  "Asking again…": "Menanyakan lagi…",
  "Question for the reporter": "Pertanyaan untuk pelapor",
  "Questions to the reporter": "Pertanyaan untuk pelapor",
  "The reporter sees this exactly as you write it, on their status page.":
    "Pelapor melihat ini persis seperti yang Anda tulis, di halaman statusnya.",
  "The report stays here until they answer. You can also continue without one.":
    "Laporan tetap di sini sampai mereka menjawab. Anda juga bisa melanjutkan tanpa jawaban.",
  "Waiting for the reporter's answer.": "Menunggu jawaban pelapor.",
  "Read the answer, then return this report to triage. AI prepares a new suggestion that includes it.":
    "Baca jawabannya, lalu kembalikan laporan ini ke triase. AI menyiapkan saran baru yang memuat jawaban itu.",
  "Closed without an answer.": "Ditutup tanpa jawaban.",
  "Continue without an answer": "Lanjutkan tanpa jawaban",
  "Why continue without an answer": "Alasan melanjutkan tanpa jawaban",

  // Ticket: AI suggestion
  "AI suggestion": "Saran AI",
  "AI suggestions": "Saran AI",
  "AI suggestion ready": "Saran AI siap",
  "AI suggestion requested again": "Saran AI diminta lagi",
  "AI suggestion from {model}. Check it against the report and photos.":
    "Saran AI dari {model}. Cocokkan dengan laporan dan fotonya.",
  "AI suggestion, not verified. Possibly missing: {fields}.":
    "Saran AI, belum diverifikasi. Mungkin belum ada: {fields}.",
  "AI suggested area: {label}. It's a pointer, not a measurement.":
    "Area yang disarankan AI: {label}. Ini penunjuk, bukan hasil ukur.",
  "Report photo with the AI suggested area marked: {label}":
    "Foto laporan dengan area saran AI yang ditandai: {label}",
  "Preparing a suggestion. You don't have to wait: you can triage this report by hand now.":
    "Sedang menyiapkan saran. Anda tidak perlu menunggu: laporan ini bisa ditriase manual sekarang.",
  "Still being prepared": "Masih disiapkan",
  "Failed, triage by hand": "Gagal, triase manual",
  "No suggestion is available for this report. Please triage it by hand.":
    "Tidak ada saran untuk laporan ini. Silakan triase manual.",
  "The suggestion couldn't be prepared. You can try again, or triage this report by hand.":
    "Saran gagal disiapkan. Anda bisa mencoba lagi, atau triase laporan ini manual.",
  "Try again": "Coba lagi",
  "Something went wrong": "Terjadi kesalahan",
  "This page didn't load. Try again, or come back in a moment.":
    "Halaman ini gagal dimuat. Coba lagi, atau kembali sebentar lagi.",
  "As the reporter described": "Seperti yang dijelaskan pelapor",
  "Said by the reporter": "Dikatakan pelapor",
  "Visible in the photos": "Terlihat di foto",
  "Inferred, not confirmed": "Diperkirakan, belum dikonfirmasi",
  "Missing information": "Informasi yang kurang",
  "Limits of this suggestion": "Batasan saran ini",
  "Reporter-provided": "Dari pelapor",
  "Operator-reviewed": "Ditinjau operator",

  // Ticket: completion and proof
  "Completion proof": "Bukti penyelesaian",
  "Submit completion": "Kirim penyelesaian",
  "Submitting…": "Mengirim…",
  "What did you do?": "Apa yang Anda kerjakan?",
  "Before you finish": "Sebelum selesai",
  "I can't confirm everything or add a photo":
    "Saya tidak bisa mengonfirmasi semuanya atau menambahkan foto",
  "Why it can't all be confirmed:": "Alasan tidak semua bisa dikonfirmasi:",
  "A supervisor reads this and decides. Without a photo, they can't close the work yet.":
    "Supervisor membaca ini lalu memutuskan. Tanpa foto, pekerjaan belum bisa ditutup.",
  "Up to {count} photos showing the finished repair. A supervisor reviews them before the work closes.":
    "Maksimal {count} foto hasil perbaikan. Supervisor memeriksanya sebelum pekerjaan ditutup.",
  "Exception requested": "Pengecualian diminta",
  "With an exception": "Dengan pengecualian",
  "No photo was added.": "Tidak ada foto yang ditambahkan.",
  "Proof photos": "Foto bukti",
  "Proof photo": "Foto bukti",
  "Report photo": "Foto laporan",
  "Before photo": "Foto sebelum",
  "Linked report photo": "Foto laporan tertaut",
  "Before, from the report": "Sebelum, dari laporan",
  "After, from the technician": "Sesudah, dari teknisi",
  "Review the proof": "Periksa bukti",
  "Verify completion": "Verifikasi penyelesaian",
  "Request corrected proof": "Minta perbaikan bukti",
  Verified: "Terverifikasi",
  Rejected: "Ditolak",
  "Not verified": "Belum diverifikasi",
  Confirmed: "Terkonfirmasi",
  "Not confirmed": "Belum dikonfirmasi",
  Sent: "Terkirim",
  "Not needed": "Tidak diperlukan",
  Reopen: "Buka kembali",
  "Reopen ticket": "Buka kembali tiket",
  "Reopening…": "Membuka kembali…",
  "Why reopen this work?": "Mengapa pekerjaan ini dibuka kembali?",
  "Why this is a new problem": "Mengapa ini masalah baru",
  "The leak has stopped with the water running":
    "Kebocoran berhenti saat air dialirkan",
  "The area is dry and clean": "Area kering dan bersih",
  "I found no new damage nearby": "Tidak ada kerusakan baru di sekitarnya",
  "It works when tested": "Berfungsi saat diuji",
  "No wiring or live parts are left exposed":
    "Tidak ada kabel atau bagian bertegangan yang terbuka",
  "Covers and panels are back in place":
    "Penutup dan panel sudah terpasang kembali",
  "The unit runs when tested": "Unit menyala saat diuji",
  "Nothing is dripping from the unit": "Tidak ada tetesan dari unit",
  "Filters and covers are back in place":
    "Filter dan penutup sudah terpasang kembali",
  "The damaged surface is repaired or replaced":
    "Permukaan yang rusak sudah diperbaiki atau diganti",
  "The repair is secure and nothing is loose":
    "Perbaikan kokoh dan tidak ada yang longgar",
  "The work area is clean": "Area kerja bersih",
  "The reported problem is fixed": "Masalah yang dilaporkan sudah diperbaiki",

  // Ticket: AI comparison of the proof
  "AI comparison": "Perbandingan AI",
  "AI comparison ready": "Perbandingan AI siap",
  "AI comparison from {model}. It can't confirm a repair, and the decision is yours.":
    "Perbandingan AI dari {model}. AI tidak bisa memastikan perbaikan, dan keputusan ada di tangan Anda.",
  "AI is comparing the photos. You don't have to wait to decide.":
    "AI sedang membandingkan foto. Anda tidak perlu menunggu untuk memutuskan.",
  "The AI comparison isn't available. Review the photos yourself.":
    "Perbandingan AI tidak tersedia. Periksa fotonya sendiri.",
  "Looks like the same place": "Tampak di tempat yang sama",
  "Looks like a different place or object":
    "Tampak di tempat atau objek yang berbeda",
  "Can't tell from the photos": "Tidak bisa dipastikan dari foto",
  "Not visible in the new photos": "Tidak terlihat di foto baru",
  "Still visible in the new photos": "Masih terlihat di foto baru",
  "Not shown in the proof": "Tidak ditampilkan dalam bukti",
  "What the photos show": "Yang terlihat di foto",
  "Limits of this comparison": "Batasan perbandingan ini",
  "Reported problem": "Masalah yang dilaporkan",

  // Ticket: duplicates, notes and status links
  "Possible duplicates": "Kemungkinan duplikat",
  "Same problem as another ticket?": "Masalah yang sama dengan tiket lain?",
  "Choose a ticket": "Pilih tiket",
  "Ticket for the same problem": "Tiket untuk masalah yang sama",
  "Why they match": "Alasan keduanya sama",
  "Link as duplicate": "Tautkan sebagai duplikat",
  "Linking…": "Menautkan…",
  "Linked as a duplicate": "Ditautkan sebagai duplikat",
  "Duplicate report linked": "Laporan duplikat ditautkan",
  "Duplicate link removed": "Tautan duplikat dihapus",
  "Linked because:": "Ditautkan karena:",
  "Linked reports": "Laporan tertaut",
  "1 linked report": "1 laporan tertaut",
  "{count} linked reports": "{count} laporan tertaut",
  "Remove link": "Hapus tautan",
  "Removing…": "Menghapus…",
  "This report stays on record and its reporter follows the other ticket's progress.":
    "Laporan ini tetap tercatat dan pelapornya mengikuti progres tiket lainnya.",
  "The repair is tracked on the other ticket. This report's reporter follows that ticket's progress.":
    "Perbaikan dicatat di tiket lain. Pelapor laporan ini mengikuti progres tiket tersebut.",
  "Internal notes": "Catatan internal",
  "Internal note added": "Catatan internal ditambahkan",
  "Add a note": "Tambah catatan",
  "Save note": "Simpan catatan",
  "Your team can read these. The reporter never sees them.":
    "Tim Anda bisa membacanya. Pelapor tidak pernah melihatnya.",
  "New status link": "Tautan status baru",
  "Create a new status link": "Buat tautan status baru",
  "Creating…": "Membuat…",
  "Send this to the reporter now. It isn't shown again, and their old link has stopped working.":
    "Kirim ini ke pelapor sekarang. Tautan ini tidak ditampilkan lagi, dan tautan lamanya sudah tidak berfungsi.",

  // Ticket: history
  History: "Riwayat",
  "Report photo upload failed": "Unggah foto laporan gagal",
  "Completion photo upload failed": "Unggah foto penyelesaian gagal",
  "Receipt email failed": "Email tanda terima gagal",
  "Status link recovery failed": "Pemulihan tautan status gagal",

  // Overview
  "Work overview": "Ringkasan pekerjaan",
  "New work and verified closes": "Pekerjaan baru dan penutupan terverifikasi",
  "New: {opened}. Verified closed: {verified}.":
    "Baru: {opened}. Ditutup terverifikasi: {verified}.",
  "New tickets": "Tiket baru",
  "Verified closes": "Penutupan terverifikasi",
  "1 open ticket": "1 tiket terbuka",
  "{count} open tickets": "{count} tiket terbuka",
  "1 ticket in view": "1 tiket ditampilkan",
  "{count} tickets in view": "{count} tiket ditampilkan",
  Member: "Anggota",
  Active: "Aktif",
  "Name or email": "Nama atau email",
  "No matching members": "Tidak ada anggota yang cocok",
  "1 member in view": "1 anggota ditampilkan",
  "{count} members in view": "{count} anggota ditampilkan",
  Role: "Peran",
  "Any role": "Semua peran",
  "Nothing is open right now.": "Saat ini tidak ada yang terbuka.",
  "The oldest open ticket has waited {age} and {state}.":
    "Tiket terbuka tertua sudah menunggu {age} dan {state}.",
  "No reports yet": "Belum ada laporan",
  "Figures appear here once someone sends a report from a site's report form.":
    "Angka muncul di sini setelah seseorang mengirim laporan dari formulir lokasi.",
  "1 report in the last {days} days": "1 laporan dalam {days} hari terakhir",
  "{count} reports in the last {days} days":
    "{count} laporan dalam {days} hari terakhir",
  "1 linked as a duplicate": "1 ditautkan sebagai duplikat",
  "{count} linked as duplicates": "{count} ditautkan sebagai duplikat",
  "{count} cancelled": "{count} dibatalkan",
  "Linked duplicates count as reports, not as work.":
    "Duplikat tertaut dihitung sebagai laporan, bukan pekerjaan.",
  "Where open work sits": "Posisi pekerjaan terbuka",
  "Open tickets": "Tiket terbuka",
  "open ticket": "tiket terbuka",
  "open tickets": "tiket terbuka",
  "oldest {age}": "tertua {age}",
  "Age of open work": "Usia pekerjaan terbuka",
  "Technician workload": "Beban kerja teknisi",
  "No technician holds open work.":
    "Tidak ada teknisi yang memegang pekerjaan terbuka.",
  "Oldest open tickets": "Tiket terbuka tertua",
  "Since the report": "Sejak dilaporkan",
  "Not triaged yet": "Belum ditriase",
  "Time to triage": "Waktu sampai triase",
  "Time to verified close": "Waktu sampai ditutup terverifikasi",
  "Median of {count}{range}. {open} still open.":
    "Median dari {count}{range}. {open} masih terbuka.",
  "Median of {count}{range}. {waiting} not triaged.":
    "Median dari {count}{range}. {waiting} belum ditriase.",
  ", range {low} to {high}": ", rentang {low} sampai {high}",
  "Nothing closed yet. {count} open.":
    "Belum ada yang ditutup. {count} terbuka.",
  "Nothing triaged yet. {count} waiting.":
    "Belum ada yang ditriase. {count} menunggu.",
  "Outcomes, last {days} days": "Hasil, {days} hari terakhir",
  "Last {days} days": "{days} hari terakhir",
  "Verified within {days} days": "Terverifikasi dalam {days} hari",
  "Reopened within {days} days": "Dibuka kembali dalam {days} hari",
  "{numerator} of {denominator}": "{numerator} dari {denominator}",
  "{count} still within {days} days.": "{count} masih dalam {days} hari.",
  "1 ticket observed for {days} full days.":
    "1 tiket diamati selama {days} hari penuh.",
  "{count} tickets observed for {days} full days.":
    "{count} tiket diamati selama {days} hari penuh.",
  "1 closure observed for {days} full days.":
    "1 penutupan diamati selama {days} hari penuh.",
  "{count} closures observed for {days} full days.":
    "{count} penutupan diamati selama {days} hari penuh.",
  "No ticket has had {days} full days yet.":
    "Belum ada tiket yang mencapai {days} hari penuh.",
  "No closure has had {days} full days yet.":
    "Belum ada penutupan yang mencapai {days} hari penuh.",
  "No tickets in this period.": "Tidak ada tiket pada periode ini.",
  "No reports in this period.": "Tidak ada laporan pada periode ini.",
  "Tickets by category": "Tiket per kategori",
  "Reports by location": "Laporan per lokasi",
  "Other places": "Tempat lain",
};
