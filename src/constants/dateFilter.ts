import { SEASON_END_MONTH, SEASON_START_MONTH } from "./analysis";
import type { RangePreset } from "../types/dateFilter";

export const MIN_RANGE_DAYS = 14;

export const RANGE_PRESETS: RangePreset[] = [
  { id: "spring", label: "Spring", startMonth: 3, endMonth: 5 },
  { id: "summer", label: "Summer", startMonth: 6, endMonth: 8 },
  { id: "autumn", label: "Autumn", startMonth: 9, endMonth: 10 },
  {
    id: "full",
    label: "Full season",
    startMonth: SEASON_START_MONTH,
    endMonth: SEASON_END_MONTH,
  },
];

export const TICKS = {
  monthMinSpanDays: 120, // longer ranges get month ticks
  fortnightMinSpanDays: 60, // between 60 and 120 days: every 14 days
  fortnightStepDays: 14,
  weekStepDays: 7, // shorter ranges: weekly
} as const;

// Trend arrows only when the change is clear (NDVI per 30 days)
export const TREND_THRESHOLD = 0.02;
