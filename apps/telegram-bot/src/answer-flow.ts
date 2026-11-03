import {
  answerClarificationFromChat,
  findOpenQuestion,
  isChatFollowingReport,
} from "@streetproof/db";
import type { Context } from "grammy";

import { chatIdOf, localeOf, say, sayKey, type BotDeps } from "./context";
import { t } from "./messages";
import { clearState, saveState, type AnswerState } from "./state";

const MIN_ANSWER = 2;
const MAX_ANSWER = 2000;

// Only a chat that follows the report may see or answer its question, the way
// only its receipt can on the status page.
export async function startAnswer(
  ctx: Context,
  deps: BotDeps,
  reportId: string,
) {
  const chatId = chatIdOf(ctx);
  const question = (await isChatFollowingReport(deps.db, chatId, reportId))
    ? await findOpenQuestion(deps.db, reportId)
    : null;
  if (!question) {
    await sayKey(ctx, "questionClosed");
    return;
  }
  await saveState(deps.db, chatId, {
    flow: "answer",
    reportId,
    clarificationId: question.id,
  });
  await say(
    ctx,
    t(localeOf(ctx), "askAnswer", { question: question.question }),
  );
}

export async function handleAnswerText(
  ctx: Context,
  deps: BotDeps,
  state: AnswerState,
  answer: string,
) {
  if (answer.length < MIN_ANSWER || answer.length > MAX_ANSWER) {
    await sayKey(ctx, "answerInvalid");
    return;
  }
  const chatId = chatIdOf(ctx);
  const outcome = await answerClarificationFromChat(deps.db, {
    chatId,
    reportId: state.reportId,
    clarificationId: state.clarificationId,
    answer,
  });
  await clearState(deps.db, chatId);
  await sayKey(ctx, outcome.ok ? "answerSent" : "questionClosed");
}
