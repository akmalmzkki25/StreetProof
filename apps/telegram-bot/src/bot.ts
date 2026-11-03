import {
  disconnectChat,
  listChatReports,
  logEvent,
  redeemLinkCode,
} from "@streetproof/db";
import { Bot, type Context } from "grammy";

import {
  chatIdOf,
  createRateLimiter,
  localeOf,
  say,
  sayKey,
  type BotDeps,
} from "./context";
import { stageLabel, t } from "./messages";
import {
  chooseLocation,
  handleReportPhoto,
  handleReportText,
  handleReportVoice,
  sendReport,
  startReport,
  useTranscript,
} from "./report-flow";
import { clearState, loadState } from "./state";
import {
  acceptOrStart,
  answerCheck,
  handleDecisionText,
  handleProofPhoto,
  handleProofText,
  listReviews,
  listWork,
  reviewProof,
  sendProof,
  startDecision,
  startProof,
} from "./work-flow";

const isUpdateAllowed = createRateLimiter(40, 60 * 1000);

async function handleStart(ctx: Context, deps: BotDeps, payload: string) {
  const chatId = chatIdOf(ctx);
  if (payload.startsWith("s_")) {
    await startReport(ctx, deps, payload.slice(2));
    return;
  }
  if (payload.startsWith("l_")) {
    const linked = await redeemLinkCode(deps.db, {
      code: payload.slice(2),
      chatId,
      locale: localeOf(ctx),
    });
    if (!linked) {
      await sayKey(ctx, "linkExpired");
      return;
    }
    await (linked.kind === "member"
      ? sayKey(ctx, "memberLinked", { name: linked.name })
      : sayKey(ctx, "reportFollowed", { reference: linked.reference }));
    return;
  }
  await sayKey(ctx, "help");
}

async function handleCallback(ctx: Context, deps: BotDeps, data: string) {
  const [action, first, second, third] = data.split(":");
  const state = await loadState(deps.db, chatIdOf(ctx));

  switch (action) {
    case "loc":
      if (state?.flow === "report") {
        await chooseLocation(ctx, deps, state, first ?? "");
      }
      return;
    case "voice":
      if (state?.flow === "report") await useTranscript(ctx, deps, state);
      return;
    case "report":
      if (state?.flow === "report") await sendReport(ctx, deps, state);
      return;
    case "accept":
    case "start":
    case "resume":
      if (first) {
        await acceptOrStart(ctx, deps, action, first, Number(second));
      }
      return;
    case "proof":
      if (first === "send") {
        if (state?.flow === "proof") await sendProof(ctx, deps, state);
        return;
      }
      if (first) await startProof(ctx, deps, first, Number(second));
      return;
    case "check":
      if (state?.flow === "proof") {
        await answerCheck(ctx, deps, state, first ?? "", Number(second));
      }
      return;
    case "review":
      if (first) await reviewProof(ctx, deps, first);
      return;
    case "decide":
      if (second) {
        await startDecision(
          ctx,
          deps,
          first === "a" ? "accepted" : "rejected",
          second,
          Number(third),
        );
      }
      return;
  }
}

export function installHandlers(bot: Bot, deps: BotDeps) {
  bot.use(async function privateChatsOnly(ctx, next) {
    if (ctx.chat?.type !== "private") return;
    if (!isUpdateAllowed(chatIdOf(ctx))) return;
    await next();
  });

  bot.command("start", (ctx) => handleStart(ctx, deps, String(ctx.match)));
  bot.command("help", (ctx) => sayKey(ctx, "help"));
  bot.command("work", (ctx) => listWork(ctx, deps));
  bot.command("reviews", (ctx) => listReviews(ctx, deps));

  bot.command("status", async function showStatus(ctx) {
    const reports = await listChatReports(deps.db, chatIdOf(ctx));
    if (reports.length === 0) {
      await sayKey(ctx, "noReports");
      return;
    }
    const locale = localeOf(ctx);
    await say(
      ctx,
      reports
        .map((item) => `${item.reference}: ${stageLabel(item.stage, locale)}`)
        .join("\n"),
    );
  });

  bot.command("cancel", async function cancel(ctx) {
    const chatId = chatIdOf(ctx);
    const state = await loadState(deps.db, chatId);
    await clearState(deps.db, chatId);
    await sayKey(ctx, state ? "cancelled" : "nothingToCancel");
  });

  bot.command("stop", async function stop(ctx) {
    await disconnectChat(deps.db, chatIdOf(ctx));
    await sayKey(ctx, "disconnected");
  });

  bot.on("callback_query:data", async function onButton(ctx) {
    // Answered first, so the button stops spinning even if the work is slow.
    await ctx.answerCallbackQuery();
    await handleCallback(ctx, deps, ctx.callbackQuery.data);
  });

  bot.on("message:text", async function onText(ctx) {
    const text = ctx.message.text.trim();
    const state = await loadState(deps.db, chatIdOf(ctx));
    switch (state?.flow) {
      case "report":
        await handleReportText(ctx, deps, state, text);
        return;
      case "proof":
        await handleProofText(ctx, deps, state, text);
        return;
      case "decision":
        await handleDecisionText(ctx, deps, state, text);
        return;
      default:
        await sayKey(ctx, "flowIdle");
    }
  });

  bot.on("message:voice", async function onVoice(ctx) {
    const state = await loadState(deps.db, chatIdOf(ctx));
    if (state?.flow === "report") {
      await handleReportVoice(ctx, deps, state);
      return;
    }
    await sayKey(ctx, "flowIdle");
  });

  bot.on(["message:photo", "message:document"], async function onPhoto(ctx) {
    const state = await loadState(deps.db, chatIdOf(ctx));
    if (state?.flow === "report") {
      await handleReportPhoto(ctx, deps, state);
      return;
    }
    if (state?.flow === "proof") {
      await handleProofPhoto(ctx, deps, state);
      return;
    }
    await sayKey(ctx, "flowIdle");
  });

  // The error class only: messages and addresses can carry the token or report text.
  bot.catch(async function onError(error) {
    logEvent("error", "Telegram update failed", {
      errorClass: error.error?.constructor?.name ?? "unknown",
      updateId: error.ctx.update.update_id,
    });
    try {
      await say(error.ctx, t(localeOf(error.ctx), "somethingWrong"));
    } catch {
      // Telegram itself may be what failed, and the log already has this.
    }
  });
}
