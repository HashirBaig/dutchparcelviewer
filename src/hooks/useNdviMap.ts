import { useDeferredValue, useMemo } from "react";
import { summarizeValues } from "../lib/ndviClasses";
import { aggregateStack } from "../lib/pixelAggregate";
import { renderNdviImage } from "../lib/renderNdviMap";
import type { AnalysisState } from "../types/analysis";
import type { NdviMapState } from "../types/ndviMap";
import type { Parcel } from "../types/parcel";
import type { DateRange } from "../types/timeseries";

const IDLE: NdviMapState = {
  status: "idle",
  image: null,
  shares: [],
  sceneCount: 0,
  coverage: null,
};
const LOADING: NdviMapState = { ...IDLE, status: "loading" };
const EMPTY: NdviMapState = { ...IDLE, status: "empty" };

export function useNdviMap(
  parcel: Parcel | null,
  source: Pick<AnalysisState, "phase" | "pixels">,
  range: DateRange,
): NdviMapState {
  // Defer the range so dragging the slider stays smooth while the image re-renders
  const deferredRange = useDeferredValue(range);
  const { phase, pixels } = source;

  return useMemo(() => {
    if (!parcel) return IDLE;
    if (phase === "idle" || phase === "searching" || phase === "reading")
      return LOADING;
    if (phase === "error" || !pixels) return EMPTY;
    if (pixels.parcelId !== parcel.id) return LOADING;

    const aggregated = aggregateStack(pixels, deferredRange);
    if (aggregated.sceneCount === 0) return EMPTY;

    const image = renderNdviImage(aggregated, parcel.geometry);
    if (!image) return EMPTY;

    const { shares, validCount } = summarizeValues(aggregated.values);
    return {
      status: "ready",
      image,
      shares,
      sceneCount: aggregated.sceneCount,
      coverage: pixels.insideCount > 0 ? validCount / pixels.insideCount : null,
    };
  }, [parcel, phase, pixels, deferredRange]);
}
