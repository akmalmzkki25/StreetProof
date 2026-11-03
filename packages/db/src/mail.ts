import type { ReporterNotice } from "@streetproof/domain";
import nodemailer from "nodemailer";

export type Mail = { to: string; subject: string; text: string };
export type SendMail = (mail: Mail) => Promise<void>;

// Null when no mail server is set. Callers then skip email, and nothing else
// depends on it: every status is still on the status page.
export function createMailer(
  env: NodeJS.ProcessEnv = process.env,
): SendMail | null {
  if (!env.SMTP_URL || !env.MAIL_FROM) return null;
  const transport = nodemailer.createTransport(env.SMTP_URL);
  const from = env.MAIL_FROM;
  return async function sendMail(mail) {
    await transport.sendMail({ from, ...mail });
  };
}

const NOTICE_TEXT: Record<ReporterNotice, { id: string; en: string }> = {
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
};

function statusUrl(appUrl: string, token: string) {
  return `${appUrl}/status#t=${token}`;
}

// Reporters may write in either language, so every message carries both.
export function statusNoticeMail(input: {
  to: string;
  reference: string;
  notice: ReporterNotice;
  appUrl: string;
}): Mail {
  const text = NOTICE_TEXT[input.notice];
  return {
    to: input.to,
    subject: `Laporan / Report ${input.reference}`,
    text: [
      text.id,
      `Referensi: ${input.reference}`,
      `Kehilangan link status? ${input.appUrl}/status/recover`,
      "",
      text.en,
      `Reference: ${input.reference}`,
      `Lost your status link? ${input.appUrl}/status/recover`,
    ].join("\n"),
  };
}

export function receiptMail(input: {
  to: string;
  reference: string;
  token: string;
  appUrl: string;
}): Mail {
  const url = statusUrl(input.appUrl, input.token);
  return {
    to: input.to,
    subject: `Laporan diterima / Report received: ${input.reference}`,
    text: [
      `Laporan Anda diterima. Referensi: ${input.reference}`,
      `Pantau statusnya di link pribadi ini: ${url}`,
      "",
      `Your report was received. Reference: ${input.reference}`,
      `Follow it at this private link: ${url}`,
    ].join("\n"),
  };
}

export function recoveryMail(input: {
  to: string;
  links: readonly { reference: string; token: string }[];
  appUrl: string;
}): Mail {
  const lines = input.links.map(
    (link) => `${link.reference}: ${statusUrl(input.appUrl, link.token)}`,
  );
  return {
    to: input.to,
    subject: "Link status laporan / Your report status links",
    text: [
      "Ini link status baru untuk laporan Anda. Abaikan email ini kalau Anda tidak memintanya.",
      "Here are new status links for your reports. Ignore this email if you didn't ask for it.",
      "",
      ...lines,
    ].join("\n"),
  };
}

// To staff, who may read either language, so it carries both like the rest.
export function deadlineMail(input: {
  to: string;
  kind: "due_soon" | "overdue";
  title: string;
  location: string;
  due: string;
  ticketUrl: string;
}): Mail {
  const isOverdue = input.kind === "overdue";
  return {
    to: input.to,
    subject: isOverdue
      ? `Lewat tenggat / Overdue: ${input.title}`
      : `Tenggat dekat / Due soon: ${input.title}`,
    text: [
      isOverdue
        ? `Pekerjaan ini melewati tenggat ${input.due}.`
        : `Pekerjaan ini bertenggat ${input.due}.`,
      isOverdue
        ? `This work passed its deadline of ${input.due}.`
        : `This work is due by ${input.due}.`,
      "",
      input.title,
      ...(input.location ? [input.location] : []),
      input.ticketUrl,
    ].join("\n"),
  };
}

export function passwordResetMail(input: { to: string; url: string }): Mail {
  return {
    to: input.to,
    subject:
      "Atur ulang password StreetProof / Reset your StreetProof password",
    text: [
      `Buka link ini untuk mengatur password baru: ${input.url}`,
      "Abaikan email ini kalau Anda tidak memintanya.",
      "",
      `Open this link to set a new password: ${input.url}`,
      "Ignore this email if you didn't ask for it.",
    ].join("\n"),
  };
}
