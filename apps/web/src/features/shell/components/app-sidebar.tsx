import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@streetproof/ui/components/sidebar";
import { Link } from "@/components/locale-link";

import { StreetProofMark } from "@/components/street-proof-mark";
import { getCurrentMember } from "@/lib/member";

import { navLinksFor } from "../nav-links";
import { NavUser } from "./nav-user";
import { SidebarNavLinks } from "./nav-items";

function Brand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="mt-1">
        <SidebarMenuButton render={<Link href="/app" />}>
          <StreetProofMark className="size-6! shrink-0" />
          <span className="font-heading text-sm font-semibold">
            StreetProof
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarNavLinks links={navLinksFor(member.roles)} />
          </SidebarGroupContent>
        </SidebarGroup>
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
