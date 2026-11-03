const MODEL = "muse-voice-transcribe-1.0";
const REQUEST_TIMEOUT_MS = 30_000;

export type TranscribeConfig = {
  apiKey: string;
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

type TranscribeResponse = {
  text?: unknown;
  transcript?: unknown;
  turns?: { transcript?: unknown }[];
};

// Depending on the mode, the text arrives whole or split into turns.
export function transcriptOf(payload: TranscribeResponse) {
  if (typeof payload.transcript === "string") return payload.transcript.trim();
  if (typeof payload.text === "string") return payload.text.trim();
  return (payload.turns ?? [])
    .map((turn) => (typeof turn.transcript === "string" ? turn.transcript : ""))
    .join(" ")
    .trim();
}

// Returns null on any failure: a voice note is a convenience, and the reporter can
// always type instead. The audio is sent once and never stored.
export async function transcribeWav(
  wav: Uint8Array,
  config: TranscribeConfig,
): Promise<string | null> {
  const body = new FormData();
  body.append(
    "request",
    new Blob(
      [
        JSON.stringify({
          model: MODEL,
          audioEncoding: "WAV",
          mode: "PUSH_TO_TALK",
          languageBias: ["Indonesian", "English"],
        }),
      ],
      { type: "application/json" },
    ),
  );
  body.append(
    "audio",
    new Blob([new Uint8Array(wav)], { type: "audio/wav" }),
    "voice-note.wav",
  );

  try {
    const response = await (config.fetchImpl ?? fetch)(
      `${config.baseUrl}/asr/transcribe`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: "application/json",
        },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
    if (!response.ok) return null;
    const text = transcriptOf((await response.json()) as TranscribeResponse);
    return text || null;
  } catch {
    return null;
  }
}
