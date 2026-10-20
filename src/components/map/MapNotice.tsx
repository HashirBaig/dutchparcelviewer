import { MIN_PARCEL_ZOOM } from "../../constants/map";
import type { ParcelsViewState } from "../../types/map";

export function MapNotice({ view }: { view: ParcelsViewState }) {
  let message: string | null = null;
  if (view.error) message = `Could not load parcels: ${view.error}`;
  else if (view.zoomTooLow)
    message = `Zoom in (level ${MIN_PARCEL_ZOOM}+) to load parcels`;
  else if (view.loading) message = "Loading parcels…";
  else
    message = `${view.parcels.length} parcels in view. Click one to analyse.`;

  return (
    <div className={`notice${view.error ? " notice--error" : ""}`}>
      {message}
    </div>
  );
}
