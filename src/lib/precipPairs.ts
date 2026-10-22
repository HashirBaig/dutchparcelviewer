import type { DailyPrecip } from "../types/precip";
import type { PairedPoint } from "../types/regression";
import type { NdviObservation } from "../types/timeseries";
import { dayOfYear, daysBetween } from "./dates";

/** Rain summed over the lagDays before `date` (the overpass day itself excluded). Null if any day is missing. */
export function sumPrecipBefore(
  precip: DailyPrecip,
  date: string,
  lagDays: number,
): number | null {
  const end = daysBetween(precip.startDate, date) - 1;
  const start = end - lagDays + 1;
  if (start < 0 || end >= precip.values.length) return null;

  let sum = 0;
  for (let i = start; i <= end; i++) {
    const value = precip.values[i];
    if (Number.isNaN(value)) return null;
    sum += value;
  }
  return sum;
}

export function buildPairs(
  observations: NdviObservation[],
  precip: DailyPrecip,
  lagDays: number,
): PairedPoint[] {
  return observations.flatMap((observation) => {
    const precipMm = sumPrecipBefore(precip, observation.date, lagDays);
    return precipMm === null
      ? []
      : [
          {
            date: observation.date,
            doy: dayOfYear(observation.date),
            precipMm,
            ndvi: observation.ndvi,
          },
        ];
  });
}
