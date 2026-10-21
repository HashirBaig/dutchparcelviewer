export interface NdviObservation {
  date: string; // YYYY-MM-DD
  ndvi: number;
  validFraction: number; // share of parcel pixels that were cloud-free
  itemId: string;
}

export interface NdviSeriesResult {
  observations: NdviObservation[];
  itemsTotal: number;
  itemsFailed: number;
}

export interface Progress {
  done: number;
  total: number;
}

export interface NdviComposite {
  date: string; // YYYY-MM-DD, midpoint of the bin
  doy: number;
  ndvi: number;
  index: number; // 12-day bin number within the year
}

/** Inclusive day-of-year range. */
export interface DateRange {
  startDoy: number;
  endDoy: number;
}

export interface RangeStats {
  count: number;
  mean: number | null;
  peak: NdviObservation | null;
  trendPer30Days: number | null; // least-squares slope of NDVI, per 30 days
}
