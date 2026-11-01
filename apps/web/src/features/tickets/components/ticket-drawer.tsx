"use client";

import { ArrowExpand01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@streetproof/ui/components/button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { SideDrawer } from "@/components/side-drawer";
import { useI18n } from "@/lib/i18n/client";

// A ticket opened from a list. The URL is the ticket's own, so a refresh or a
// shared link lands on the full page, and Back closes the drawer.
export function TicketDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <SideDrawer
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) router.back();
      }}
      title={t("Ticket")}
      actions={
        // A plain link, so the full page loads instead of this drawer again.
        <Button variant="ghost" size="icon-sm" nativeButton={false} render={<a href={pathname} />}>
          <HugeiconsIcon icon={ArrowExpand01Icon} />
          <span className="sr-only">{t("Open the full page")}</span>
        </Button>
      }
    >
      {children}
    </SideDrawer>
  );
}
