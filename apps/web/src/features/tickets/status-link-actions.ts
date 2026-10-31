"use server";

import { getDb, getTicketDetail, reissueStatusLink } from "@streetproof/db";
import { canManageDuplicates } from "@streetproof/domain";
import { z } from "zod";

import { requireMember } from "@/lib/member";

export type ReissueState = { url: string | null; error: string | null };

const fields = z.object({ ticketId: z.uuid(), reportId: z.uuid() });

// For a reporter who lost their link and has no email on file. The link is shown
// once, to the staff member who will pass it on.
export async function reissueStatusLinkAction(
  _previous: ReissueState,
  formData: FormData,
): Promise<ReissueState> {
  const member = await requireMember();
  const unavailable = { url: null, error: "This report isn't available." };
  if (!canManageDuplicates(member.roles)) return unavailable;

  const parsed = fields.safeParse({
    ticketId: formData.get("ticketId"),
    reportId: formData.get("reportId"),
  });
  if (!parsed.success) return unavailable;

  const db = getDb();
  const ticket = await getTicketDetail(
    db,
    { tenantId: member.tenantId, siteIds: member.siteIds },
    parsed.data.ticketId,
  );
  const isOnTicket = ticket?.reports.some(
    (report) => report.id === parsed.data.reportId,
  );
  if (!isOnTicket) return unavailable;

  const outcome = await reissueStatusLink(db, {
    tenantId: member.tenantId,
    reportId: parsed.data.reportId,
    actorId: member.userId,
  });
  if (!outcome.ok) return unavailable;
  return {
    url: `${process.env.APP_URL ?? ""}/status#t=${outcome.token}`,
    error: null,
  };
}
