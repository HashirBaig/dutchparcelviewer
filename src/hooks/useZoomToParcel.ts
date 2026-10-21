import * as L from "leaflet";
import { useEffect } from "react";
import {
  ZOOM_TO_PARCEL_MAX,
  ZOOM_TO_PARCEL_PADDING,
  ZOOM_TO_PARCEL_SECONDS,
} from "../constants/ndviMap";
import type { Parcel } from "../types/parcel";

export function useZoomToParcel(
  map: L.Map | null,
  parcel: Parcel | null,
): void {
  const parcelId = parcel?.id;

  useEffect(() => {
    if (!map || !parcel) return;
    map.flyToBounds(L.geoJSON(parcel.geometry).getBounds(), {
      padding: [ZOOM_TO_PARCEL_PADDING, ZOOM_TO_PARCEL_PADDING],
      maxZoom: ZOOM_TO_PARCEL_MAX,
      duration: ZOOM_TO_PARCEL_SECONDS,
    });
    // only re-zoom when a different parcel is selected
  }, [map, parcelId]);
}
