import type { DateRange } from "./timeseries";

export interface PairedPoint {
  date: string;
  doy: number;
  precipMm: number; // rain in the N days before the observation
  ndvi: number;
}

export interface RegressionResult {
  n: number;
  slope: number; // NDVI per mm
  intercept: number;
  r: number;
  r2: number;
  p: number | null;
  adjustedR: number | null; // partial correlation controlling for day of year
  adjustedP: number | null;
}

export interface PeriodRegression {
  id: string;
  label: string;
  range: DateRange;
  points: PairedPoint[];
  result: RegressionResult | null;
}
