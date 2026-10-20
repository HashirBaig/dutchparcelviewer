import { CROP_COLORS, CROP_LABELS } from "../../constants/crops";
import type { Parcel } from "../../types/parcel";

export function ParcelSummary({ parcel }: { parcel: Parcel }) {
  return (
    <div className="summary">
      <h2>{parcel.cropName}</h2>
      <p className="summary__meta">
        <span
          className="legend__dot"
          style={{ backgroundColor: CROP_COLORS[parcel.cropGroup] }}
        />
        {CROP_LABELS[parcel.cropGroup]} · {parcel.areaHa.toFixed(2)} ha
        {parcel.year ? ` · BRP ${parcel.year}` : ""}
      </p>
    </div>
  );
}
