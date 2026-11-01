import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { navLinksFor } from "@/features/shell/nav-links";
import { getLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/translate";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = { title: "Workspace" };

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <Landing />
    </Suspense>
  );
}

// The first item of the member's menu: the Overview, or My work for technicians.
async function Landing(): Promise<never> {
  const member = await requireMember();
  const first = navLinksFor(member.roles)[0];
  if (!first) notFound();
  redirect(localePath(await getLocale(), first.href));
}
