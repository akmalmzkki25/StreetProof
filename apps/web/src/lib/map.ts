// OpenFreeMap: OpenStreetMap vector tiles with no key and no usage limit. Styles,
// tiles, fonts and sprites all come from this one origin.
export const MAP_TILE_ORIGIN = "https://tiles.openfreemap.org";

export const MAP_STYLES = {
  light: `${MAP_TILE_ORIGIN}/styles/positron`,
  dark: `${MAP_TILE_ORIGIN}/styles/dark`,
} as const;

// Indonesia, for a map with nothing to centre on yet.
export const DEFAULT_MAP_VIEW = { latitude: -2.5, longitude: 118, zoom: 4 };

export type MapPoint = { latitude: number; longitude: number };

export type PlaceSuggestion = MapPoint & { label: string };

export function openStreetMapUrl(point: MapPoint) {
  return `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=18/${point.latitude}/${point.longitude}`;
}
