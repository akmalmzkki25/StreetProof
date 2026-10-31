import { Button } from "@streetproof/ui/components/button";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { StreetProofMark } from "@/components/street-proof-mark";
import { signOut } from "@/features/auth/actions";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentMember } from "@/lib/member";

import { navLinksFor } from "../nav-links";
import { DesktopNavLinks, MobileNavMenu } from "./nav-items";

function Brand() {
  return (
    <Link
      href="/app"
      className="flex items-center gap-2 rounded-full font-heading text-sm font-semibold focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <StreetProofMark className="shrink-0" />
      StreetProof
    </Link>
  );
}

function NavFrame({ children }: { children?: React.ReactNode }) {
  return (
    <nav
      aria-label="Main"
      className="mx-auto flex min-h-12 max-w-6xl items-center justify-between gap-4 rounded-full border glass py-2 pr-2 pl-5"
    >
      <Brand />
      {children}
    </nav>
  );
}

export function AppNavFallback() {
  return <NavFrame />;
}

export async function AppNav() {
  const member = await getCurrentMember();
  if (!member) return <NavFrame />;

  const links = navLinksFor(member.roles);
  const { t } = await getI18n();

  return (
    <NavFrame>
      <DesktopNavLinks links={links} />
      <div className="flex items-center gap-1">
        <p className="hidden type-caption text-muted-foreground lg:block lg:pr-2">
          {member.tenantName}
        </p>
        <ModeToggle />
        <form action={signOut} className="hidden md:block">
          <Button type="submit" variant="ghost">
            {t("Sign out")}
          </Button>
        </form>
        <MobileNavMenu links={links} />
      </div>
    </NavFrame>
  );
}
