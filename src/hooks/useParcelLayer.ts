import * as L from "leaflet";
import { useEffect, useRef } from "react";
import { getParcelStyle } from "../lib/parcelStyle";
import type { Parcel } from "../types/parcel";

export function useParcelLayer(
  map: L.Map | null,
  parcels: Parcel[],
  selectedId: string | null,
  onSelect: (parcel: Parcel) => void,
): void {
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!map) return;
    const group = L.featureGroup();

    for (const parcel of parcels) {
      const layer = L.geoJSON(parcel.geometry, {
        style: () => getParcelStyle(parcel.cropGroup, parcel.id === selectedId),
      });
      layer.bindTooltip(`${parcel.cropName} · ${parcel.areaHa.toFixed(1)} ha`, {
        sticky: true,
      });
      layer.on("click", () => onSelectRef.current(parcel));
      group.addLayer(layer);
    }

    group.addTo(map);
    return () => {
      group.remove();
    };
  }, [map, parcels, selectedId]);
}
