"use client";

import {
  Building03Icon,
  CheckmarkBadge01Icon,
  DashboardSquare01Icon,
  FileSearchIcon,
  ListViewIcon,
  UserGroupIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@streetproof/ui/components/sidebar";
import { Link } from "@/components/locale-link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/lib/i18n/client";
import { splitLocale } from "@/lib/i18n/translate";

import type { NavLink } from "../nav-links";

const LINK_ICONS: Record<string, IconSvgElement> = {
  "/app/queue": ListViewIcon,
  "/app/work": Wrench01Icon,
  "/app/reviews": CheckmarkBadge01Icon,
  "/app/dashboard": DashboardSquare01Icon,
  "/app/members": UserGroupIcon,
  "/app/sites": Building03Icon,
  "/app/audit": FileSearchIcon,
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavLinks({ links }: { links: NavLink[] }) {
  const { path: pathname } = splitLocale(usePathname());
  const { t } = useI18n();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const icon = LINK_ICONS[link.href];
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              isActive={active}
              render={
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpenMobile(false)}
                />
              }
            >
              {icon ? <HugeiconsIcon icon={icon} /> : null}
              <span>{t(link.label)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function PageHeaderStart({ title }: { title?: string | undefined }) {
  const { t } = useI18n();
  return (
    <>
      <SidebarTrigger className="-ml-1" aria-label={t("Open the menu")} />
      {title ? (
        <h1 className="min-w-0 truncate text-sm font-medium">{t(title)}</h1>
      ) : null}
    </>
  );
}
