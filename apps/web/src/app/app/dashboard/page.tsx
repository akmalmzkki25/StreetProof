import { TaskDaily01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getDashboard, getDb } from "@streetproof/db";
import { canViewDashboard, DASHBOARD_WINDOW_DAYS, type Dashboard } from "@streetproof/domain";
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
  MetricTiles,
  ProofPanel,
  StageStrip,
  TrendPanel,
  WorkloadPanel,
} from "@/features/dashboard/components/dashboard-panels";
import { PageHeader } from "@/components/page-header";
import { STAGE_LABELS } from "@/features/dashboard/labels";
import { formatDurationInWords } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import type { Locale, Translate } from "@/lib/i18n/translate";
import { requireMember, type Member } from "@/lib/member";

export const metadata: Metadata = { title: "Work overview" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Work overview"
        badge={
          <Suspense fallback={null}>
            <SyntheticBadge />
          </Suspense>
        }
        actions={
          <Suspense fallback={null}>
            <MainAction />
          </Suspense>
        }
      />
      <main className="flex w-full flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        <Suspense fallback={<OverviewSkeleton />}>
          <Overview />
        </Suspense>
      </main>
    </>
  );
}

async function SyntheticBadge() {
  const member = await requireMember();
  const { t } = await getI18n();
  if (!member.isSyntheticTenant) return null;
  return <Badge variant="outline">{t("Synthetic data")}</Badge>;
}

async function MainAction() {
  const member = await requireMember();
  const { t } = await getI18n();
  const action = mainAction(member);
  if (!action) return null;
  return (
    <Button size="sm" nativeButton={false} render={<Link href={action.href} />}>
      {t(action.label)}
    </Button>
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
    t(period.duplicates === 1 ? "1 linked as a duplicate" : "{count} linked as duplicates", {
      count: period.duplicates,
    }),
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
  const isFirstRun = dashboard.open === 0 && dashboard.period.reports === 0;

  return (
    <>
      <p className="text-[13px] text-muted-foreground">{finding(dashboard, t, locale)}</p>

      {isFirstRun ? (
        <Empty className="flex-none rounded-4xl bg-card shadow-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={TaskDaily01Icon} />
            </EmptyMedia>
            <EmptyTitle>{t("No reports yet")}</EmptyTitle>
            <EmptyDescription>
              {t("Figures appear here once someone sends a report from a site's report form.")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <MetricTiles dashboard={dashboard} />
          <StageStrip dashboard={dashboard} />
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <TrendPanel dashboard={dashboard} />
            <OldestPanel dashboard={dashboard} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <AgePanel dashboard={dashboard} />
            <CategoryPanel dashboard={dashboard} />
            <LocationPanel dashboard={dashboard} />
            <WorkloadPanel dashboard={dashboard} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ProofPanel dashboard={dashboard} />
            <DraftPanel dashboard={dashboard} />
          </div>
          <p className="type-caption text-muted-foreground">
            {periodSummary(dashboard, t)} {t("Linked duplicates count as reports, not as work.")}
          </p>
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
