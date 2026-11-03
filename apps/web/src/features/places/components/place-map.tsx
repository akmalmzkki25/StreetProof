"use client";

import dynamic from "next/dynamic";

import { useI18n } from "@/lib/i18n/client";
import { openStreetMapUrl, type MapPoint } from "@/lib/map";

import type { MapPin } from "./map-canvas";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-4xl bg-card shadow-card" />,
});

// A read-only map of where a building or a report is, with a link out for
// directions.
export function PlaceMap({ pins }: { pins: MapPin[] }) {
  const { t } = useI18n();
  const first: MapPoint | undefined = pins[0];
  if (!first) return null;

  return (
    <div className="flex flex-col gap-2">
      <MapCanvas ariaLabel={t("Map")} center={first} pins={pins} />
      <a
        href={openStreetMapUrl(first)}
        target="_blank"
        rel="noreferrer"
        className="type-caption self-start text-brand-text underline underline-offset-4"
      >
        {t("Open in OpenStreetMap")}
      </a>
    </div>
  );
}
