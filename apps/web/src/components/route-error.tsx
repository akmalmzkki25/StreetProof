"use client";

import { Button } from "@streetproof/ui/components/button";

import { useI18n } from "@/lib/i18n/client";

export function RouteError({ retry }: { retry: () => void }) {
  const { t } = useI18n();

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 px-4 py-10 sm:px-6"
    >
      <h1 className="type-headline">{t("Something went wrong")}</h1>
      <p className="text-muted-foreground">
        {t("This page didn't load. Try again, or come back in a moment.")}
      </p>
      <Button onClick={() => retry()}>{t("Try again")}</Button>
    </div>
  );
}
