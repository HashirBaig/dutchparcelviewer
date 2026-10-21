import * as L from "leaflet";
import { useEffect } from "react";
import {
  NDVI_OVERLAY_OPACITY,
  NDVI_PANE,
  NDVI_PANE_Z_INDEX,
} from "../constants/ndviMap";
import type { NdviMapImage } from "../types/ndviMap";

export function useNdviOverlay(
  map: L.Map | null,
  image: NdviMapImage | null,
): void {
  useEffect(() => {
    if (!map || !image) return;

    const pane = map.getPane(NDVI_PANE) ?? map.createPane(NDVI_PANE);
    pane.style.zIndex = String(NDVI_PANE_Z_INDEX);

    const overlay = L.imageOverlay(image.url, image.bounds, {
      pane: NDVI_PANE,
      opacity: NDVI_OVERLAY_OPACITY,
      interactive: false, // clicks fall through to the parcel outline
      className: "ndvi-overlay",
    }).addTo(map);

    return () => {
      overlay.remove();
    };
  }, [map, image]);
}
