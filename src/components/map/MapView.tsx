import { useRef } from "react";
import { useLeafletMap } from "../../hooks/useLeafletMap";
import { useParcelLayer } from "../../hooks/useParcelLayer";
import { useParcelsInView } from "../../hooks/useParcelsInView";
import type { Parcel } from "../../types/parcel";
import { CropLegend } from "./CropLegend";
import { MapNotice } from "./MapNotice";

interface Props {
  selectedId: string | null;
  onSelect: (parcel: Parcel) => void;
}

export function MapView({ selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const map = useLeafletMap(containerRef);
  const view = useParcelsInView(map);
  useParcelLayer(map, view.parcels, selectedId, onSelect);

  return (
    <div className="map-wrap">
      <div ref={containerRef} className="map" />
      <MapNotice view={view} />
      <CropLegend />
    </div>
  );
}
