import type { PathOptions } from "leaflet";
import { CROP_COLORS } from "../constants/crops";
import type { CropGroup } from "../types/parcel";

export function getParcelStyle(
  group: CropGroup,
  selected: boolean,
): PathOptions {
  const color = CROP_COLORS[group];
  return selected
    ? { color: "#111827", weight: 3, fillColor: color, fillOpacity: 0.55 }
    : { color, weight: 1, fillColor: color, fillOpacity: 0.3 };
}
