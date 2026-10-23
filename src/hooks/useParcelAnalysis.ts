import { seasonInterval } from "../lib/dates";
import { ttlForYear } from "../lib/seriesCache";
import type { AnalysisState } from "../types/analysis";
import type { Parcel } from "../types/parcel";
import { useSeriesAnalysis } from "./useSeriesAnalysis";

/** Full-season analysis. `enabled` lets the caller queue it behind the quick view. */
export function useParcelAnalysis(
  parcel: Parcel | null,
  enabled: boolean,
): AnalysisState {
  const year = parcel?.year ?? new Date().getFullYear();
  return useSeriesAnalysis({
    parcel,
    enabled,
    interval: seasonInterval(year),
    cacheKey: `${parcel?.id ?? ""}:${year}`, // same key as before, so existing cache entries still work
    ttlMs: ttlForYear(year),
    withMarkers: true,
  });
}
