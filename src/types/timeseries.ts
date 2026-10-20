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
