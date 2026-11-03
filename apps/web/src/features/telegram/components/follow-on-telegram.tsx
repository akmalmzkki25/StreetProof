"use client";

import { Button } from "@streetproof/ui/components/button";
import { useState, useTransition } from "react";

import { useI18n } from "@/lib/i18n/client";

import { followOnTelegramAction } from "../actions";

export function FollowOnTelegram() {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [hasFailed, setHasFailed] = useState(false);

  function follow() {
    startTransition(async () => {
      const { url } = await followOnTelegramAction();
      if (!url) {
        setHasFailed(true);
        return;
      }
      window.location.assign(url);
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="outline" disabled={isPending} onClick={follow}>
        {t("Get updates on Telegram")}
      </Button>
      {hasFailed ? (
        <p role="alert" className="type-caption text-destructive">
          {t("That didn't work. Try again in a while.")}
        </p>
      ) : null}
    </div>
  );
}
