import { CACHE_PREFIX, CACHE_TTL_MS } from "../constants/cache";
import type { NdviSeriesResult } from "../types/timeseries";

interface CacheEntry {
  savedAt: number;
  result: NdviSeriesResult;
}

// Past seasons never change, so they do not expire.
const ttlFor = (year: number) =>
  year < new Date().getFullYear() ? Number.POSITIVE_INFINITY : CACHE_TTL_MS;

export function loadCachedSeries(
  key: string,
  year: number,
): NdviSeriesResult | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    return Date.now() - entry.savedAt <= ttlFor(year) ? entry.result : null;
  } catch {
    return null;
  }
}

export function saveCachedSeries(key: string, result: NdviSeriesResult): void {
  try {
    const entry: CacheEntry = { savedAt: Date.now(), result };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // storage full or unavailable: caching is best-effort
  }
}
