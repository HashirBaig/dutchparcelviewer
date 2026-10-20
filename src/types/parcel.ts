import type { MultiPolygon, Polygon } from "geojson";

export type BBox = [west: number, south: number, east: number, north: number];
export type CropGroup =
  | "grassland"
  | "maize"
  | "potato"
  | "sugarbeet"
  | "cereal"
  | "other";
export type ParcelGeometry = Polygon | MultiPolygon;

export interface Parcel {
  id: string;
  cropName: string;
  cropCode: number | null;
  cropGroup: CropGroup;
  year: number | null;
  areaHa: number;
  geometry: ParcelGeometry;
}
