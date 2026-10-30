import type { Role } from "@streetproof/domain";
import { Skeleton } from "@streetproof/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

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
    description: "Follow backlog and outcomes across your sites.",
  },
};

const ROLE_LINKS: Record<Role, { href: string; label: string }> = {
  operator: { href: "/app/queue", label: "Open the queue" },
  technician: { href: "/app/work", label: "Open my work" },
  supervisor: { href: "/app/reviews", label: "Open reviews" },
  tenant_admin: { href: "/app/dashboard", label: "Open the overview" },
};

export default function WorkspacePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-8">
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
      <header className="flex flex-col gap-2">
        <p className="type-caption text-muted-foreground">
          {member.tenantName}
        </p>
        <h1 className="type-headline">Hello, {member.name}</h1>
      </header>

      <section aria-labelledby="your-roles" className="flex flex-col gap-4">
        <h2 id="your-roles" className="type-caption text-muted-foreground">
          Your roles
        </h2>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {member.roles.map((role) => (
            <li
              key={role}
              className="flex flex-col gap-2 rounded-4xl bg-card p-6 shadow-card"
            >
              <p className="type-title">{ROLE_WORK[role].title}</p>
              <p className="text-muted-foreground">
                {ROLE_WORK[role].description}
              </p>
              <Link
                href={ROLE_LINKS[role].href}
                className="self-start text-brand-text underline underline-offset-4"
              >
                {ROLE_LINKS[role].label}
              </Link>
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
        <Skeleton className="h-12 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}
