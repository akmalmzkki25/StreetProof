import { TaskDaily01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getDashboard, getDb } from "@streetproof/db";
import {
  canViewDashboard,
  DASHBOARD_WINDOW_DAYS,
  type Dashboard,
} from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import { Button } from "@streetproof/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@streetproof/ui/components/empty";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  AgePanel,
  CategoryPanel,
  DraftPanel,
  LocationPanel,
  OldestPanel,
  OutcomeStrip,
  ProofPanel,
  StagePanel,
  WorkloadPanel,
} from "@/features/dashboard/components/dashboard-panels";
import { STAGE_LABELS } from "@/features/dashboard/labels";
import { formatDurationInWords } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import type { Locale, Translate } from "@/lib/i18n/translate";
import { requireMember, type Member } from "@/lib/member";

export const metadata: Metadata = { title: "Work overview" };

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </main>
  );
}

// The most frequent job from here, by role. A tenant admin has none.
function mainAction(member: Member) {
  if (member.roles.includes("operator")) {
    return { href: "/app/queue", label: "Open the queue" };
  }
  if (member.roles.includes("supervisor")) {
    return { href: "/app/reviews", label: "Open reviews" };
  }
  return null;
}

function finding(dashboard: Dashboard, t: Translate, locale: Locale) {
  const oldest = dashboard.oldest[0];
  if (!oldest) return t("Nothing is open right now.");
  return t("The oldest open ticket has waited {age} and {state}.", {
    age: formatDurationInWords(oldest.ageMs, locale),
    state: t(STAGE_LABELS[oldest.stage].state),
  });
}

function periodSummary({ period }: Dashboard, t: Translate) {
  const parts = [
    t(
      period.reports === 1
        ? "1 report in the last {days} days"
        : "{count} reports in the last {days} days",
      { count: period.reports, days: DASHBOARD_WINDOW_DAYS },
    ),
    t(
      period.duplicates === 1
        ? "1 linked as a duplicate"
        : "{count} linked as duplicates",
      { count: period.duplicates },
    ),
    t("{count} cancelled", { count: period.cancelled }),
  ];
  return `${parts.join(", ")}.`;
}

async function Overview() {
  const member = await requireMember();
  if (!canViewDashboard(member.roles)) notFound();
  const { t, locale } = await getI18n();

  const dashboard = await getDashboard(getDb(), {
    tenantId: member.tenantId,
    siteIds: member.siteIds,
  });
  const action = mainAction(member);
  const isFirstRun = dashboard.open === 0 && dashboard.period.reports === 0;

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="type-headline">{t("Work overview")}</h1>
            {member.isSyntheticTenant ? (
              <Badge variant="outline">{t("Synthetic data")}</Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">
            {finding(dashboard, t, locale)}
          </p>
        </div>
        {action && !isFirstRun ? (
          <Button nativeButton={false} render={<Link href={action.href} />}>
            {t(action.label)}
          </Button>
        ) : null}
      </header>

      {isFirstRun ? (
        <Empty className="flex-none rounded-4xl bg-card shadow-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={TaskDaily01Icon} />
            </EmptyMedia>
            <EmptyTitle>{t("No reports yet")}</EmptyTitle>
            <EmptyDescription>
              {t(
                "Figures appear here once someone sends a report from a site's report form.",
              )}
            </EmptyDescription>
          </EmptyHeader>
          {action ? (
            <Button nativeButton={false} render={<Link href={action.href} />}>
              {t(action.label)}
            </Button>
          ) : null}
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StagePanel dashboard={dashboard} />
            <div className="flex flex-col gap-6">
              <AgePanel dashboard={dashboard} />
              <WorkloadPanel dashboard={dashboard} />
            </div>
            <OldestPanel dashboard={dashboard} />
            <div className="flex flex-col gap-6">
              <ProofPanel dashboard={dashboard} />
              <DraftPanel dashboard={dashboard} />
            </div>
          </div>
          <OutcomeStrip dashboard={dashboard} />
          <p className="type-caption text-muted-foreground">
            {periodSummary(dashboard, t)}{" "}
            {t("Linked duplicates count as reports, not as work.")}
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryPanel dashboard={dashboard} />
            <LocationPanel dashboard={dashboard} />
          </div>
        </div>
      )}
    </>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-14 w-96 max-w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
