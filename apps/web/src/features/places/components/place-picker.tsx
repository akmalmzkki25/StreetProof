"use client";

import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@streetproof/ui/components/field";
import dynamic from "next/dynamic";
import { useState } from "react";

import { useI18n } from "@/lib/i18n/client";
import type { MapPoint } from "@/lib/map";

import { PlaceSearch } from "./place-search";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-4xl bg-card shadow-card" />,
});

// Search or tap the map to set a point. The form receives latitude, longitude
// and, with withAddress, the chosen place's name, as hidden fields.
export function PlacePicker({
  id,
  label,
  description,
  initial,
  center,
  withAddress = false,
}: {
  id: string;
  label: string;
  description?: string;
  initial: (MapPoint & { address?: string | null }) | null;
  center: MapPoint | null;
  withAddress?: boolean;
}) {
  const { t } = useI18n();
  const [point, setPoint] = useState<MapPoint | null>(
    initial
      ? { latitude: initial.latitude, longitude: initial.longitude }
      : null,
  );
  const [address, setAddress] = useState(initial?.address ?? "");
  const [locateError, setLocateError] = useState<string | null>(null);

  function useMyLocation() {
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setPoint({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () =>
        setLocateError(
          t("Your location isn't available. Search or tap the map instead."),
        ),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor={`${id}-search`}>{t(label)}</FieldLabel>
      <PlaceSearch
        id={`${id}-search`}
        near={point ?? center}
        onChoose={(place) => {
          setPoint({ latitude: place.latitude, longitude: place.longitude });
          setAddress(place.label);
        }}
      />
      <MapCanvas
        ariaLabel={t("Map. Tap to place the pin, or drag it.")}
        center={point ?? center}
        pins={point ? [{ ...point, label: address || t("Chosen spot") }] : []}
        onPick={setPoint}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useMyLocation}
        >
          {t("Use my location")}
        </Button>
        {point ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPoint(null);
              setAddress("");
            }}
          >
            {t("Remove pin")}
          </Button>
        ) : null}
      </div>
      {locateError ? (
        <p role="alert" className="type-caption text-destructive">
          {locateError}
        </p>
      ) : null}
      {description ? (
        <FieldDescription>{t(description)}</FieldDescription>
      ) : null}
      {point ? (
        <>
          <input type="hidden" name="latitude" value={point.latitude} />
          <input type="hidden" name="longitude" value={point.longitude} />
          {withAddress ? (
            <input type="hidden" name="address" value={address} />
          ) : null}
        </>
      ) : null}
    </Field>
  );
}
