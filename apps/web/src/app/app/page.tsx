import type { Role } from "@streetproof/domain";
import { Button } from "@streetproof/ui/components/button";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { signOut } from "@/features/auth/actions";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = { title: "Workspace" };

const ROLE_WORK: Record<Role, { title: string; description: string }> = {
  operator: {
    title: "Operator",
    description:
      "Review incoming reports, triage them into tickets and assign technicians.",
  },
  technician: {
    title: "Technician",
    description:
      "Accept assigned work, record progress and submit completion proof.",
  },
  supervisor: {
    title: "Supervisor",
    description:
      "Verify completion proof, reject it with a reason, or reopen closed work.",
  },
  tenant_admin: {
    title: "Tenant admin",
    description: "Manage members, sites and retention settings.",
  },
};

const ROLE_LINKS: Partial<Record<Role, { href: string; label: string }>> = {
  operator: { href: "/app/queue", label: "Open the queue" },
  technician: { href: "/app/work", label: "Open my work" },
  supervisor: { href: "/app/reviews", label: "Open reviews" },
};

export default function WorkspacePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-10 px-4 py-12 md:px-8">
      <Suspense fallback={<WorkspaceSkeleton />}>
        <Workspace />
      </Suspense>
    </main>
  );
}

async function Workspace() {
  const member = await requireMember();

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{member.tenantName}</p>
          <h1 className="text-2xl">Hello, {member.name}</h1>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <section aria-labelledby="your-roles" className="flex flex-col gap-4">
        <h2 id="your-roles" className="text-sm text-muted-foreground">
          Your roles
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {member.roles.map((role) => (
            <li
              key={role}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-base">{ROLE_WORK[role].title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {ROLE_WORK[role].description}
              </p>
              {ROLE_LINKS[role] ? (
                <Link
                  href={ROLE_LINKS[role].href}
                  className="mt-3 inline-block text-sm underline underline-offset-4"
                >
                  {ROLE_LINKS[role].label}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}
