export interface RangePreset {
  id: string;
  label: string;
  startMonth: number; // 1-12, inclusive
  endMonth: number; // 1-12, inclusive
}

export type PeriodMode = "recent" | "season";
