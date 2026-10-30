"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function toRgb(color: string, backdrop = "#fff") {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }
  context.fillStyle = backdrop;
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue] as [number, number, number];
}

function toHex(rgb: number[]) {
  return `#${rgb.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function luminance(rgb: [number, number, number]) {
  const channels = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(
  first: [number, number, number],
  second: [number, number, number],
) {
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  const light = Math.max(firstLuminance, secondLuminance);
  const dark = Math.min(firstLuminance, secondLuminance);
  return (light + 0.05) / (dark + 0.05);
}

function wcagLevel(ratio: number) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function ColorPair({
  name,
  background,
  foreground,
  className,
}: {
  name: string;
  background: string;
  foreground: string;
  className?: string;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<{
    ratio: number;
    hex: string;
  } | null>(null);

  useEffect(() => {
    const element = surfaceRef.current;
    if (!element) {
      return;
    }
    function measure() {
      if (!element) {
        return;
      }
      const style = getComputedStyle(element);
      const pageColor = getComputedStyle(document.body).backgroundColor;
      const surface = toRgb(style.backgroundColor, pageColor);
      if (!surface) {
        return;
      }
      const text = toRgb(style.color, toHex(surface));
      if (text) {
        setMeasurement({
          ratio: contrastRatio(surface, text),
          hex: toHex(surface),
        });
      }
    }
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div
        ref={surfaceRef}
        style={{
          backgroundColor: `var(--${background})`,
          color: `var(--${foreground})`,
        }}
        className="flex h-24 items-end justify-between p-4"
      >
        <span className="font-heading text-2xl font-semibold">Aa</span>
        {measurement ? (
          <span className="rounded-full border border-current/20 px-2 py-0.5 font-mono text-xs">
            {measurement.ratio.toFixed(2)} {wcagLevel(measurement.ratio)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5 bg-background p-3">
        <span className="text-sm font-medium">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          --{background} / --{foreground}
        </span>
        {measurement ? (
          <span className="font-mono text-xs text-muted-foreground">
            {measurement.hex}
          </span>
        ) : null}
      </div>
    </div>
  );
}
