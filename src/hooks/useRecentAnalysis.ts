import { RECENT_CACHE_TTL_MS } from "../constants/cache";
import { getRecentWindow, recentInterval } from "../lib/recent";
import type { AnalysisState } from "../types/analysis";
import type { Parcel } from "../types/parcel";
import { useSeriesAnalysis } from "./useSeriesAnalysis";

/** Quick view: only the last few days of scenes. Starts immediately. */
export function useRecentAnalysis(parcel: Parcel | null): AnalysisState {
  const recentWindow = getRecentWindow();
  return useSeriesAnalysis({
    parcel,
    enabled: true,
    interval: recentInterval(recentWindow),
    cacheKey: `${parcel?.id ?? ""}:recent:${recentWindow.to}`,
    ttlMs: RECENT_CACHE_TTL_MS,
    withMarkers: false,
  });
}
