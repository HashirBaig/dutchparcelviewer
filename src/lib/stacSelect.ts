import { containsBounds, type Bounds } from "./geometry";
import type { StacItem } from "../types/stac";

const COVERS_BONUS = 1000;

function coversParcel(item: StacItem, bounds: Bounds): boolean {
  const geometry = item.geometry;
  if (!geometry) return false;
  if (geometry.type === "Polygon")
    return containsBounds(geometry.coordinates, bounds);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) =>
      containsBounds(polygon, bounds),
    );
  }
  return false;
}

/**
 * Keeps one scene per acquisition date. Overlapping tiles return the same
 * overpass more than once, so prefer the tile whose footprint covers the
 * parcel, then the lowest tile-level cloud cover.
 */
export function selectScenes(
  items: StacItem[],
  parcelBounds: Bounds,
): StacItem[] {
  const score = (item: StacItem) =>
    (coversParcel(item, parcelBounds) ? COVERS_BONUS : 0) -
    (item.properties["eo:cloud_cover"] ?? 100);

  const bestByDate = new Map<string, StacItem>();
  for (const item of items) {
    const date = item.properties.datetime.slice(0, 10);
    const current = bestByDate.get(date);
    if (!current || score(item) > score(current)) bestByDate.set(date, item);
  }

  return [...bestByDate.values()].sort((a, b) =>
    a.properties.datetime.localeCompare(b.properties.datetime),
  );
}
