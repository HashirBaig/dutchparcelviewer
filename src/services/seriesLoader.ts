import { boundsOf, flattenPolygons } from "../lib/geometry";
import { loadCachedSeries, saveCachedSeries } from "../lib/seriesCache";
import { selectScenes } from "../lib/stacSelect";
import type { BBox, Parcel } from "../types/parcel";
import type { NdviSeriesResult, Progress } from "../types/timeseries";
import { buildNdviSeries } from "./ndviService";
import { searchSentinel2 } from "./stacService";

export interface LoadSeriesOptions {
  parcel: Parcel;
  interval: string; // STAC datetime interval
  cacheKey: string;
  ttlMs: number;
  signal: AbortSignal;
  onSearching: () => void;
  onReading: (total: number) => void;
  onProgress: (progress: Progress) => void;
}

/** Cache lookup, STAC search, scene selection and NDVI extraction for one date interval. */
export async function loadSeries(
  options: LoadSeriesOptions,
): Promise<NdviSeriesResult | null> {
  const { parcel, interval, cacheKey, ttlMs, signal } = options;

  const cached = await loadCachedSeries(cacheKey, ttlMs);
  if (signal.aborted) return null;
  if (cached) return cached;

  const bounds = boundsOf(flattenPolygons(parcel.geometry));

  options.onSearching();
  const found = await searchSentinel2(bounds as BBox, interval, signal);
  const scenes = selectScenes(found, bounds);

  options.onReading(scenes.length);
  const result = await buildNdviSeries(
    parcel,
    scenes,
    options.onProgress,
    signal,
  );

  void saveCachedSeries(cacheKey, result);
  return result;
}
