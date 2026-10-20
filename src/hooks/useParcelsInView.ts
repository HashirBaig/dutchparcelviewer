import type * as L from "leaflet";
import { useEffect, useState } from "react";
import { MIN_PARCEL_ZOOM, PARCEL_FETCH_DEBOUNCE_MS } from "../constants/map";
import { errorMessage, isAbortError } from "../lib/errors";
import { fetchParcelsInBbox } from "../services/brpService";
import type { ParcelsViewState } from "../types/map";

const INITIAL: ParcelsViewState = {
  parcels: [],
  loading: false,
  error: null,
  zoomTooLow: false,
};

export function useParcelsInView(map: L.Map | null): ParcelsViewState {
  const [state, setState] = useState<ParcelsViewState>(INITIAL);

  useEffect(() => {
    if (!map) return;
    let controller: AbortController | null = null;
    let timer: number | undefined;

    const load = async () => {
      controller?.abort();
      if (map.getZoom() < MIN_PARCEL_ZOOM) {
        setState({ ...INITIAL, zoomTooLow: true });
        return;
      }
      controller = new AbortController();
      const b = map.getBounds();
      setState((s) => ({
        ...s,
        loading: true,
        error: null,
        zoomTooLow: false,
      }));
      try {
        const parcels = await fetchParcelsInBbox(
          [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
          controller.signal,
        );
        setState({ parcels, loading: false, error: null, zoomTooLow: false });
      } catch (error) {
        if (isAbortError(error)) return;
        setState((s) => ({ ...s, loading: false, error: errorMessage(error) }));
      }
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(load, PARCEL_FETCH_DEBOUNCE_MS);
    };

    map.on("moveend", schedule);
    schedule();
    return () => {
      map.off("moveend", schedule);
      window.clearTimeout(timer);
      controller?.abort();
    };
  }, [map]);

  return state;
}
