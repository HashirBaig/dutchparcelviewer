import {
  EARTH_SEARCH_URL,
  S2_COLLECTION,
  STAC_MAX_PAGES,
  STAC_PAGE_LIMIT,
} from "../constants/api";
import { MAX_CLOUD_COVER } from "../constants/analysis";
import { fetchJson } from "../lib/http";
import type { BBox } from "../types/parcel";
import type { StacItem, StacSearchResponse } from "../types/stac";

export async function searchSentinel2(
  bbox: BBox,
  datetime: string,
  signal: AbortSignal,
): Promise<StacItem[]> {
  const baseBody: Record<string, unknown> = {
    collections: [S2_COLLECTION],
    bbox,
    datetime,
    limit: STAC_PAGE_LIMIT,
    query: { "eo:cloud_cover": { lt: MAX_CLOUD_COVER } },
  };

  const items: StacItem[] = [];
  let body: Record<string, unknown> | null = baseBody;

  for (let page = 0; page < STAC_MAX_PAGES && body; page++) {
    const response: StacSearchResponse = await fetchJson<StacSearchResponse>(
      EARTH_SEARCH_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      },
    );
    items.push(...response.features);
    const next = response.links?.find(
      (link) => link.rel === "next" && link.body,
    );
    body = next?.body ? { ...baseBody, ...next.body } : null;
  }
  return items;
}
