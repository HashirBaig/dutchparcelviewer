import { CROP_PROFILES } from "../../constants/crops";
import type { MarkerResult } from "../../types/marker";
import type { CropGroup } from "../../types/parcel";
import type { NdviObservation } from "../../types/timeseries";
import { evaluateCropProfile } from "./cropProfile";
import { evaluateMowing } from "./mowing";

export function runMarkers(
  group: CropGroup,
  observations: NdviObservation[],
): MarkerResult[] {
  if (group === "grassland") return [evaluateMowing(observations)];
  if (CROP_PROFILES[group]) return [evaluateCropProfile(group, observations)];
  return [];
}
