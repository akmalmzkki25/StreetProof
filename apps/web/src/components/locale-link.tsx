"use client";

import NextLink from "next/link";

import { useI18n } from "@/lib/i18n/client";
import { localePath } from "@/lib/i18n/translate";

// Code writes "/app/queue"; the address people see carries their language.
export function useLocalePath() {
  const { locale } = useI18n();
  return function toLocalePath(path: string) {
    return localePath(locale, path);
  };
}

export function Link({
  href,
  ...props
}: React.ComponentProps<typeof NextLink> & { href: string }) {
  const toLocalePath = useLocalePath();
  const isInApp = href.startsWith("/");
  return <NextLink href={isInApp ? toLocalePath(href) : href} {...props} />;
}
