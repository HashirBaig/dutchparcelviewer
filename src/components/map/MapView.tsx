import { useRef, useState } from "react";
import { useLeafletMap } from "../../hooks/useLeafletMap";
import { useNdviOverlay } from "../../hooks/useNdviOverlay";
import { useParcelLayer } from "../../hooks/useParcelLayer";
import { useParcelsInView } from "../../hooks/useParcelsInView";
import { useZoomToParcel } from "../../hooks/useZoomToParcel";
import type { NdviMapState } from "../../types/ndviMap";
import type { Parcel } from "../../types/parcel";
import { CropLegend } from "./CropLegend";
import { MapNotice } from "./MapNotice";
import { NdviLegend } from "./NdviLegend";

interface Props {
  parcel: Parcel | null;
  ndviMap: NdviMapState;
  onSelect: (parcel: Parcel) => void;
}

export function MapView({ parcel, ndviMap, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showNdvi, setShowNdvi] = useState(true);

  const map = useLeafletMap(containerRef);
  const view = useParcelsInView(map);
  useParcelLayer(map, view.parcels, parcel?.id ?? null, onSelect);
  useZoomToParcel(map, parcel);
  useNdviOverlay(map, showNdvi ? ndviMap.image : null);

  return (
    <div className="map-wrap">
      <div ref={containerRef} className="map" />
      <MapNotice view={view} />
      <CropLegend />
      <NdviLegend state={ndviMap} visible={showNdvi} onToggle={setShowNdvi} />
    </div>
  );
}
