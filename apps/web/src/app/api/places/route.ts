import { connection, type NextRequest } from "next/server";
import { z } from "zod";

import type { PlaceSuggestion } from "@/lib/map";
import { createRateLimiter } from "@/lib/rate-limit";

const REQUEST_TIMEOUT_MS = 5000;
const SUGGESTION_LIMIT = 6;

const query = z.object({
  q: z.string().trim().min(3).max(200),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
});

const isSearchAllowed = createRateLimiter({ limit: 60, windowMs: 60 * 1000 });

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, string | undefined>;
};

// Name, street and number, then the area, without repeating a part.
function labelOf(properties: Record<string, string | undefined>) {
  const street = [properties.street, properties.housenumber]
    .filter(Boolean)
    .join(" ");
  const parts = [
    properties.name,
    street,
    properties.district,
    properties.city,
    properties.state,
  ].filter((part): part is string => Boolean(part));
  return [...new Set(parts)].join(", ");
}

// Search as you type, through us rather than from the browser, so reporters'
// addresses never reach the geocoder and it can be swapped for a self-hosted one.
// Photon allows autocomplete; the public Nominatim server doesn't.
export async function GET(request: NextRequest) {
  await connection();
  const clientAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!isSearchAllowed(clientAddress)) {
    return Response.json({ places: [] }, { status: 429 });
  }

  const params = query.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!params.success) return Response.json({ places: [] });

  const geocoder = new URL(
    "/api/",
    process.env.GEOCODER_URL || "https://photon.komoot.io",
  );
  geocoder.searchParams.set("q", params.data.q);
  geocoder.searchParams.set("limit", String(SUGGESTION_LIMIT));
  if (params.data.lat !== undefined && params.data.lon !== undefined) {
    geocoder.searchParams.set("lat", String(params.data.lat));
    geocoder.searchParams.set("lon", String(params.data.lon));
  }

  try {
    const response = await fetch(geocoder, {
      headers: { "User-Agent": "StreetProof (facility repair reports)" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return Response.json({ places: [] });
    const body = (await response.json()) as { features?: PhotonFeature[] };
    const places: PlaceSuggestion[] = (body.features ?? []).flatMap(
      function toPlace(feature) {
        const [longitude, latitude] = feature.geometry?.coordinates ?? [];
        const label = labelOf(feature.properties ?? {});
        if (latitude === undefined || longitude === undefined || !label) {
          return [];
        }
        return [{ label, latitude, longitude }];
      },
    );
    return Response.json({ places });
  } catch {
    // A search that fails is the same as one that finds nothing.
    return Response.json({ places: [] });
  }
}
