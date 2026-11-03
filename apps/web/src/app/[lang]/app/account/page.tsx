import { getDb, isTelegramLinked } from "@streetproof/db";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import {
  NameForm,
  PasswordForm,
  TelegramConnect,
} from "@/features/account/components/account-forms";
import { getI18n } from "@/lib/i18n/server";
import { requireMember } from "@/lib/member";
import { isTelegramEnabled } from "@/lib/telegram";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Account" />
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<Skeleton className="m-4 h-96 sm:m-6" />}>
          <Account />
        </Suspense>
      </main>
    </>
  );
}

async function Account() {
  const member = await requireMember();
  const { t } = await getI18n();
  const telegramLinked = isTelegramEnabled()
    ? await isTelegramLinked(getDb(), member.userId)
    : null;

  return (
    <div className="grid max-w-4xl gap-6 p-4 sm:p-6 lg:grid-cols-2">
      <Panel id="profile" title="Profile">
        <p className="type-caption text-muted-foreground">
          {t("Signed in as {email}, at {tenant}.", {
            email: member.email,
            tenant: member.tenantName,
          })}
        </p>
        <NameForm name={member.name} />
      </Panel>
      <Panel id="password" title="Password">
        <PasswordForm />
      </Panel>
      {telegramLinked === null ? null : (
        <Panel id="telegram" title="Telegram">
          <TelegramConnect isLinked={telegramLinked} />
        </Panel>
      )}
    </div>
  );
}
