import type { Parcel } from "./parcel";

export interface BaseLayerDef {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export interface ParcelsViewState {
  parcels: Parcel[];
  loading: boolean;
  error: string | null;
  zoomTooLow: boolean;
}
