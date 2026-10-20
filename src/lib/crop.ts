import { CROP_GROUP_PATTERNS } from "../constants/crops";
import type { CropGroup } from "../types/parcel";

export function classifyCrop(cropName: string): CropGroup {
  return (
    CROP_GROUP_PATTERNS.find(({ pattern }) => pattern.test(cropName))?.group ??
    "other"
  );
}
