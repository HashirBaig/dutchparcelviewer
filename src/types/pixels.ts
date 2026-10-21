import type { GridSpec } from "./raster";

export interface PixelGrid extends GridSpec {
  epsg: number;
}

export interface PixelScene {
  date: string;
  itemId: string;
  ndvi: Float32Array; // NaN where outside the parcel or not clear
}

export interface PixelStack {
  parcelId: string;
  grid: PixelGrid;
  insideCount: number; // pixels whose centre lies inside the parcel
  scenes: PixelScene[];
}

export interface AggregatedMap {
  grid: PixelGrid;
  values: Float32Array; // per-pixel median NDVI, NaN = no data
  sceneCount: number;
}
