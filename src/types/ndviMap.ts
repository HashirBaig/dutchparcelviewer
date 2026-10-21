import type { LatLngBoundsExpression } from "leaflet";

export interface NdviClass {
  id: string;
  label: string;
  min: number; // inclusive lower bound
  color: string;
}

export interface ClassShare {
  cls: NdviClass;
  index: number;
  share: number; // 0-1 of valid pixels
}

export interface NdviMapImage {
  url: string;
  bounds: LatLngBoundsExpression;
}

export type NdviMapStatus = "idle" | "loading" | "empty" | "ready";

export interface NdviMapState {
  status: NdviMapStatus;
  image: NdviMapImage | null;
  shares: ClassShare[];
  sceneCount: number;
  coverage: number | null; // share of parcel pixels with data
}
