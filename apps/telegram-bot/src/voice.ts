import {
  transcribeWav,
  type TranscribeConfig,
} from "@streetproof/media/transcribe";
import { encodeWav } from "@streetproof/media/wav";
import { OggOpusDecoder } from "ogg-opus-decoder";

const TARGET_SAMPLE_RATE = 16_000;

// Averaging each group keeps speech and needs no audio library. Opus always decodes
// to 48 kHz, so the step is a whole number.
function downsample(samples: Float32Array, sampleRate: number) {
  const step = Math.round(sampleRate / TARGET_SAMPLE_RATE);
  const output = new Float32Array(Math.floor(samples.length / step));
  for (let index = 0; index < output.length; index += 1) {
    let sum = 0;
    for (let offset = 0; offset < step; offset += 1) {
      sum += samples[index * step + offset] ?? 0;
    }
    output[index] = sum / step;
  }
  return output;
}

// Telegram records OGG Opus, and Meta's transcription only takes WAV.
export async function oggToWav(ogg: Uint8Array) {
  const decoder = new OggOpusDecoder();
  await decoder.ready;
  try {
    const { channelData, sampleRate, samplesDecoded } =
      await decoder.decodeFile(ogg);
    const channel = channelData[0];
    if (!channel || samplesDecoded === 0) return null;
    return encodeWav(downsample(channel, sampleRate), TARGET_SAMPLE_RATE);
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
