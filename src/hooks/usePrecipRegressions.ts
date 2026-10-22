import { useMemo } from "react";
import { RANGE_PRESETS } from "../constants/dateFilter";
import { filterByRange, presetToRange, sameRange } from "../lib/dateRange";
import { buildPairs } from "../lib/precipPairs";
import { analyzePairs } from "../lib/regression";
import type { DailyPrecip } from "../types/precip";
import type { PeriodRegression } from "../types/regression";
import type { DateRange, NdviObservation } from "../types/timeseries";

export interface PrecipRegressions {
  periods: PeriodRegression[]; // the four presets
  selected: PeriodRegression; // whatever the slider currently covers
  activeId: string | null; // preset matching the slider, if any
}

export function usePrecipRegressions(
  observations: NdviObservation[],
  precip: DailyPrecip | null,
  year: number,
  range: DateRange,
  lagDays: number,
): PrecipRegressions | null {
  return useMemo(() => {
    if (!precip) return null;

    const build = (
      id: string,
      label: string,
      period: DateRange,
    ): PeriodRegression => {
      const points = buildPairs(
        filterByRange(observations, period),
        precip,
        lagDays,
      );
      return { id, label, range: period, points, result: analyzePairs(points) };
    };

    const periods = RANGE_PRESETS.map((preset) =>
      build(preset.id, preset.label, presetToRange(year, preset)),
    );
    return {
      periods,
      selected: build("selected", "Selected period", range),
      activeId: periods.find((p) => sameRange(p.range, range))?.id ?? null,
    };
  }, [observations, precip, year, range, lagDays]);
}
