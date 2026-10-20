import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useEffect, useState, type RefObject } from "react";
import { BASE_LAYERS, DEFAULT_CENTER, DEFAULT_ZOOM } from "../constants/map";

export function useLeafletMap(
  containerRef: RefObject<HTMLDivElement>,
): L.Map | null {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = L.map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
    const layers: Record<string, L.TileLayer> = {};
    for (const def of BASE_LAYERS) {
      layers[def.name] = L.tileLayer(def.url, {
        attribution: def.attribution,
        maxZoom: def.maxZoom,
      });
    }
    layers[BASE_LAYERS[0].name].addTo(instance);
    L.control.layers(layers).addTo(instance);

    setMap(instance);
    return () => {
      instance.remove();
      setMap(null);
    };
  }, [containerRef]);

  return map;
}
