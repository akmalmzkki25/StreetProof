import { findIntakeSite, getDb } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReportForm } from "@/features/intake/components/report-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Report damage" };

export default function ReportPage({ params }: PageProps<"/report/[code]">) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col gap-8 px-4 py-12">
      <Suspense fallback={<ReportSkeleton />}>
        <ReportContent codePromise={params.then((value) => value.code)} />
      </Suspense>
    </main>
  );
}

async function ReportContent({
  codePromise,
}: {
  codePromise: Promise<string>;
}) {
  const code = await codePromise;
  await connection();
  const site = await findIntakeSite(getDb(), code);
  if (!site) notFound();
  const { t } = await getI18n();

  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="type-caption text-muted-foreground">{site.name}</p>
        <h1 className="type-headline">{t("Report damage")}</h1>
        <p className="type-caption text-muted-foreground">
          {t(
            "No account needed. For fire, injury or anything dangerous, leave the area and call building security first. This form is not monitored for emergencies.",
          )}
        </p>
      </header>
      <ReportForm
        intakeCode={code}
        locations={site.locations}
        canRecordVoice={Boolean(process.env.META_API_KEY)}
      />
    </>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-16" />
      <Skeleton className="h-10" />
      <Skeleton className="h-28" />
      <Skeleton className="h-10" />
    </div>
  );
}
