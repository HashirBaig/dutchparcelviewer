import { useEffect, useState } from "react";
import { errorMessage, isAbortError } from "../lib/errors";
import { seasonInterval } from "../lib/dates";
import { boundsOf, flattenPolygons } from "../lib/geometry";
import { getVerdict } from "../lib/markers/verdict";
import { runMarkers } from "../lib/markers/runMarkers";
import { buildNdviSeries } from "../services/ndviService";
import { searchSentinel2 } from "../services/stacService";
import type { AnalysisState } from "../types/analysis";
import type { BBox, Parcel } from "../types/parcel";

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
        const bbox = boundsOf(flattenPolygons(parcel.geometry)) as BBox;

        setState({ ...INITIAL, phase: "searching" });
        const items = await searchSentinel2(
          bbox,
          seasonInterval(year),
          controller.signal,
        );

        setState((s) => ({
          ...s,
          phase: "reading",
          progress: { done: 0, total: items.length },
        }));
        const result = await buildNdviSeries(
          parcel,
          items,
          (progress) => setState((s) => ({ ...s, progress })),
          controller.signal,
        );

        const markers = runMarkers(parcel.cropGroup, result.observations);
        setState({
          phase: "done",
          progress: { done: items.length, total: items.length },
          observations: result.observations,
          markers,
          verdict: getVerdict(markers),
          scenesTotal: result.itemsTotal,
          scenesFailed: result.itemsFailed,
          error: null,
        });
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
