import {
  findIntakeSite,
  reportReference,
  submitReport,
  subscribeChatToReport,
} from "@streetproof/db";
import { MAX_PHOTOS } from "@streetproof/media/photos";
import { InlineKeyboard, type Context } from "grammy";
import { randomUUID } from "node:crypto";

import {
  chatIdOf,
  createRateLimiter,
  digestOf,
  localeOf,
  receivePhoto,
  say,
  sayKey,
  type BotDeps,
} from "./context";
import { t } from "./messages";
import { clearState, saveState, type ReportState } from "./state";

const OTHER_LOCATION = "other";
const MAX_VOICE_SECONDS = 60;
const MIN_DESCRIPTION = 5;
const MAX_DESCRIPTION = 2000;
const MAX_LOCATION_TEXT = 200;
const TEN_MINUTES_MS = 10 * 60 * 1000;

const isReportAllowed = createRateLimiter(20, TEN_MINUTES_MS);
const isVoiceAllowed = createRateLimiter(10, TEN_MINUTES_MS);

export async function startReport(
  ctx: Context,
  deps: BotDeps,
  intakeCode: string,
) {
  const site = await findIntakeSite(deps.db, intakeCode);
  if (!site) {
    await sayKey(ctx, "siteUnavailable");
    return;
  }
  const locale = localeOf(ctx);
  const keyboard = new InlineKeyboard();
  site.locations.forEach(function addLocation(location, index) {
    keyboard.text(location.name, `loc:${index}`).row();
  });
  keyboard.text(t(locale, "somewhereElse"), `loc:${OTHER_LOCATION}`);

  await saveState(deps.db, chatIdOf(ctx), {
    flow: "report",
    step: "location",
    tenantId: site.tenantId,
    siteId: site.id,
    submissionKey: randomUUID(),
    reportId: randomUUID(),
    locations: site.locations,
    locationChoice: null,
    locationText: null,
    description: null,
    transcript: null,
    photos: [],
  });
  await ctx.reply(t(locale, "reportIntro", { site: site.name }), {
    reply_markup: keyboard,
  });
}

export async function chooseLocation(
  ctx: Context,
  deps: BotDeps,
  state: ReportState,
  choice: string,
) {
  if (state.step !== "location") return;
  const chatId = chatIdOf(ctx);
  if (choice === OTHER_LOCATION) {
    await saveState(deps.db, chatId, {
      ...state,
      step: "location_text",
      locationChoice: OTHER_LOCATION,
    });
    await sayKey(ctx, "askLocationText");
    return;
  }
  const location = state.locations[Number(choice)];
  if (!location) return;
  await saveState(deps.db, chatId, {
    ...state,
    step: "description",
    locationChoice: location.id,
  });
  await sayKey(ctx, "askDescription");
}

async function acceptDescription(
  ctx: Context,
  deps: BotDeps,
  state: ReportState,
  description: string,
) {
  await saveState(deps.db, chatIdOf(ctx), {
    ...state,
    step: "photos",
    description,
    transcript: null,
  });
  await sayKey(ctx, "askPhotos", { max: MAX_PHOTOS });
}

export async function useTranscript(
  ctx: Context,
  deps: BotDeps,
  state: ReportState,
) {
  if (state.step !== "confirm_transcript" || !state.transcript) return;
  await acceptDescription(ctx, deps, state, state.transcript);
}

export async function handleReportText(
  ctx: Context,
  deps: BotDeps,
  state: ReportState,
  text: string,
) {
  switch (state.step) {
    case "location":
      await sayKey(ctx, "pressAButton");
      return;
    case "location_text": {
      if (text.length === 0 || text.length > MAX_LOCATION_TEXT) {
        await sayKey(ctx, "locationTextInvalid");
        return;
      }
      await saveState(deps.db, chatIdOf(ctx), {
        ...state,
        step: "description",
        locationText: text,
      });
      await sayKey(ctx, "askDescription");
      return;
    }
    case "description":
    case "confirm_transcript": {
      if (text.length < MIN_DESCRIPTION || text.length > MAX_DESCRIPTION) {
        await sayKey(ctx, "descriptionInvalid");
        return;
      }
      await acceptDescription(ctx, deps, state, text);
      return;
    }
    case "photos":
      await sayKey(ctx, "sendPhotoNow");
      return;
  }
}

// A transcript can be wrong, so it only becomes the description once confirmed.
export async function handleReportVoice(
  ctx: Context,
  deps: BotDeps,
  state: ReportState,
) {
  if (state.step !== "description" && state.step !== "confirm_transcript") {
    return;
  }
  const voice = ctx.message?.voice;
  if (!voice) return;
  if (!deps.transcribe) {
    await sayKey(ctx, "voiceNotAvailable");
    return;
  }
  if (voice.duration > MAX_VOICE_SECONDS) {
    await sayKey(ctx, "voiceTooLong");
    return;
  }
  if (!isVoiceAllowed(chatIdOf(ctx))) {
    await sayKey(ctx, "voiceTooMany");
    return;
  }

  const file = await ctx.api.getFile(voice.file_id);
  const text = file.file_path
    ? await deps.transcribe(await deps.downloadFile(file.file_path))
    : null;
  if (!text) {
    await sayKey(ctx, "voiceNotUnderstood");
    return;
  }

  await saveState(deps.db, chatIdOf(ctx), {
    ...state,
    step: "confirm_transcript",
    transcript: text.slice(0, MAX_DESCRIPTION),
  });
  const locale = localeOf(ctx);
  await ctx.reply(t(locale, "voiceConfirm", { text }), {
    reply_markup: new InlineKeyboard().text(t(locale, "useThis"), "voice:use"),
  });
}

export async function handleReportPhoto(
  ctx: Context,
  deps: BotDeps,
  state: ReportState,
) {
  if (state.step !== "photos") {
    await sayKey(ctx, "flowIdle");
    return;
  }
  if (state.photos.length >= MAX_PHOTOS) {
    await sayKey(ctx, "tooManyPhotos");
    return;
  }
  const photo = await receivePhoto(
    ctx,
    deps,
    `tenants/${state.tenantId}/reports/${state.reportId}`,
  );
  if (!photo) return;

  const photos = [...state.photos, photo];
  await saveState(deps.db, chatIdOf(ctx), { ...state, photos });
  const locale = localeOf(ctx);
  await ctx.reply(
    t(locale, "photoSaved", { count: photos.length, max: MAX_PHOTOS }),
    {
      reply_markup: new InlineKeyboard().text(
        t(locale, "sendReport"),
        "report:send",
      ),
    },
  );
}

export async function sendReport(
  ctx: Context,
  deps: BotDeps,
  state: ReportState,
) {
  if (state.step !== "photos") return;
  if (state.photos.length === 0) {
    await sayKey(ctx, "needPhoto");
    return;
  }
  const chatId = chatIdOf(ctx);
  if (!isReportAllowed(chatId)) {
    await sayKey(ctx, "tooManyReports");
    return;
  }

  const isOther = state.locationChoice === OTHER_LOCATION;
  const outcome = await submitReport(deps.db, {
    tenantId: state.tenantId,
    siteId: state.siteId,
    reportId: state.reportId,
    locationId: isOther ? null : state.locationChoice,
    locationText: isOther ? state.locationText : null,
    description: state.description ?? "",
    photos: state.photos,
    idempotencyKey: state.submissionKey,
    requestDigest: digestOf({
      locationChoice: state.locationChoice,
      locationText: state.locationText,
      description: state.description,
      photos: state.photos.map((photo) => photo.sha256),
    }),
  });
  if (!outcome.ok) {
    await clearState(deps.db, chatId);
    await sayKey(ctx, "reportFailed");
    return;
  }

  const locale = localeOf(ctx);
  await subscribeChatToReport(deps.db, {
    tenantId: state.tenantId,
    reportId: outcome.reportId,
    chatId,
    locale,
  });
  await clearState(deps.db, chatId);
  await say(
    ctx,
    t(locale, "reportSent", {
      reference: reportReference(outcome.reportId),
      url: `${deps.appUrl}/status#t=${outcome.reporterToken}`,
    }),
  );
}
