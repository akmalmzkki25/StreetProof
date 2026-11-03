import {
  transcribeWav,
  type TranscribeConfig,
} from "@streetproof/media/transcribe";
import { encodeWav } from "@streetproof/media/wav";
import { OggOpusDecoder } from "ogg-opus-decoder";

// Speech needs no more than this, and it keeps the upload small.
const TARGET_SAMPLE_RATE = 16_000;

// Telegram records OGG Opus, and Meta's transcription only takes WAV.
export async function oggToWav(ogg: Uint8Array) {
  const decoder = new OggOpusDecoder();
  await decoder.ready;
  try {
    const { channelData, sampleRate, samplesDecoded } =
      await decoder.decodeFile(ogg);
    const channel = channelData[0];
    if (!channel || samplesDecoded === 0) return null;
    return encodeWav(channel, sampleRate, TARGET_SAMPLE_RATE);
  } finally {
    decoder.free();
  }
}

// Null on any failure: the sender can always type instead.
export async function transcribeOgg(
  ogg: Uint8Array,
  config: TranscribeConfig,
): Promise<string | null> {
  try {
    const wav = await oggToWav(ogg);
    return wav ? await transcribeWav(wav, config) : null;
  } catch {
    return null;
  }
}
