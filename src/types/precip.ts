export interface DailyPrecip {
  startDate: string; // YYYY-MM-DD of index 0
  values: number[]; // mm per day, NaN where the API had no value
}

export type PrecipStatus = "idle" | "loading" | "ready" | "error";

export interface PrecipState {
  status: PrecipStatus;
  data: DailyPrecip | null;
  error: string | null;
}
