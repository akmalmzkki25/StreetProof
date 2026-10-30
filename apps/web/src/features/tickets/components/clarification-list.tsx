import type { TicketDetail } from "@streetproof/db";

import { formatDateTime } from "@/lib/format";

export function ClarificationList({ ticket }: { ticket: TicketDetail }) {
  if (ticket.clarifications.length === 0) return null;

  return (
    <section aria-labelledby="clarifications" className="flex flex-col gap-4">
      <h2 id="clarifications" className="text-sm text-muted-foreground">
        Questions to the reporter
      </h2>
      {ticket.clarifications.map((item) => (
        <article
          key={item.id}
          className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card"
        >
          <div className="flex flex-col gap-1">
            <p className="whitespace-pre-wrap">{item.question}</p>
            <p className="text-sm text-muted-foreground">
              {item.askerName} · {formatDateTime(item.askedAt)}
            </p>
          </div>
          {item.answer ? (
            <div className="flex flex-col gap-1">
              <p className="whitespace-pre-wrap">{item.answer}</p>
              <p className="text-sm text-muted-foreground">
                Reporter · {item.answeredAt && formatDateTime(item.answeredAt)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {item.closedAt
                ? "Closed without an answer."
                : "Waiting for the reporter's answer."}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
