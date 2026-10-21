import type { NdviObservation, RangeStats } from "../types/timeseries";
import { dayOfYear } from "./dates";

const MIN_POINTS_FOR_TREND = 3;
const TREND_UNIT_DAYS = 30;

export function computeRangeStats(observations: NdviObservation[]): RangeStats {
  const count = observations.length;
  if (count === 0)
    return { count: 0, mean: null, peak: null, trendPer30Days: null };

  const mean = observations.reduce((sum, o) => sum + o.ndvi, 0) / count;
  const peak = observations.reduce((best, o) =>
    o.ndvi > best.ndvi ? o : best,
  );

  let trendPer30Days: number | null = null;
  if (count >= MIN_POINTS_FOR_TREND) {
    const xs = observations.map((o) => dayOfYear(o.date));
    const meanX = xs.reduce((a, b) => a + b, 0) / count;
    let num = 0;
    let den = 0;
    observations.forEach((o, i) => {
      num += (xs[i] - meanX) * (o.ndvi - mean);
      den += (xs[i] - meanX) ** 2;
    });
    trendPer30Days = den > 0 ? (num / den) * TREND_UNIT_DAYS : null;
  }

  return { count, mean, peak, trendPer30Days };
}
