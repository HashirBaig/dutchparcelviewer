import { useCallback, useEffect, useMemo, useState } from "react";
import { presetToRange, sameRange } from "../lib/dateRange";
import { seasonBounds } from "../lib/dates";
import type { RangePreset } from "../types/dateFilter";
import type { DateRange } from "../types/timeseries";

export function useDateRange(year: number, resetKey: string | null) {
  const bounds = useMemo(() => seasonBounds(year), [year]);
  const [range, setRange] = useState<DateRange>(bounds);

  // New parcel or year: back to the full season
  useEffect(() => {
    setRange(bounds);
  }, [bounds, resetKey]);

  const applyPreset = useCallback(
    (preset: RangePreset) => setRange(presetToRange(year, preset)),
    [year],
  );
  const reset = useCallback(() => setRange(bounds), [bounds]);

  return {
    bounds,
    range,
    setRange,
    applyPreset,
    reset,
    isFull: sameRange(range, bounds),
  };
}

export type DateRangeController = ReturnType<typeof useDateRange>;
