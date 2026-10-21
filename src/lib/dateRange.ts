import type { RangePreset } from "../types/dateFilter";
import type { DateRange } from "../types/timeseries";
import { dayOfYear, monthStartDoy } from "./dates";

export const presetToRange = (
  year: number,
  preset: RangePreset,
): DateRange => ({
  startDoy: monthStartDoy(year, preset.startMonth),
  endDoy: monthStartDoy(year, preset.endMonth + 1) - 1,
});

export const sameRange = (a: DateRange, b: DateRange): boolean =>
  a.startDoy === b.startDoy && a.endDoy === b.endDoy;

export const inRange = (date: string, range: DateRange): boolean => {
  const doy = dayOfYear(date);
  return doy >= range.startDoy && doy <= range.endDoy;
};

export const filterByRange = <T extends { date: string }>(
  items: T[],
  range: DateRange,
): T[] => items.filter((item) => inRange(item.date, range));
