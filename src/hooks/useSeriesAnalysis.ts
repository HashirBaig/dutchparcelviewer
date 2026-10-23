import { useEffect, useState } from "react";
import { errorMessage, isAbortError } from "../lib/errors";
import { runMarkers } from "../lib/markers/runMarkers";
import { getVerdict } from "../lib/markers/verdict";
import { loadSeries } from "../services/seriesLoader";
import type { AnalysisState } from "../types/analysis";
import type { Parcel } from "../types/parcel";
import type { NdviSeriesResult } from "../types/timeseries";

const INITIAL: AnalysisState = {
  parcelId: null,
  phase: "idle",
  progress: { done: 0, total: 0 },
  observations: [],
  pixels: null,
  markers: [],
  verdict: null,
  scenesTotal: 0,
  scenesFailed: 0,
  error: null,
};

export interface SeriesConfig {
  parcel: Parcel | null;
  enabled: boolean; // false = queued, nothing is fetched yet
  interval: string;
  cacheKey: string;
  ttlMs: number;
  withMarkers: boolean;
}

function toDoneState(
  parcel: Parcel,
  result: NdviSeriesResult,
  withMarkers: boolean,
): AnalysisState {
  const markers = withMarkers
    ? runMarkers(parcel.cropGroup, result.observations)
    : [];
  return {
    parcelId: parcel.id,
    phase: "done",
    progress: { done: result.itemsTotal, total: result.itemsTotal },
    observations: result.observations,
    pixels: result.pixels,
    markers,
    verdict: withMarkers ? getVerdict(markers) : null,
    scenesTotal: result.itemsTotal,
    scenesFailed: result.itemsFailed,
    error: null,
  };
}

export function useSeriesAnalysis(config: SeriesConfig): AnalysisState {
  const { parcel, enabled, interval, cacheKey, ttlMs, withMarkers } = config;
  const [state, setState] = useState<AnalysisState>(INITIAL);

  useEffect(() => {
    if (!parcel) {
      setState(INITIAL);
      return;
    }
    const base: AnalysisState = { ...INITIAL, parcelId: parcel.id };
    if (!enabled) {
      setState(base);
      return;
    }

    const controller = new AbortController();
    const live = () => !controller.signal.aborted; // ignore stragglers after a parcel change

    const run = async () => {
      try {
        const result = await loadSeries({
          parcel,
          interval,
          cacheKey,
          ttlMs,
          signal: controller.signal,
          onSearching: () =>
            live() && setState({ ...base, phase: "searching" }),
          onReading: (total) =>
            live() &&
            setState({
              ...base,
              phase: "reading",
              progress: { done: 0, total },
            }),
          onProgress: (progress) =>
            live() && setState((s) => ({ ...s, progress })),
        });
        if (!result || !live()) return;
        setState(toDoneState(parcel, result, withMarkers));
      } catch (error) {
        if (isAbortError(error)) return;
        setState({ ...base, phase: "error", error: errorMessage(error) });
      }
    };

    void run();
    return () => controller.abort();
  }, [parcel, enabled, interval, cacheKey, ttlMs, withMarkers]);

  // State from a previous parcel is never shown for the current one
  return parcel && state.parcelId === parcel.id
    ? state
    : { ...INITIAL, parcelId: parcel?.id ?? null };
}
