"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@streetproof/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@streetproof/ui/components/dropdown-menu";
import { cn } from "@streetproof/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/features/auth/actions";

import type { NavLink } from "../nav-links";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-1 md:flex">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3 text-[13px] font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                active
                  ? "bg-brand font-semibold text-brand-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNavMenu({ links }: { links: NavLink[] }) {
  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <HugeiconsIcon icon={Menu01Icon} />
          <span className="sr-only">Open the menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {links.map((link) => (
            <DropdownMenuItem
              key={link.href}
              render={<Link href={link.href} />}
            >
              {link.label}
            </DropdownMenuItem>
          ))}
          {links.length > 0 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem onClick={() => void signOut()}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
