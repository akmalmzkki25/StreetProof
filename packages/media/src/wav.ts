const HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;

// Meta's transcription only takes WAV, and browsers record WebM or MP4. This writes
// mono 16-bit PCM, the plainest form of WAV.
export function encodeWav(samples: Float32Array, sampleRate: number) {
  const dataBytes = samples.length * BYTES_PER_SAMPLE;
  const view = new DataView(new ArrayBuffer(HEADER_BYTES + dataBytes));

  function writeText(offset: number, text: string) {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  }

  writeText(0, "RIFF");
  view.setUint32(4, HEADER_BYTES - 8 + dataBytes, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * BYTES_PER_SAMPLE, true);
  view.setUint16(32, BYTES_PER_SAMPLE, true);
  view.setUint16(34, BYTES_PER_SAMPLE * 8, true);
  writeText(36, "data");
  view.setUint32(40, dataBytes, true);

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(
      HEADER_BYTES + index * BYTES_PER_SAMPLE,
      clamped * 0x7fff,
      true,
    );
  });
  return new Uint8Array(view.buffer);
}

export function isWav(bytes: Uint8Array) {
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));
  return (
    bytes.length > HEADER_BYTES &&
    text(0, 4) === "RIFF" &&
    text(8, 12) === "WAVE"
  );
}
