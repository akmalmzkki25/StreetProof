import {
  acceptWork,
  decideCompletion,
  findTelegramMember,
  getTicketDetail,
  listQueue,
  submitCompletion,
  transitionTicket,
  type TelegramMember,
  type TicketDetail,
  type TransitionOutcome,
} from "@streetproof/db";
import {
  canViewTicket,
  checklistFor,
  type TicketStatus,
} from "@streetproof/domain";
import { MAX_PHOTOS } from "@streetproof/media/photos";
import { InlineKeyboard, InputFile, type Context } from "grammy";

import {
  chatIdOf,
  localeOf,
  receivePhoto,
  say,
  sayKey,
  type BotDeps,
} from "./context";
import { checklistLabel, t, type MessageKey } from "./messages";
import {
  clearState,
  saveState,
  type DecisionState,
  type ProofState,
} from "./state";

const OPEN_WORK: readonly TicketStatus[] = [
  "assigned",
  "accepted",
  "in_progress",
  "waiting_for_parts",
  "waiting_for_access",
  "rejected_with_reason",
];
const MAX_LISTED_TICKETS = 10;
const MIN_NOTE = 5;
const MAX_NOTE = 1000;
const MIN_REASON = 5;
const MAX_REASON = 500;

function actorOf(member: TelegramMember) {
  return { userId: member.userId, roles: member.roles };
}

function scopeOf(member: TelegramMember) {
  return { tenantId: member.tenantId, siteIds: member.siteIds };
}

function ticketUrl(deps: BotDeps, ticketId: string) {
  return `${deps.appUrl}/app/tickets/${ticketId}`;
}

// Looked up on every action. A button is only a request, so it's never trusted to
// say who is asking or what they may do.
async function requireMember(ctx: Context, deps: BotDeps) {
  const member = await findTelegramMember(deps.db, chatIdOf(ctx));
  if (!member) await sayKey(ctx, "staffOnly");
  return member;
}

async function ticketInScope(
  ctx: Context,
  deps: BotDeps,
  member: TelegramMember,
  ticketId: string,
): Promise<TicketDetail | null> {
  const ticket = await getTicketDetail(deps.db, scopeOf(member), ticketId);
  if (!ticket || !canViewTicket(ticket, actorOf(member))) {
    await sayKey(ctx, "ticketUnavailable");
    return null;
  }
  return ticket;
}

function rejectionKey(
  outcome: Extract<TransitionOutcome, { ok: false }>,
): MessageKey {
  switch (outcome.rejection.code) {
    case "stale_revision":
      return "staleTicket";
    case "not_current_assignee":
      return "notYours";
    case "not_found":
      return "ticketUnavailable";
    case "linked_as_duplicate":
      return "linkedDuplicate";
    default:
      return "notAllowed";
  }
}

// What a technician can do next, as the one button that does it.
function nextStepKeyboard(
  locale: "en" | "id",
  ticket: { id: string; status: TicketStatus; revision: number },
) {
  const { id, status, revision } = ticket;
  switch (status) {
    case "assigned":
      return new InlineKeyboard().text(
        t(locale, "accept"),
        `accept:${id}:${revision}`,
      );
    case "accepted":
      return new InlineKeyboard().text(
        t(locale, "start"),
        `start:${id}:${revision}`,
      );
    case "in_progress":
      return new InlineKeyboard().text(
        t(locale, "sendProof"),
        `proof:${id}:${revision}`,
      );
    case "waiting_for_parts":
    case "waiting_for_access":
    case "rejected_with_reason":
      return new InlineKeyboard().text(
        t(locale, "resume"),
        `resume:${id}:${revision}`,
      );
    default:
      return null;
  }
}

export async function listWork(ctx: Context, deps: BotDeps) {
  const member = await requireMember(ctx, deps);
  if (!member) return;
  const items = await listQueue(deps.db, scopeOf(member), {
    assigneeId: member.userId,
    statuses: OPEN_WORK,
  });
  if (items.length === 0) {
    await sayKey(ctx, "noWork");
    return;
  }
  const locale = localeOf(ctx);
  for (const item of items.slice(0, MAX_LISTED_TICKETS)) {
    const keyboard = nextStepKeyboard(locale, item);
    await ctx.reply([item.title, item.location ?? ""].join("\n").trim(), {
      ...(keyboard ? { reply_markup: keyboard } : {}),
    });
  }
}

export async function listReviews(ctx: Context, deps: BotDeps) {
  const member = await requireMember(ctx, deps);
  if (!member) return;
  if (!member.roles.includes("supervisor")) {
    await sayKey(ctx, "noReviews");
    return;
  }
  const items = await listQueue(deps.db, scopeOf(member), {
    statuses: ["completion_submitted"],
  });
  if (items.length === 0) {
    await sayKey(ctx, "noReviews");
    return;
  }
  const locale = localeOf(ctx);
  for (const item of items.slice(0, MAX_LISTED_TICKETS)) {
    await ctx.reply([item.title, item.location ?? ""].join("\n").trim(), {
      reply_markup: new InlineKeyboard().text(
        t(locale, "review"),
        `review:${item.id}`,
      ),
    });
  }
}

export async function acceptOrStart(
  ctx: Context,
  deps: BotDeps,
  action: "accept" | "start" | "resume",
  ticketId: string,
  expectedRevision: number,
) {
  const member = await requireMember(ctx, deps);
  if (!member) return;
  const ticket = await ticketInScope(ctx, deps, member, ticketId);
  if (!ticket) return;

  const command = {
    tenantId: member.tenantId,
    ticketId,
    actor: actorOf(member),
    expectedRevision,
  };
  const outcome =
    action === "accept"
      ? await acceptWork(deps.db, command)
      : await transitionTicket(deps.db, {
          ...command,
          to: "in_progress",
          provided: [],
        });
  if (!outcome.ok) {
    await sayKey(ctx, rejectionKey(outcome));
    return;
  }

  const locale = localeOf(ctx);
  const keyboard = nextStepKeyboard(locale, outcome.ticket);
  await ctx.reply(t(locale, action === "accept" ? "accepted" : "started"), {
    ...(keyboard ? { reply_markup: keyboard } : {}),
  });
}

async function askCheck(
  ctx: Context,
  ticket: { category: string | null },
  index: number,
) {
  const checklist = checklistFor(ticket.category);
  const item = checklist[index];
  if (!item) return;
  const locale = localeOf(ctx);
  await ctx.reply(
    t(locale, "checkPrompt", {
      index: index + 1,
      total: checklist.length,
      label: checklistLabel(item.label, locale),
    }),
    {
      reply_markup: new InlineKeyboard()
        .text(t(locale, "confirm"), `check:yes:${index}`)
        .text(t(locale, "cantConfirm"), `check:no:${index}`),
    },
  );
}

export async function startProof(
  ctx: Context,
  deps: BotDeps,
  ticketId: string,
  expectedRevision: number,
) {
  const member = await requireMember(ctx, deps);
  if (!member) return;
  const ticket = await ticketInScope(ctx, deps, member, ticketId);
  if (!ticket) return;
  // Checked before storing anything, so a refused attempt leaves no objects.
  if (ticket.currentAssigneeId !== member.userId) {
    await sayKey(ctx, "notYours");
    return;
  }
  if (ticket.revision !== expectedRevision) {
    await sayKey(ctx, "staleTicket");
    return;
  }
  if (ticket.status !== "in_progress") {
    await sayKey(ctx, "notAllowed");
    return;
  }

  await saveState(deps.db, chatIdOf(ctx), {
    flow: "proof",
    step: "checks",
    ticketId,
    expectedRevision,
    checkedIds: [],
    note: null,
    photos: [],
  });
  await askCheck(ctx, ticket, 0);
}

export async function answerCheck(
  ctx: Context,
  deps: BotDeps,
  state: ProofState,
  answer: string,
  index: number,
) {
  if (state.step !== "checks") return;
  const member = await requireMember(ctx, deps);
  if (!member) return;
  const ticket = await ticketInScope(ctx, deps, member, state.ticketId);
  if (!ticket) return;

  const checklist = checklistFor(ticket.category);
  // An old button for an earlier question does nothing.
  if (index !== state.checkedIds.length) return;
  const item = checklist[index];
  if (!item) return;

  if (answer !== "yes") {
    await clearState(deps.db, chatIdOf(ctx));
    await sayKey(ctx, "useWebForException", {
      url: ticketUrl(deps, state.ticketId),
    });
    return;
  }

  const checkedIds = [...state.checkedIds, item.id];
  const isLast = checkedIds.length === checklist.length;
  await saveState(deps.db, chatIdOf(ctx), {
    ...state,
    checkedIds,
    step: isLast ? "note" : "checks",
  });
  if (isLast) {
    await sayKey(ctx, "askNote");
    return;
  }
  await askCheck(ctx, ticket, checkedIds.length);
}

export async function handleProofText(
  ctx: Context,
  deps: BotDeps,
  state: ProofState,
  text: string,
) {
  if (state.step === "checks") {
    await sayKey(ctx, "pressAButton");
    return;
  }
  if (state.step === "photos") {
    await sayKey(ctx, "sendPhotoNow");
    return;
  }
  if (text.length < MIN_NOTE || text.length > MAX_NOTE) {
    await sayKey(ctx, "noteInvalid");
    return;
  }
  await saveState(deps.db, chatIdOf(ctx), {
    ...state,
    step: "photos",
    note: text,
  });
  await sayKey(ctx, "askProofPhotos", { max: MAX_PHOTOS });
}

export async function handleProofPhoto(
  ctx: Context,
  deps: BotDeps,
  state: ProofState,
) {
  if (state.step !== "photos") {
    await sayKey(ctx, "pressAButton");
    return;
  }
  if (state.photos.length >= MAX_PHOTOS) {
    await sayKey(ctx, "tooManyPhotos");
    return;
  }
  const member = await requireMember(ctx, deps);
  if (!member) return;
  const photo = await receivePhoto(
    ctx,
    deps,
    `tenants/${member.tenantId}/completions/${state.ticketId}`,
  );
  if (!photo) return;

  const photos = [...state.photos, photo];
  await saveState(deps.db, chatIdOf(ctx), { ...state, photos });
  const locale = localeOf(ctx);
  await ctx.reply(
    t(locale, "photoSaved", { count: photos.length, max: MAX_PHOTOS }),
    {
      reply_markup: new InlineKeyboard().text(
        t(locale, "submitProof"),
        "proof:send",
      ),
    },
  );
}

export async function sendProof(
  ctx: Context,
  deps: BotDeps,
  state: ProofState,
) {
  if (state.step !== "photos") return;
  if (state.photos.length === 0) {
    await sayKey(ctx, "needPhoto");
    return;
  }
  const member = await requireMember(ctx, deps);
  if (!member) return;
  const ticket = await ticketInScope(ctx, deps, member, state.ticketId);
  if (!ticket) return;

  const outcome = await submitCompletion(deps.db, {
    tenantId: member.tenantId,
    ticketId: state.ticketId,
    actor: actorOf(member),
    expectedRevision: state.expectedRevision,
    note: state.note ?? "",
    photos: state.photos,
    checkedItemIds: state.checkedIds,
    exceptionReason: null,
  });
  await clearState(deps.db, chatIdOf(ctx));
  await sayKey(ctx, outcome.ok ? "proofSent" : rejectionKey(outcome));
}

async function sendStoredPhoto(
  ctx: Context,
  deps: BotDeps,
  objectKey: string,
  caption: string,
) {
  const bytes = await deps.getObjectBytes(objectKey);
  await ctx.replyWithPhoto(new InputFile(bytes, "photo.jpg"), { caption });
}

// Shows what the web review shows before a decision, because a button in a chat
// shouldn't make closing work easier than looking at the proof.
export async function reviewProof(
  ctx: Context,
  deps: BotDeps,
  ticketId: string,
) {
  const member = await requireMember(ctx, deps);
  if (!member) return;
  if (!member.roles.includes("supervisor")) {
    await sayKey(ctx, "notAllowed");
    return;
  }
  const ticket = await ticketInScope(ctx, deps, member, ticketId);
  if (!ticket) return;
  const attempt = ticket.attempts.find((item) => item.status === "pending");
  if (ticket.status !== "completion_submitted" || !attempt) {
    await sayKey(ctx, "staleTicket");
    return;
  }

  const locale = localeOf(ctx);
  const firstReport = ticket.reports[0];
  const beforePhoto = firstReport?.photos[0];
  if (beforePhoto) {
    await sendStoredPhoto(
      ctx,
      deps,
      beforePhoto.objectKey,
      t(locale, "before"),
    );
  }
  for (const photo of attempt.photos) {
    await sendStoredPhoto(ctx, deps, photo.objectKey, t(locale, "after"));
  }

  const location = ticket.locationName ?? firstReport?.locationText ?? "";
  const lines = [
    t(locale, "reviewHeading"),
    ticket.summary ?? firstReport?.description ?? "",
    location ? `${t(locale, "location")}: ${location}` : "",
    `${t(locale, "technician")}: ${attempt.submitterName}`,
    `${t(locale, "note")}: ${attempt.note}`,
    attempt.exceptionReason
      ? `${t(locale, "noPhotoException")}: ${attempt.exceptionReason}`
      : "",
    ...attempt.checklist.map(
      (item) =>
        `${item.checked ? "[x]" : "[ ]"} ${checklistLabel(item.label, locale)}`,
    ),
    ticketUrl(deps, ticketId),
  ];
  await ctx.reply(lines.filter(Boolean).join("\n"), {
    link_preview_options: { is_disabled: true },
    reply_markup: new InlineKeyboard()
      .text(t(locale, "approve"), `decide:a:${ticketId}:${ticket.revision}`)
      .row()
      .text(t(locale, "reject"), `decide:r:${ticketId}:${ticket.revision}`),
  });
}

export async function startDecision(
  ctx: Context,
  deps: BotDeps,
  decision: "accepted" | "rejected",
  ticketId: string,
  expectedRevision: number,
) {
  const member = await requireMember(ctx, deps);
  if (!member) return;
  if (!member.roles.includes("supervisor")) {
    await sayKey(ctx, "notAllowed");
    return;
  }
  await saveState(deps.db, chatIdOf(ctx), {
    flow: "decision",
    decision,
    ticketId,
    expectedRevision,
  });
  await sayKey(
    ctx,
    decision === "accepted" ? "askApproveReason" : "askRejectReason",
  );
}

export async function handleDecisionText(
  ctx: Context,
  deps: BotDeps,
  state: DecisionState,
  reason: string,
) {
  if (reason.length < MIN_REASON || reason.length > MAX_REASON) {
    await sayKey(ctx, "reasonInvalid");
    return;
  }
  const member = await requireMember(ctx, deps);
  if (!member) return;
  const ticket = await ticketInScope(ctx, deps, member, state.ticketId);
  if (!ticket) {
    await clearState(deps.db, chatIdOf(ctx));
    return;
  }

  const outcome = await decideCompletion(deps.db, {
    tenantId: member.tenantId,
    ticketId: state.ticketId,
    actor: actorOf(member),
    expectedRevision: state.expectedRevision,
    decision: state.decision,
    reason,
  });
  await clearState(deps.db, chatIdOf(ctx));

  if (!outcome.ok) {
    if (outcome.rejection.code === "missing_requirements") {
      await sayKey(
        ctx,
        outcome.rejection.missing.includes("independent_review")
          ? "selfReview"
          : "noProofPhoto",
      );
      return;
    }
    await sayKey(ctx, rejectionKey(outcome));
    return;
  }
  await say(
    ctx,
    t(localeOf(ctx), state.decision === "accepted" ? "approved" : "rejected"),
  );
}
