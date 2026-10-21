import { MONTH_LABELS } from "../constants/chart";
import { TICKS } from "../constants/dateFilter";
import type { DateRange } from "../types/timeseries";
import { formatDoy, monthStartDoy } from "./dates";

export interface Tick {
  doy: number;
  label: string;
}

/** Month ticks for long ranges, dated ticks for short ones. */
export function buildTicks(year: number, range: DateRange): Tick[] {
  const span = range.endDoy - range.startDoy;

  if (span > TICKS.monthMinSpanDays) {
    return MONTH_LABELS.flatMap((label, i) => {
      const doy = monthStartDoy(year, i + 1);
      return doy >= range.startDoy && doy <= range.endDoy
        ? [{ doy, label }]
        : [];
    });
  }

  const step =
    span > TICKS.fortnightMinSpanDays
      ? TICKS.fortnightStepDays
      : TICKS.weekStepDays;
  const ticks: Tick[] = [];
  for (let doy = range.startDoy; doy <= range.endDoy; doy += step) {
    ticks.push({ doy, label: formatDoy(year, doy) });
  }
  return ticks;
}
