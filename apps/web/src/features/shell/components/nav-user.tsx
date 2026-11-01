"use client";

import {
  ComputerIcon,
  Logout01Icon,
  MoonFastWindIcon,
  Sun03Icon,
  TranslateIcon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar, AvatarFallback } from "@streetproof/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@streetproof/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@streetproof/ui/components/sidebar";
import { useTheme } from "next-themes";

import { signOut } from "@/features/auth/actions";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/translate";

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function NavUser({
  name,
  email,
  tenantName,
}: {
  name: string;
  email: string;
  tenantName: string;
}) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { locale, t } = useI18n();

  function changeLocale(next: Locale) {
    const formData = new FormData();
    formData.set("locale", next);
    void setLocaleAction(formData);
  }

  const identity = (
    <>
      <Avatar>
        <AvatarFallback>{initialsOf(name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate type-caption text-muted-foreground">
          {email}
        </span>
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="data-open:bg-accent" />}
          >
            {identity}
            <HugeiconsIcon icon={UnfoldMoreIcon} className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            className="min-w-60"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2 text-left">
                {identity}
              </DropdownMenuLabel>
              <p className="truncate px-3 pb-2 type-caption text-muted-foreground">
                {tenantName}
              </p>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={Sun03Icon} className="dark:hidden" />
                  <HugeiconsIcon
                    icon={MoonFastWindIcon}
                    className="hidden dark:block"
                  />
                  {t("Theme")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={theme}
                      onValueChange={setTheme}
                    >
                      <DropdownMenuRadioItem value="light">
                        <HugeiconsIcon icon={Sun03Icon} />
                        {t("Day")}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">
                        <HugeiconsIcon icon={MoonFastWindIcon} />
                        {t("Night")}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">
                        <HugeiconsIcon icon={ComputerIcon} />
                        {t("System")}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={TranslateIcon} />
                  {t("Language")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={locale}
                      onValueChange={(value) => changeLocale(value as Locale)}
                    >
                      {LOCALES.map((item) => (
                        <DropdownMenuRadioItem key={item} value={item}>
                          {LANGUAGE_NAMES[item]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut()}>
              <HugeiconsIcon icon={Logout01Icon} />
              {t("Sign out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
