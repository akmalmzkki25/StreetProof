"use client";

import { Button } from "@streetproof/ui/components/button";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n/client";
import { encodeWav } from "@streetproof/media/wav";

import { transcribeVoiceNote } from "../voice-action";

const SAMPLE_RATE = 16000;
const MAX_RECORDING_MS = 60_000;

type Status = "idle" | "recording" | "transcribing";

// Whatever the browser recorded, as the mono 16 kHz samples WAV needs.
async function toWavFile(recording: Blob) {
  const context = new OfflineAudioContext(1, 1, SAMPLE_RATE);
  const decoded = await context.decodeAudioData(await recording.arrayBuffer());
  const length = Math.ceil(decoded.duration * SAMPLE_RATE);
  const renderer = new OfflineAudioContext(1, length, SAMPLE_RATE);
  const source = renderer.createBufferSource();
  source.buffer = decoded;
  source.connect(renderer.destination);
  source.start();
  const rendered = await renderer.startRendering();
  const wav = encodeWav(rendered.getChannelData(0), SAMPLE_RATE);
  return new File([new Uint8Array(wav)], "voice-note.wav", {
    type: "audio/wav",
  });
}

export function VoiceNoteButton({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(function stopWhenLeaving() {
    return () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function transcribe(recording: Blob) {
    setStatus("transcribing");
    try {
      const data = new FormData();
      data.set("audio", await toWavFile(recording));
      const result = await transcribeVoiceNote(data);
      if (result.ok) onTranscript(result.text);
      else setError(result.error);
    } catch {
      setError("We couldn't make that out. Please try again, or type it.");
    }
    setStatus("idle");
  }

  async function start() {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(
        "This browser can't use the microphone. Please type it instead.",
      );
      return;
    }

    const chunks: Blob[] = [];
    const next = new MediaRecorder(stream);
    next.ondataavailable = (event) => chunks.push(event.data);
    next.onstop = () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      stream.getTracks().forEach((track) => track.stop());
      void transcribe(new Blob(chunks, { type: next.mimeType }));
    };
    next.start();
    recorder.current = next;
    setStatus("recording");
    stopTimer.current = setTimeout(() => next.stop(), MAX_RECORDING_MS);
  }

  function stop() {
    recorder.current?.stop();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={status === "transcribing"}
        onClick={status === "recording" ? stop : start}
        className="self-start max-sm:h-11"
      >
        {status === "recording"
          ? t("Stop recording")
          : status === "transcribing"
            ? t("Writing it down…")
            : t("Record a voice note")}
      </Button>
      <p
        role={error ? "alert" : "status"}
        className={
          error
            ? "type-caption text-destructive"
            : "type-caption text-muted-foreground"
        }
      >
        {error
          ? t(error)
          : status === "recording"
            ? t("Recording. Up to one minute.")
            : t("We write it down for you to check. The recording isn't kept.")}
      </p>
    </div>
  );
}
