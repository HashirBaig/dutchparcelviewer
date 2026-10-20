export type MarkerStatus =
  | "green"
  | "yellow"
  | "red"
  | "insufficient"
  | "not-assessed";

export interface MarkerEvent {
  date: string;
  label: string;
}

export interface SeriesPoint {
  date: string;
  ndvi: number;
}

export interface MarkerResult {
  id: string;
  name: string;
  status: MarkerStatus;
  summary: string;
  events: MarkerEvent[];
  series?: SeriesPoint[]; // smoothed curve the marker used, for charting
}

export interface ParcelVerdict {
  status: MarkerStatus;
  summary: string;
}

export interface CropProfile {
  peakStartDoy: number;
  peakEndDoy: number;
  minPeakNdvi: number;
}

export interface ProfileMeta {
  source: string;
  region: string;
  year: number | null;
  sampleSize: number | null;
  lowerPercentile: number;
  upperPercentile: number;
}
