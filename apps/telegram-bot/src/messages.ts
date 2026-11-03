import type { TelegramLocale } from "@streetproof/db";
import type { ReporterStage } from "@streetproof/domain";

const MESSAGES = {
  help: {
    en: "StreetProof turns damage reports into repair work.\n\nTo report damage, open your building's report link or scan its QR code, then choose Telegram.\n\n/status shows reports you follow\n/work shows your assigned work\n/reviews shows proof waiting for a decision\n/cancel stops what you're doing\n/stop disconnects this chat",
    id: "StreetProof mengubah laporan kerusakan menjadi pekerjaan perbaikan.\n\nUntuk melapor, buka link laporan gedung Anda atau pindai kode QR-nya, lalu pilih Telegram.\n\n/status menampilkan laporan yang Anda ikuti\n/work menampilkan tugas Anda\n/reviews menampilkan bukti yang menunggu keputusan\n/cancel menghentikan yang sedang berjalan\n/stop memutus chat ini",
  },
  linkExpired: {
    en: "This link has expired or was already used. Make a new one in StreetProof.",
    id: "Link ini sudah kedaluwarsa atau sudah dipakai. Buat yang baru di StreetProof.",
  },
  memberLinked: {
    en: "Connected, {name}. You'll get your work here. /work shows what's assigned to you.",
    id: "Terhubung, {name}. Pekerjaan Anda akan dikirim ke sini. /work menampilkan tugas Anda.",
  },
  reportFollowed: {
    en: "You'll get updates on report {reference} here. /stop turns them off.",
    id: "Kabar laporan {reference} akan dikirim ke sini. /stop untuk mematikannya.",
  },
  siteUnavailable: {
    en: "This report link isn't available.",
    id: "Link laporan ini tidak tersedia.",
  },
  reportIntro: {
    en: "Report damage at {site}.\n\nFor fire, injury or anything dangerous, leave the area and call building security first. This chat is not monitored for emergencies.\n\nWhere is the damage?",
    id: "Laporkan kerusakan di {site}.\n\nUntuk kebakaran, cedera, atau hal berbahaya lainnya, tinggalkan area dan hubungi keamanan gedung lebih dulu. Chat ini tidak dipantau untuk keadaan darurat.\n\nDi mana kerusakannya?",
  },
  somewhereElse: { en: "Somewhere else", id: "Tempat lain" },
  askLocationText: {
    en: "Describe the location, for example: Floor 2, west corridor.",
    id: "Jelaskan lokasinya, misalnya: Lantai 2, koridor barat.",
  },
  locationTextInvalid: {
    en: "Describe the location in under 200 characters.",
    id: "Jelaskan lokasinya dalam kurang dari 200 karakter.",
  },
  askDescription: {
    en: "What did you see? Type it, or send a voice note.",
    id: "Apa yang Anda lihat? Ketik, atau kirim voice note.",
  },
  descriptionInvalid: {
    en: "Describe the damage in 5 to 2,000 characters.",
    id: "Jelaskan kerusakan dalam 5 sampai 2.000 karakter.",
  },
  askPhotos: {
    en: "Send up to {max} photos of the damage. Avoid showing people's faces.",
    id: "Kirim sampai {max} foto kerusakan. Hindari memotret wajah orang.",
  },
  photoSaved: {
    en: "Photo {count} of {max} saved.",
    id: "Foto {count} dari {max} tersimpan.",
  },
  sendReport: { en: "Send report", id: "Kirim laporan" },
  needPhoto: {
    en: "Send at least one photo first.",
    id: "Kirim minimal satu foto dulu.",
  },
  tooManyPhotos: {
    en: "That's the most photos you can add.",
    id: "Jumlah foto sudah maksimal.",
  },
  photoTooBig: {
    en: "Each photo must be 10 MB or smaller.",
    id: "Setiap foto maksimal 10 MB.",
  },
  photoNotImage: {
    en: "Photos must be JPEG, PNG or WebP images.",
    id: "Foto harus berupa gambar JPEG, PNG, atau WebP.",
  },
  photoUnreadable: {
    en: "That photo can't be read. Try taking it again.",
    id: "Foto itu tidak bisa dibaca. Coba ambil lagi.",
  },
  photoSaveFailed: {
    en: "We couldn't save that photo. Please try again.",
    id: "Foto itu gagal disimpan. Silakan coba lagi.",
  },
  voiceNotAvailable: {
    en: "Voice notes aren't available here. Please type it instead.",
    id: "Voice note tidak tersedia di sini. Silakan ketik saja.",
  },
  voiceTooLong: {
    en: "Keep voice notes under a minute, or type it instead.",
    id: "Voice note maksimal satu menit, atau ketik saja.",
  },
  voiceTooMany: {
    en: "Too many voice notes. Please type it instead.",
    id: "Terlalu banyak voice note. Silakan ketik saja.",
  },
  voiceNotUnderstood: {
    en: "We couldn't make that out. Please try again, or type it.",
    id: "Suaranya tidak terbaca. Silakan coba lagi, atau ketik saja.",
  },
  voiceConfirm: {
    en: 'We heard:\n\n"{text}"\n\nUse this? Or type it the way you want it.',
    id: 'Yang kami dengar:\n\n"{text}"\n\nPakai ini? Atau ketik sesuai keinginan Anda.',
  },
  useThis: { en: "Use this", id: "Pakai ini" },
  reportSent: {
    en: "Report sent. Your reference is {reference}. The building team will review it, and you'll get updates here.\n\nYour private status page, for this chat only:\n{url}",
    id: "Laporan terkirim. Referensi Anda {reference}. Tim gedung akan meninjaunya, dan kabarnya akan dikirim ke sini.\n\nHalaman status pribadi Anda, hanya untuk chat ini:\n{url}",
  },
  reportFailed: {
    en: "This report couldn't be sent. Start again from your building's report link.",
    id: "Laporan ini gagal dikirim. Mulai lagi dari link laporan gedung Anda.",
  },
  tooManyReports: {
    en: "Too many reports from this chat. Try again in a while.",
    id: "Terlalu banyak laporan dari chat ini. Coba lagi nanti.",
  },
  noReports: {
    en: "This chat isn't following any reports.",
    id: "Chat ini belum mengikuti laporan apa pun.",
  },
  cancelled: { en: "Stopped.", id: "Dihentikan." },
  nothingToCancel: {
    en: "There's nothing to stop.",
    id: "Tidak ada yang perlu dihentikan.",
  },
  disconnected: {
    en: "This chat is disconnected. You won't get any more messages.",
    id: "Chat ini sudah diputus. Anda tidak akan menerima pesan lagi.",
  },
  somethingWrong: {
    en: "Something went wrong. Please try again.",
    id: "Terjadi kesalahan. Silakan coba lagi.",
  },
  staffOnly: {
    en: "Connect your StreetProof account first, from the menu under your name.",
    id: "Hubungkan akun StreetProof Anda dulu, dari menu di bawah nama Anda.",
  },
  noWork: {
    en: "You have no open work.",
    id: "Tidak ada pekerjaan yang terbuka.",
  },
  noReviews: {
    en: "Nothing is waiting for your decision.",
    id: "Tidak ada yang menunggu keputusan Anda.",
  },
  accept: { en: "Accept work", id: "Terima tugas" },
  start: { en: "Start work", id: "Mulai kerjakan" },
  resume: { en: "Resume work", id: "Lanjut kerjakan" },
  sendProof: { en: "Send proof", id: "Kirim bukti" },
  review: { en: "Review proof", id: "Tinjau bukti" },
  accepted: {
    en: "Accepted. Start when you're on site.",
    id: "Diterima. Mulai saat Anda sudah di lokasi.",
  },
  started: {
    en: "Work started. Send proof when it's done.",
    id: "Pekerjaan dimulai. Kirim bukti setelah selesai.",
  },
  checkPrompt: {
    en: "Check {index} of {total}:\n{label}",
    id: "Pemeriksaan {index} dari {total}:\n{label}",
  },
  confirm: { en: "Confirmed", id: "Sudah dipastikan" },
  cantConfirm: { en: "I can't confirm", id: "Tidak bisa dipastikan" },
  useWebForException: {
    en: "To explain why you can't confirm this, so a supervisor can decide, use the web app:\n{url}",
    id: "Untuk menjelaskan alasannya agar supervisor bisa memutuskan, gunakan aplikasi web:\n{url}",
  },
  askNote: {
    en: "What did you do? Write a short note.",
    id: "Apa yang Anda kerjakan? Tulis catatan singkat.",
  },
  noteInvalid: {
    en: "Write the note in 5 to 1,000 characters.",
    id: "Tulis catatan dalam 5 sampai 1.000 karakter.",
  },
  askProofPhotos: {
    en: "Send up to {max} photos of the finished repair.",
    id: "Kirim sampai {max} foto hasil perbaikan.",
  },
  submitProof: { en: "Submit proof", id: "Kirim bukti" },
  proofSent: {
    en: "Proof sent to a supervisor.",
    id: "Bukti sudah dikirim ke supervisor.",
  },
  reviewHeading: { en: "Proof to review", id: "Bukti untuk ditinjau" },
  technician: { en: "Technician", id: "Teknisi" },
  location: { en: "Location", id: "Lokasi" },
  note: { en: "Note", id: "Catatan" },
  noPhotoException: {
    en: "No full proof. Reason given",
    id: "Bukti tidak lengkap. Alasan",
  },
  before: { en: "Before", id: "Sebelum" },
  after: { en: "After", id: "Sesudah" },
  approve: { en: "Verify and close", id: "Verifikasi dan tutup" },
  reject: { en: "Request correction", id: "Minta perbaikan" },
  askApproveReason: {
    en: "Why does this proof pass? Write your reason.",
    id: "Mengapa bukti ini lolos? Tulis alasan Anda.",
  },
  askRejectReason: {
    en: "What needs correcting? Write your reason.",
    id: "Apa yang perlu diperbaiki? Tulis alasan Anda.",
  },
  reasonInvalid: {
    en: "Write the reason in 5 to 500 characters.",
    id: "Tulis alasan dalam 5 sampai 500 karakter.",
  },
  approved: {
    en: "Verified and closed.",
    id: "Terverifikasi dan ditutup.",
  },
  rejected: {
    en: "Sent back to the technician.",
    id: "Dikembalikan ke teknisi.",
  },
  ticketUnavailable: {
    en: "This ticket isn't available.",
    id: "Tiket ini tidak tersedia.",
  },
  staleTicket: {
    en: "Someone else changed this ticket. Check /work or /reviews for the latest.",
    id: "Tiket ini sudah diubah orang lain. Cek /work atau /reviews untuk yang terbaru.",
  },
  notYours: {
    en: "This work is assigned to someone else.",
    id: "Pekerjaan ini ditugaskan ke orang lain.",
  },
  notAllowed: {
    en: "This action isn't allowed for the ticket right now.",
    id: "Tindakan ini belum bisa dilakukan untuk tiket ini.",
  },
  linkedDuplicate: {
    en: "This report is linked as a duplicate, so work happens on the other ticket.",
    id: "Laporan ini ditautkan sebagai duplikat, jadi pekerjaannya ada di tiket lain.",
  },
  selfReview: {
    en: "You submitted this work, so another supervisor has to review it.",
    id: "Anda yang mengirim pekerjaan ini, jadi supervisor lain yang harus meninjaunya.",
  },
  noProofPhoto: {
    en: "This attempt has no photo, so it can't be verified. Request corrected proof instead.",
    id: "Percobaan ini tidak punya foto, jadi tidak bisa diverifikasi. Minta bukti perbaikan saja.",
  },
  flowIdle: {
    en: "Use /help to see what you can do here.",
    id: "Gunakan /help untuk melihat yang bisa dilakukan di sini.",
  },
  sendPhotoNow: {
    en: "Send a photo now, or press the button once you've added them.",
    id: "Kirim foto sekarang, atau tekan tombol setelah selesai.",
  },
  pressAButton: {
    en: "Please answer with one of the buttons above.",
    id: "Silakan jawab dengan salah satu tombol di atas.",
  },
} satisfies Record<string, Record<TelegramLocale, string>>;

export type MessageKey = keyof typeof MESSAGES;

export function allMessages(): readonly Record<TelegramLocale, string>[] {
  return Object.values(MESSAGES);
}

export function t(
  locale: TelegramLocale,
  key: MessageKey,
  params: Record<string, string | number> = {},
) {
  const template: string = MESSAGES[key][locale];
  return template.replace(/\{(\w+)\}/g, function fill(match, name: string) {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

const STAGE_LABELS: Record<ReporterStage, Record<TelegramLocale, string>> = {
  received: { en: "Received", id: "Diterima" },
  in_review: { en: "In review", id: "Sedang ditinjau" },
  in_progress: { en: "Being repaired", id: "Sedang diperbaiki" },
  resolved: { en: "Resolved", id: "Selesai" },
  closed_without_repair: {
    en: "Closed without repair",
    id: "Ditutup tanpa perbaikan",
  },
};

export function stageLabel(stage: ReporterStage, locale: TelegramLocale) {
  return STAGE_LABELS[stage][locale];
}

const CHECKLIST_ID: Record<string, string> = {
  "The leak has stopped with the water running":
    "Kebocoran sudah berhenti saat air dialirkan",
  "The area is dry and clean": "Area sudah kering dan bersih",
  "I found no new damage nearby": "Tidak ada kerusakan baru di sekitarnya",
  "It works when tested": "Berfungsi saat dites",
  "No wiring or live parts are left exposed":
    "Tidak ada kabel atau bagian bertegangan yang terbuka",
  "Covers and panels are back in place":
    "Penutup dan panel sudah terpasang kembali",
  "The unit runs when tested": "Unit menyala saat dites",
  "Nothing is dripping from the unit": "Tidak ada tetesan dari unit",
  "Filters and covers are back in place":
    "Filter dan penutup sudah terpasang kembali",
  "The damaged surface is repaired or replaced":
    "Permukaan yang rusak sudah diperbaiki atau diganti",
  "The repair is secure and nothing is loose":
    "Perbaikan kokoh dan tidak ada yang longgar",
  "The work area is clean": "Area kerja sudah bersih",
  "The reported problem is fixed": "Masalah yang dilaporkan sudah beres",
};

export function checklistLabel(label: string, locale: TelegramLocale) {
  return locale === "id" ? (CHECKLIST_ID[label] ?? label) : label;
}

export function hasChecklistTranslation(label: string) {
  return CHECKLIST_ID[label] !== undefined;
}
