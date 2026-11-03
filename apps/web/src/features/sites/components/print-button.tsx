"use client";

import { Button } from "@streetproof/ui/components/button";

import { useI18n } from "@/lib/i18n/client";

export function PrintButton() {
  const { t } = useI18n();
  return <Button onClick={() => window.print()}>{t("Print")}</Button>;
}
