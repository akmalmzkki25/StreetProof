import type { TicketDetail } from "@streetproof/db";

import { formatDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

export async function ClarificationList({ ticket }: { ticket: TicketDetail }) {
  if (ticket.clarifications.length === 0) return null;
  const { t, locale } = await getI18n();

  return (
    <section aria-labelledby="clarifications" className="flex flex-col gap-4">
      <h2 id="clarifications" className="type-title">
        {t("Questions to the reporter")}
      </h2>
      {ticket.clarifications.map((item) => (
        <article
          key={item.id}
          className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card"
        >
          <div className="flex flex-col gap-1">
            <p className="whitespace-pre-wrap">{item.question}</p>
            <p className="type-caption text-muted-foreground">
              {item.askerName} · {formatDateTime(item.askedAt, locale)}
            </p>
          </div>
          {item.answer ? (
            <div className="flex flex-col gap-1">
              <p className="whitespace-pre-wrap">{item.answer}</p>
              <p className="type-caption text-muted-foreground">
                {t("Reporter")} ·{" "}
                {item.answeredAt && formatDateTime(item.answeredAt, locale)}
              </p>
            </div>
          ) : (
            <p className="type-caption text-muted-foreground">
              {item.closedAt
                ? t("Closed without an answer.")
                : t("Waiting for the reporter's answer.")}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
