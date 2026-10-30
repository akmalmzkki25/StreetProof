import { getDb, getReporterStatus } from "@streetproof/db";
import type { ReporterStage } from "@streetproof/domain";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";

import { ClarificationAnswerForm } from "@/features/reporter-status/components/clarification-answer-form";
import { ReceiptExchange } from "@/features/reporter-status/components/receipt-exchange";
import { REPORTER_COOKIE } from "@/features/reporter-status/cookie";
import { formatDateTime } from "@/lib/format";

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
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col gap-8 px-4 py-12">
      <h1 className="text-2xl">Report status</h1>
      <ReceiptExchange>
        <Suspense fallback={<Skeleton className="h-48" />}>
          <ReportStatus />
        </Suspense>
      </ReceiptExchange>
    </main>
  );
}

async function ReportStatus() {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(REPORTER_COOKIE)?.value;
  const status = token ? await getReporterStatus(getDb(), token) : null;

  if (!status) {
    return (
      <p className="text-sm text-muted-foreground">
        This status link isn&apos;t available. It may have expired or been
        replaced. Ask the building team if you need an update.
      </p>
    );
  }

  const stage = STAGE_COPY[status.stage];

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-base">{stage.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{stage.detail}</p>
      </div>
      {status.clarifications.map((item) => (
        <article
          key={item.id}
          aria-label="Question from the building team"
          className="flex flex-col gap-4 rounded-4xl bg-card p-6 shadow-card"
        >
          <div className="flex flex-col gap-1">
            <h2 className="type-title">
              {item.isOpen
                ? "The building team has a question"
                : "You answered this question"}
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
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
        <dt className="text-muted-foreground">Reference</dt>
        <dd className="font-mono">{status.reference}</dd>
        <dt className="text-muted-foreground">Site</dt>
        <dd>{status.siteName}</dd>
        <dt className="text-muted-foreground">Location</dt>
        <dd>{status.location}</dd>
        <dt className="text-muted-foreground">Your report</dt>
        <dd className="whitespace-pre-wrap">{status.description}</dd>
        <dt className="text-muted-foreground">Sent</dt>
        <dd>{formatDateTime(status.submittedAt)}</dd>
        <dt className="text-muted-foreground">Last update</dt>
        <dd>{formatDateTime(status.updatedAt)}</dd>
      </dl>
    </section>
  );
}
