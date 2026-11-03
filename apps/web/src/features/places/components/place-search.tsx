"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@streetproof/ui/components/autocomplete";
import {
  InputGroup,
  InputGroupAddon,
} from "@streetproof/ui/components/input-group";
import { Spinner } from "@streetproof/ui/components/spinner";
import { useRef, useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

import { useI18n } from "@/lib/i18n/client";
import type { MapPoint, PlaceSuggestion } from "@/lib/map";

const MIN_QUERY_LENGTH = 3;
const TYPING_PAUSE_MS = 300;

// Search-as-you-type over OpenStreetMap through /api/places, biased toward
// what the map already shows.
export function PlaceSearch({
  id,
  near,
  onChoose,
}: {
  id: string;
  near: MapPoint | null;
  onChoose: (place: PlaceSuggestion) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceSuggestion[]>([]);
  const [isSearching, startSearch] = useTransition();
  const inFlight = useRef<AbortController | null>(null);

  const search = useDebouncedCallback(function runSearch(text: string) {
    inFlight.current?.abort();
    if (text.trim().length < MIN_QUERY_LENGTH) {
      setPlaces([]);
      return;
    }
    const controller = new AbortController();
    inFlight.current = controller;
    const params = new URLSearchParams({ q: text });
    if (near) {
      params.set("lat", String(near.latitude));
      params.set("lon", String(near.longitude));
    }
    startSearch(async () => {
      try {
        const response = await fetch(`/api/places?${params}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as { places?: PlaceSuggestion[] };
        if (!controller.signal.aborted) setPlaces(body.places ?? []);
      } catch {
        if (!controller.signal.aborted) setPlaces([]);
      }
    });
  }, TYPING_PAUSE_MS);

  return (
    <Autocomplete
      items={places}
      value={query}
      onValueChange={(next: string) => {
        setQuery(next);
        search(next);
      }}
      itemToStringValue={(place: PlaceSuggestion) => place.label}
      filter={null}
    >
      <InputGroup className="h-9">
        <InputGroupAddon>
          {isSearching ? <Spinner /> : <HugeiconsIcon icon={Search01Icon} />}
        </InputGroupAddon>
        <AutocompleteInput
          id={id}
          placeholder={t("Search a street, building or area")}
        />
      </InputGroup>
      <AutocompleteContent hidden={places.length === 0}>
        <AutocompleteList>
          {(place: PlaceSuggestion) => (
            <AutocompleteItem
              key={`${place.label}-${place.latitude}-${place.longitude}`}
              value={place}
              onClick={() => onChoose(place)}
            >
              {place.label}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
