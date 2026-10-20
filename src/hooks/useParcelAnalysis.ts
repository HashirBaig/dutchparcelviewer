import { useEffect, useState } from "react";
import { errorMessage, isAbortError } from "../lib/errors";
import { seasonInterval } from "../lib/dates";
import { boundsOf, flattenPolygons } from "../lib/geometry";
import { runMarkers } from "../lib/markers/runMarkers";
import { getVerdict } from "../lib/markers/verdict";
import { loadCachedSeries, saveCachedSeries } from "../lib/seriesCache";
import { selectScenes } from "../lib/stacSelect";
import { buildNdviSeries } from "../services/ndviService";
import { searchSentinel2 } from "../services/stacService";
import type { AnalysisState } from "../types/analysis";
import type { BBox, Parcel } from "../types/parcel";
import type { NdviSeriesResult } from "../types/timeseries";

const INITIAL: AnalysisState = {
  phase: "idle",
  progress: { done: 0, total: 0 },
  observations: [],
  markers: [],
  verdict: null,
  scenesTotal: 0,
  scenesFailed: 0,
  error: null,
};

function toDoneState(parcel: Parcel, result: NdviSeriesResult): AnalysisState {
  const markers = runMarkers(parcel.cropGroup, result.observations);
  return {
    phase: "done",
    progress: { done: result.itemsTotal, total: result.itemsTotal },
    observations: result.observations,
    markers,
    verdict: getVerdict(markers),
    scenesTotal: result.itemsTotal,
    scenesFailed: result.itemsFailed,
    error: null,
  };
}

export function useParcelAnalysis(parcel: Parcel | null): AnalysisState {
  const [state, setState] = useState<AnalysisState>(INITIAL);

  useEffect(() => {
    if (!parcel) {
      setState(INITIAL);
      return;
    }
    const controller = new AbortController();

    const run = async () => {
      try {
        const year = parcel.year ?? new Date().getFullYear();
        const cacheKey = `${parcel.id}:${year}`;

        const cached = loadCachedSeries(cacheKey, year);
        if (cached) {
          setState(toDoneState(parcel, cached));
          return;
        }

        const bounds = boundsOf(flattenPolygons(parcel.geometry));

        setState({ ...INITIAL, phase: "searching" });
        const found = await searchSentinel2(
          bounds as BBox,
          seasonInterval(year),
          controller.signal,
        );
        const scenes = selectScenes(found, bounds);

        setState((s) => ({
          ...s,
          phase: "reading",
          progress: { done: 0, total: scenes.length },
        }));
        const result = await buildNdviSeries(
          parcel,
          scenes,
          (progress) => setState((s) => ({ ...s, progress })),
          controller.signal,
        );

        saveCachedSeries(cacheKey, result);
        setState(toDoneState(parcel, result));
      } catch (error) {
        if (isAbortError(error)) return;
        setState({ ...INITIAL, phase: "error", error: errorMessage(error) });
      }
    };

    void run();
    return () => controller.abort();
  }, [parcel]);

  return state;
}
