import { getDb, listSitesWithLocations } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Link } from "@/components/locale-link";
import { PrintButton } from "@/features/sites/components/print-button";
import { QrCode } from "@/features/sites/components/qr-code";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/member";
import { telegramUrl } from "@/lib/telegram";

export const metadata: Metadata = {
  title: "QR poster",
  robots: { index: false, follow: false },
};

export default function SitePosterPage({
  params,
}: PageProps<"/[lang]/print/sites/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="m-8 h-[80vh]" />}>
      <Poster idPromise={params.then((value) => value.id)} />
    </Suspense>
  );
}

// Printed and taped up in a lobby, so it speaks both languages at once and
// stays on paper colours whatever theme the screen uses.
async function Poster({ idPromise }: { idPromise: Promise<string> }) {
  const member = await requireRole("tenant_admin");
  const id = await idPromise;
  const { t } = await getI18n();
  const sites = await listSitesWithLocations(getDb(), member.tenantId);
  const site = sites.find((item) => item.id === id);
  if (!site?.intakeCode || !site.active) notFound();

  const reportUrl = `${process.env.APP_URL ?? ""}/report/${site.intakeCode}`;
  const telegramLink = telegramUrl(`s_${site.intakeCode}`);

  return (
    <div className="flex min-h-svh flex-col items-center gap-6 bg-background px-4 py-8 print:p-0">
      <div className="flex w-full max-w-[210mm] items-center justify-between gap-3 print:hidden">
        <Link
          href="/app/sites"
          className="type-caption text-brand-text underline underline-offset-4"
        >
          {t("Back to sites")}
        </Link>
        <PrintButton />
      </div>

      <article className="light flex w-full max-w-[210mm] flex-col items-center gap-8 rounded-4xl bg-background px-10 py-14 text-center text-foreground shadow-card print:rounded-none print:shadow-none">
        <header className="flex flex-col gap-3">
          <p className="type-label-mono text-muted-foreground">{site.name}</p>
          <h1 className="type-display">Laporkan kerusakan</h1>
          <p className="type-lead text-muted-foreground">Report damage</p>
        </header>

        <QrCode
          value={reportUrl}
          label={t("QR code for this building's report form")}
          className="size-72"
        />
        <p className="font-mono text-sm break-all">{reportUrl}</p>

        <div className="grid w-full gap-6 text-left sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="font-medium">Pindai, pilih lokasi, foto, kirim.</p>
            <p className="text-muted-foreground">
              Tanpa akun. Anda akan mendapat link untuk memantau perbaikannya.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              Scan, choose the spot, add a photo, send.
            </p>
            <p className="text-muted-foreground">
              No account needed. You get a link to follow the repair.
            </p>
          </div>
        </div>

        {telegramLink ? (
          <div className="flex items-center gap-5 rounded-4xl bg-card p-5 text-left shadow-card">
            <QrCode
              value={telegramLink}
              label={t("QR code for reporting on Telegram")}
              className="size-28 shrink-0"
            />
            <div className="flex flex-col gap-1">
              <p className="font-medium">Lewat Telegram / On Telegram</p>
              <p className="type-caption text-muted-foreground">
                Kirim laporan dan terima kabarnya di chat. Send the report and
                get updates in a chat.
              </p>
            </div>
          </div>
        ) : null}

        <p className="type-caption text-muted-foreground">
          Untuk kebakaran, cedera, atau bahaya lain, tinggalkan area dan hubungi
          keamanan gedung. For fire, injury or danger, leave the area and call
          building security.
        </p>
      </article>
    </div>
  );
}
