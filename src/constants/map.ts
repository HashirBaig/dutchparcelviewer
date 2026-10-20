import type { LatLngTuple } from "leaflet";
import type { BaseLayerDef } from "../types/map";

export const DEFAULT_CENTER: LatLngTuple = [52.245, 6.74]; // farmland west of Enschede
export const DEFAULT_ZOOM = 14;
export const MIN_PARCEL_ZOOM = 14;
export const PARCEL_FETCH_DEBOUNCE_MS = 400;

export const BASE_LAYERS: BaseLayerDef[] = [
  {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
  {
    id: "aerial",
    name: "PDOK aerial",
    url: "https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{z}/{x}/{y}.jpeg",
    attribution: "Luchtfoto &copy; PDOK / Beeldmateriaal Nederland",
    maxZoom: 19,
  },
];
