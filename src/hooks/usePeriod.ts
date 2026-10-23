import { useCallback, useEffect, useState } from "react";
import type { PeriodMode, RangePreset } from "../types/dateFilter";
import type { DateRange } from "../types/timeseries";
import { useDateRange } from "./useDateRange";

/** Which view is active (last days or season), plus the season date range. */
export function usePeriod(year: number, resetKey: string | null) {
  const dateRange = useDateRange(year, resetKey);
  const [mode, setMode] = useState<PeriodMode>("recent");

  // A newly selected parcel always opens on the quick view
  useEffect(() => {
    setMode("recent");
  }, [resetKey]);

  const selectRecent = useCallback(() => setMode("recent"), []);

  const { applyPreset, setRange } = dateRange;
  const selectPreset = useCallback(
    (preset: RangePreset) => {
      applyPreset(preset);
      setMode("season");
    },
    [applyPreset],
  );
  const selectRange = useCallback(
    (range: DateRange) => {
      setRange(range);
      setMode("season");
    },
    [setRange],
  );

  return { mode, dateRange, selectRecent, selectPreset, selectRange };
}

export type PeriodController = ReturnType<typeof usePeriod>;
