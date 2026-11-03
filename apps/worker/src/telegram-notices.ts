import {
  getTicketHeadline,
  listTelegramRecipients,
  recordTelegramNotice,
  type Db,
  type TelegramAudience,
  type TelegramLocale,
} from "@streetproof/db";
import type {
  SendTelegram,
  TelegramButton,
} from "@streetproof/db/telegram-send";
import { reporterNotice, type TicketStatus } from "@streetproof/domain";

type NoticeEvent = {
  ticketId: string;
  seq: number;
  from: TicketStatus;
  to: TicketStatus;
  revision: number;
  reason: string | null;
};

const REPORTER_TEXT = {
  question: {
    id: "Tim gedung punya pertanyaan tentang laporan Anda. Buka halaman status untuk menjawab.",
    en: "The building team has a question about your report. Open your status page to answer.",
  },
  received: {
    id: "Laporan Anda sudah diterima.",
    en: "Your report has been received.",
  },
  in_review: {
    id: "Tim gedung sedang meninjau laporan Anda.",
    en: "The building team is reviewing your report.",
  },
  in_progress: {
    id: "Pekerjaan perbaikan sudah diserahkan ke tim perbaikan.",
    en: "The work has been handed to the repair team.",
  },
  resolved: {
    id: "Supervisor sudah memeriksa perbaikan dan menutup laporan Anda.",
    en: "A supervisor checked the repair and closed your report.",
  },
  closed_without_repair: {
    id: "Tim gedung menutup laporan Anda tanpa pekerjaan perbaikan.",
    en: "The building team closed your report without repair work.",
  },
} as const;

const STAFF_TEXT: Record<
  Exclude<TelegramAudience, "reporter">,
  Record<TelegramLocale, string>
> = {
  assignee_assigned: {
    id: "Tugas baru untuk Anda.",
    en: "New work for you.",
  },
  assignee_rejected: {
    id: "Supervisor meminta perbaikan pada bukti Anda.",
    en: "A supervisor asked you to correct your proof.",
  },
  assignee_reopened: {
    id: "Supervisor membuka kembali pekerjaan ini.",
    en: "A supervisor reopened this work.",
  },
  supervisor_review: {
    id: "Bukti perbaikan menunggu keputusan Anda.",
    en: "Repair proof is waiting for your decision.",
  },
};

const LABELS = {
  reference: { id: "Referensi", en: "Reference" },
  location: { id: "Lokasi", en: "Location" },
  reason: { id: "Alasan", en: "Reason" },
  accept: { id: "Terima tugas", en: "Accept work" },
  resume: { id: "Lanjut kerjakan", en: "Resume work" },
  review: { id: "Tinjau bukti", en: "Review proof" },
} as const;

function staffButtons(
  audience: Exclude<TelegramAudience, "reporter">,
  locale: TelegramLocale,
  event: NoticeEvent,
): TelegramButton[] {
  const { ticketId, revision } = event;
  switch (audience) {
    case "assignee_assigned":
      return [
        {
          text: LABELS.accept[locale],
          callbackData: `accept:${ticketId}:${revision}`,
        },
      ];
    case "assignee_rejected":
      return [
        {
          text: LABELS.resume[locale],
          callbackData: `resume:${ticketId}:${revision}`,
        },
      ];
    case "supervisor_review":
      return [
        { text: LABELS.review[locale], callbackData: `review:${ticketId}` },
      ];
    case "assignee_reopened":
      return [];
  }
}

// One at a time, so a failure part way retries only those not yet told. A person
// who blocked the bot counts as told: trying again won't reach them.
export async function sendTelegramNotices(
  deps: { db: Db; sendTelegram: SendTelegram; appUrl: string },
  event: NoticeEvent,
) {
  const { db, sendTelegram, appUrl } = deps;
  const recipients = await listTelegramRecipients(db, event);
  if (recipients.length === 0) return;

  const notice = reporterNotice(event.from, event.to);
  const headline = await getTicketHeadline(db, event.ticketId);
  const ticketUrl = `${appUrl}/app/tickets/${event.ticketId}`;

  for (const { chatId, locale, audience, reference } of recipients) {
    const message =
      audience === "reporter"
        ? {
            chatId,
            // Never who is working on it, or why: a reporter sees the collapsed view.
            text: [
              notice ? REPORTER_TEXT[notice][locale] : "",
              `${LABELS.reference[locale]}: ${reference}`,
            ].join("\n"),
          }
        : {
            chatId,
            text: [
              STAFF_TEXT[audience][locale],
              headline?.title ?? "",
              headline?.location
                ? `${LABELS.location[locale]}: ${headline.location}`
                : "",
              audience === "assignee_rejected" && event.reason
                ? `${LABELS.reason[locale]}: ${event.reason}`
                : "",
              ticketUrl,
            ]
              .filter(Boolean)
              .join("\n"),
            buttons: staffButtons(audience, locale, event),
          };
    await sendTelegram(message);
    await recordTelegramNotice(db, {
      chatId,
      ticketId: event.ticketId,
      eventSeq: event.seq,
    });
  }
}
