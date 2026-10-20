import type { Geometry } from "geojson";
import { MAX_PARCELS_PER_REQUEST, PDOK_BRP_BASE_URL } from "../constants/api";
import { classifyCrop } from "../lib/crop";
import { approxAreaHa } from "../lib/geometry";
import { fetchJson } from "../lib/http";
import type { BBox, Parcel } from "../types/parcel";

interface BrpFeature {
  id?: string | number;
  geometry: Geometry | null;
  properties: Record<string, unknown> | null;
}

let collectionIdPromise: Promise<string> | null = null;

/** Looks up the BRP collection id once, so we don't hard-code it. */
function getCollectionId(): Promise<string> {
  if (!collectionIdPromise) {
    collectionIdPromise = fetchJson<{ collections: { id: string }[] }>(
      `${PDOK_BRP_BASE_URL}/collections?f=json`,
    )
      .then(({ collections }) => {
        const match =
          collections.find((c) => /gewas/i.test(c.id)) ?? collections[0];
        if (!match)
          throw new Error("PDOK BRP service returned no collections.");
        return match.id;
      })
      .catch((error) => {
        collectionIdPromise = null;
        throw error;
      });
  }
  return collectionIdPromise;
}

const readString = (
  props: Record<string, unknown>,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
};

const readNumber = (
  props: Record<string, unknown>,
  keys: string[],
): number | null => {
  for (const key of keys) {
    const value = Number(props[key]);
    if (
      props[key] !== undefined &&
      props[key] !== null &&
      Number.isFinite(value)
    )
      return value;
  }
  return null;
};

function toParcel(feature: BrpFeature): Parcel | null {
  const geometry = feature.geometry;
  if (
    !geometry ||
    (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")
  )
    return null;

  const props = Object.fromEntries(
    Object.entries(feature.properties ?? {}).map(([k, v]) => [
      k.toLowerCase(),
      v,
    ]),
  );
  const cropName = readString(props, ["gewas", "gewasnaam"]) ?? "Unknown crop";
  const firstCoord = (
    geometry.type === "Polygon"
      ? geometry.coordinates[0][0]
      : geometry.coordinates[0][0][0]
  ).join(",");

  return {
    id: String(feature.id ?? props["id"] ?? firstCoord),
    cropName,
    cropCode: readNumber(props, ["gewascode"]),
    cropGroup: classifyCrop(cropName),
    year: readNumber(props, ["jaar", "year"]),
    areaHa: approxAreaHa(geometry),
    geometry,
  };
}

export async function fetchParcelsInBbox(
  bbox: BBox,
  signal: AbortSignal,
): Promise<Parcel[]> {
  const collectionId = await getCollectionId();
  const url =
    `${PDOK_BRP_BASE_URL}/collections/${collectionId}/items` +
    `?f=json&limit=${MAX_PARCELS_PER_REQUEST}&bbox=${bbox.join(",")}`;
  const { features } = await fetchJson<{ features: BrpFeature[] }>(url, {
    signal,
  });
  return features.map(toParcel).filter((p): p is Parcel => p !== null);
}
