"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useTheme } from "next-themes";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { useEffect, useRef } from "react";

import { DEFAULT_MAP_VIEW, MAP_STYLES, type MapPoint } from "@/lib/map";

export type MapPin = MapPoint & { label: string; tone?: "primary" | "muted" };

// The map itself, loaded only where a page shows one: MapLibre is large.
export default function MapCanvas({
  pins,
  center,
  onPick,
  ariaLabel,
}: {
  pins: MapPin[];
  center: MapPoint | null;
  // When given, a click or a dragged pin picks the point.
  onPick?: (point: MapPoint) => void;
  ariaLabel: string;
}) {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const focus = center ?? pins[0] ?? null;

  useEffect(() => {
    if (focus) {
      mapRef.current?.flyTo({
        center: [focus.longitude, focus.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 16),
        essential: false,
      });
    }
  }, [focus?.latitude, focus?.longitude]);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="h-64 overflow-hidden rounded-4xl shadow-card"
    >
      <Map
        ref={mapRef}
        initialViewState={
          focus
            ? { latitude: focus.latitude, longitude: focus.longitude, zoom: 16 }
            : DEFAULT_MAP_VIEW
        }
        mapStyle={
          resolvedTheme === "light" ? MAP_STYLES.light : MAP_STYLES.dark
        }
        cursor={onPick ? "crosshair" : "grab"}
        onClick={(event) =>
          onPick?.({
            latitude: event.lngLat.lat,
            longitude: event.lngLat.lng,
          })
        }
        cooperativeGestures
        // OpenStreetMap's licence needs the credit; compact keeps it to an icon.
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {pins.map((pin) => (
          <Marker
            key={`${pin.label}-${pin.latitude}-${pin.longitude}`}
            latitude={pin.latitude}
            longitude={pin.longitude}
            anchor="bottom"
            // MapLibre paints the pin as SVG, which can't read CSS variables:
            // these are --brand and the dark --muted-foreground.
            color={pin.tone === "muted" ? "#8a8f98" : "#ff2056"}
            draggable={Boolean(onPick)}
            onDragEnd={(event) =>
              onPick?.({
                latitude: event.lngLat.lat,
                longitude: event.lngLat.lng,
              })
            }
          />
        ))}
      </Map>
    </div>
  );
}
