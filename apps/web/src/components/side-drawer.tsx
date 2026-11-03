"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@streetproof/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@streetproof/ui/components/sheet";

import { useI18n } from "@/lib/i18n/client";

// The right-hand panel for showing or editing one thing next to its list.
export function SideDrawer({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title,
  actions,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SheetTitle className="min-w-0 flex-1 truncate font-medium">
            {title}
          </SheetTitle>
          {actions}
          <SheetClose render={<Button variant="ghost" size="icon-sm" />}>
            <HugeiconsIcon icon={Cancel01Icon} />
            <span className="sr-only">{t("Close")}</span>
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
