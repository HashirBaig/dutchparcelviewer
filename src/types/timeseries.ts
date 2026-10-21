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
