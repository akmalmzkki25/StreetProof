import { Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getDb, getReporterStatus } from "@streetproof/db";
import type { ReporterStage } from "@streetproof/domain";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@streetproof/ui/components/empty";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Link } from "@/components/locale-link";
import { connection } from "next/server";
import { Suspense } from "react";

import { ClarificationAnswerForm } from "@/features/reporter-status/components/clarification-answer-form";
import { ReceiptExchange } from "@/features/reporter-status/components/receipt-exchange";
import { readReceipt } from "@/features/reporter-status/cookie";
import { FollowOnTelegram } from "@/features/telegram/components/follow-on-telegram";
import { formatDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { isTelegramEnabled } from "@/lib/telegram";

export const metadata: Metadata = {
  title: "Report status",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const STAGE_COPY: Record<ReporterStage, { title: string; detail: string }> = {
  received: {
    title: "Received",
    detail: "The building team has your report and will review it.",
  },
  in_review: {
    title: "In review",
    detail: "The building team is deciding what work is needed.",
  },
  in_progress: {
    title: "Being repaired",
    detail: "The work has been handed to the repair team.",
  },
  resolved: {
    title: "Resolved",
    detail: "A supervisor checked the repair and closed the report.",
  },
  closed_without_repair: {
    title: "Closed without repair",
    detail: "The building team closed this report without repair work.",
  },
};

export default function StatusPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 py-12">
      <Suspense fallback={<Skeleton className="h-10 w-64" />}>
        <StatusHeading />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48" />}>
        <ReceiptExchange>
          <Suspense fallback={<Skeleton className="h-48" />}>
            <ReportStatus />
          </Suspense>
        </ReceiptExchange>
      </Suspense>
    </main>
  );
}

async function StatusHeading() {
  const { t } = await getI18n();
  return <h1 className="type-headline">{t("Report status")}</h1>;
}

async function ReportStatus() {
  await connection();
  const { t, locale } = await getI18n();
  const cookieStore = await cookies();
  const token = readReceipt(cookieStore);
  const status = token ? await getReporterStatus(getDb(), token) : null;

  if (!status) {
    return (
      <Empty className="flex-none rounded-4xl bg-card shadow-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Link01Icon} />
          </EmptyMedia>
          <EmptyTitle>{t("This status link isn't available")}</EmptyTitle>
          <EmptyDescription>
            {t(
              "It may have expired or been replaced. Ask the building team if you need an update.",
            )}
          </EmptyDescription>
        </EmptyHeader>
        <Link
          href="/status/recover"
          className="text-brand-text underline underline-offset-4"
        >
          {t("Get a new status link")}
        </Link>
      </Empty>
    );
  }

  const stage = STAGE_COPY[status.stage];

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-4xl bg-card p-6 shadow-card">
        <p className="type-title">{t(stage.title)}</p>
        <p className="mt-1 text-muted-foreground">{t(stage.detail)}</p>
      </div>
      {status.clarifications.map((item) => (
        <article
          key={item.id}
          aria-label={t("Question from the building team")}
          className="flex flex-col gap-4 rounded-4xl bg-card p-6 shadow-card"
        >
          <div className="flex flex-col gap-1">
            <h2 className="type-title">
              {item.isOpen
                ? t("The building team has a question")
                : t("You answered this question")}
            </h2>
            <p className="whitespace-pre-wrap">{item.question}</p>
          </div>
          {item.isOpen ? (
            <ClarificationAnswerForm clarificationId={item.id} />
          ) : (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {item.answer}
            </p>
          )}
        </article>
      ))}
      {isTelegramEnabled() ? <FollowOnTelegram /> : null}
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        <dt className="text-muted-foreground">{t("Reference")}</dt>
        <dd className="font-mono">{status.reference}</dd>
        <dt className="text-muted-foreground">{t("Site")}</dt>
        <dd>{status.siteName}</dd>
        <dt className="text-muted-foreground">{t("Location")}</dt>
        <dd>{status.location}</dd>
        <dt className="text-muted-foreground">{t("Your report")}</dt>
        <dd className="whitespace-pre-wrap">{status.description}</dd>
        <dt className="text-muted-foreground">{t("Sent")}</dt>
        <dd className="font-mono text-xs">
          {formatDateTime(status.submittedAt, locale, status.timeZone)}
        </dd>
        <dt className="text-muted-foreground">{t("Last update")}</dt>
        <dd className="font-mono text-xs">
          {formatDateTime(status.updatedAt, locale, status.timeZone)}
        </dd>
      </dl>
    </section>
  );
}
