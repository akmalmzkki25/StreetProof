import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@streetproof/ui/components/sidebar";
import { Link } from "@/components/locale-link";

import { StreetProofMark } from "@/components/street-proof-mark";
import { getCurrentMember } from "@/lib/member";

import { navLinksFor } from "../nav-links";
import { NavUser } from "./nav-user";
import { SidebarNavLinks } from "./nav-items";

function Brand() {
  return (
    <Link
      href="/app"
      className="flex items-center gap-2 rounded-md px-2 py-1 font-heading text-sm font-semibold focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <StreetProofMark className="shrink-0" />
      StreetProof
    </Link>
  );
}

function SidebarFrame({ children }: { children?: React.ReactNode }) {
  return (
    <Sidebar aria-label="Main">
      <SidebarHeader>
        <Brand />
      </SidebarHeader>
      {children}
    </Sidebar>
  );
}

export function AppSidebarFallback() {
  return <SidebarFrame />;
}

export async function AppSidebar() {
  const member = await getCurrentMember();
  if (!member) return <SidebarFrame />;

  return (
    <SidebarFrame>
      <SidebarContent className="p-2">
        <SidebarNavLinks links={navLinksFor(member.roles)} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          name={member.name}
          email={member.email}
          tenantName={member.tenantName}
        />
      </SidebarFooter>
    </SidebarFrame>
  );
}
