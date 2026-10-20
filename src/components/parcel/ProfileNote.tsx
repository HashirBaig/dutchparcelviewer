import {
  CROP_LABELS,
  CROP_PROFILE_META,
  CROP_PROFILES,
} from "../../constants/crops";
import type { CropGroup } from "../../types/parcel";

export function ProfileNote({ group }: { group: CropGroup }) {
  const profile = CROP_PROFILES[group];
  if (!profile) return null;
  const { region, year, sampleSize, lowerPercentile, upperPercentile } =
    CROP_PROFILE_META;

  return (
    <p className="muted">
      Expected {CROP_LABELS[group].toLowerCase()} profile: NDVI peak between day{" "}
      {profile.peakStartDoy} and {profile.peakEndDoy}, peak NDVI ≥{" "}
      {profile.minPeakNdvi.toFixed(2)}. Learned from {sampleSize ?? "many"}{" "}
      declared parcels in {region}
      {year ? ` (${year})` : ""}, {lowerPercentile}th–{upperPercentile}th
      percentile. This checks consistency with the declaration, not ground
      truth.
    </p>
  );
}
