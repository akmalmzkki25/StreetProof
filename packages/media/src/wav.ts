import * as wavefile from "wavefile";

// Bundlers read wavefile's ES module, which has a named export; Node reads its
// CommonJS build, which only has a default. Take the class from whichever loaded.
const { WaveFile } =
  "WaveFile" in wavefile
    ? wavefile
    : (wavefile as unknown as { default: typeof wavefile }).default;

// Meta's transcription only takes WAV, and browsers record WebM or MP4 while
// Telegram sends OGG. This writes mono 16-bit PCM, the plainest form of WAV,
// resampling first when asked.
export function encodeWav(
  samples: Float32Array,
  sampleRate: number,
  targetSampleRate: number = sampleRate,
) {
  const wav = new WaveFile();
  wav.fromScratch(1, sampleRate, "32f", samples);
  if (targetSampleRate !== sampleRate) wav.toSampleRate(targetSampleRate);
  wav.toBitDepth("16");
  return wav.toBuffer();
}

export function isWav(bytes: Uint8Array) {
  try {
    new WaveFile(bytes);
    return true;
  } catch {
    return false;
  }
}
