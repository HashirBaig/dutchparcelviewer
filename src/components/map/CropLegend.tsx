import { CROP_COLORS, CROP_LABELS } from "../../constants/crops";
import type { CropGroup } from "../../types/parcel";

const GROUPS = Object.keys(CROP_LABELS) as CropGroup[];

export function CropLegend() {
  return (
    <ul className="legend">
      {GROUPS.map((group) => (
        <li key={group}>
          <span
            className="legend__dot"
            style={{ backgroundColor: CROP_COLORS[group] }}
          />
          {CROP_LABELS[group]}
        </li>
      ))}
    </ul>
  );
}
