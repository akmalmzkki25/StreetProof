import {
  Clock01Icon,
  Link01Icon,
  Progress04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getDb, getReporterStatus } from "@streetproof/db";
import type { ReporterStage } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
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
import {
  reporterProgress,
  StatusDial,
} from "@/features/reporter-status/components/status-dial";
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

const STAGE_COPY: Record<
  ReporterStage,
  { title: string; detail: string; note?: string }
> = {
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
    note: "If the problem comes back, send a new report.",
  },
  closed_without_repair: {
    title: "Closed without repair",
    detail: "The building team closed this report without repair work.",
    note: "If the problem is still there, send a new report.",
  },
};

export default function StatusPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12 sm:px-8 print:min-h-0 print:py-0">
      <Suspense fallback={<Skeleton className="h-10 w-64" />}>
        <StatusHeading />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 md:max-w-lg" />}>
        <ReceiptExchange>
          <Suspense fallback={<Skeleton className="h-48 md:max-w-lg" />}>
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
      <Empty className="flex-none rounded-4xl bg-card shadow-card md:max-w-lg">
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
  const { step, total } = reporterProgress(status.stage);
  const openQuestions = status.clarifications.filter((item) => item.isOpen);
  const answeredQuestions = status.clarifications.filter(
    (item) => !item.isOpen,
  );
  const dialLabel =
    status.stage === "closed_without_repair"
      ? t("Report progress: closed without repair")
      : t("Report progress: step {step} of {total}", { step, total });

  function leadFor(reporterStage: ReporterStage) {
    if (reporterStage === "resolved") return t("All done.");
    if (reporterStage === "closed_without_repair") {
      return t("Closed without repair.");
    }
    return t("Nothing needed from you.");
  }

  const caption = (
    <div className="flex flex-col gap-1.5">
      <p className="font-medium">{t(stage.title)}</p>
      <p className="type-caption flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={Progress04Icon} size={16} aria-hidden />
          {t("Step {step} of {total}", { step, total })}
        </span>
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={Clock01Icon} size={16} aria-hidden />
          {t("Updated {time}", {
            time: formatDateTime(status.updatedAt, locale, status.timeZone),
          })}
        </span>
      </p>
    </div>
  );

  return (
    <section className="grid gap-12 md:grid-cols-2 md:items-start">
      <div className="flex flex-col gap-6">
        {openQuestions.length > 0 ? (
          openQuestions.map((item) => (
            <article
              key={item.id}
              aria-label={t("Question from the building team")}
              className="flex flex-col gap-5 rounded-4xl bg-card p-6 shadow-card ring-1 ring-brand/50"
            >
              <div className="flex flex-col gap-3">
                <Badge variant="brand" className="self-start">
                  {t("Needs your answer")}
                </Badge>
                <h2 className="type-title">
                  {t("The building team has a question")}
                </h2>
                <p className="whitespace-pre-wrap">{item.question}</p>
              </div>
              <div className="print:hidden">
                <ClarificationAnswerForm clarificationId={item.id} />
              </div>
            </article>
          ))
        ) : (
          <div className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card">
            <p className="type-headline">{leadFor(status.stage)}</p>
            <p className="text-muted-foreground">
              {t(stage.detail)}
              {stage.note ? ` ${t(stage.note)}` : null}
            </p>
          </div>
        )}
        <div className="flex items-center gap-4 rounded-4xl bg-card p-4 pr-6 shadow-card md:hidden">
          <StatusDial
            stage={status.stage}
            label={dialLabel}
            idPrefix="status-mobile"
            className="w-28 shrink-0 sm:w-32"
          />
          {caption}
        </div>
        <div className="hidden md:block">{caption}</div>
        {answeredQuestions.map((item) => (
          <article
            key={item.id}
            aria-label={t("Question from the building team")}
            className="flex flex-col gap-2 rounded-4xl bg-card p-6 shadow-card print:break-inside-avoid"
          >
            <h2 className="type-title">{t("You answered this question")}</h2>
            <p className="whitespace-pre-wrap">{item.question}</p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {item.answer}
            </p>
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
        </dl>
      </div>
      <StatusDial
        stage={status.stage}
        label={dialLabel}
        idPrefix="status-desktop"
        className="hidden md:sticky md:top-12 md:block"
      />
    </section>
  );
}
