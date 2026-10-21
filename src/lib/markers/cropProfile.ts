import { CROP_LABELS, CROP_PROFILES } from "../../constants/crops";
import {
  MIN_OBSERVATIONS,
  MIN_OBS_IN_PEAK_WINDOW,
  MIN_VALID_COMPOSITES,
  PROFILE_WINDOW_MARGIN_DAYS,
} from "../../constants/markers";
import type { MarkerResult } from "../../types/marker";
import type { CropGroup } from "../../types/parcel";
import type { NdviObservation } from "../../types/timeseries";
import { createNdviComposites, smoothNdvi } from "../composites";

export function evaluateCropProfile(
  group: CropGroup,
  observations: NdviObservation[],
): MarkerResult {
  const profile = CROP_PROFILES[group];
  const label = CROP_LABELS[group].toLowerCase();
  const base = { id: "crop-profile", name: "Crop profile check", events: [] };

  if (!profile) {
    return {
      ...base,
      status: "not-assessed",
      summary: "No profile defined for this crop.",
    };
  }

  if (observations.length < MIN_OBSERVATIONS) {
    return {
      ...base,
      status: "insufficient",
      summary: `Only ${observations.length} clear observations (need ${MIN_OBSERVATIONS}).`,
    };
  }

  // 1. 12-day median composites
  const composites = createNdviComposites(observations);
  if (composites.length < MIN_VALID_COMPOSITES) {
    return {
      ...base,
      status: "insufficient",
      summary: `Only ${composites.length} valid NDVI composites (need ${MIN_VALID_COMPOSITES}).`,
    };
  }

  // 2. Enough composites around the expected peak window?
  const margin = PROFILE_WINDOW_MARGIN_DAYS;
  const nearWindow = composites.filter(
    (item) =>
      item.doy >= profile.peakStartDoy - margin &&
      item.doy <= profile.peakEndDoy + margin,
  );
  if (nearWindow.length < MIN_OBS_IN_PEAK_WINDOW) {
    return {
      ...base,
      status: "insufficient",
      summary: "Too few valid composites in the expected peak window.",
    };
  }

  // 3. Rolling median smoothing
  const smoothed = smoothNdvi(composites);
  if (smoothed.length === 0) {
    return {
      ...base,
      status: "insufficient",
      summary: "Unable to calculate a smoothed NDVI profile.",
    };
  }

  // 4. Peak of the smoothed series
  const peak = smoothed.reduce((best, item) =>
    item.ndvi > best.ndvi ? item : best,
  );
  const inWindow =
    peak.doy >= profile.peakStartDoy && peak.doy <= profile.peakEndDoy;

  const result = {
    ...base,
    events: [
      { date: peak.date, label: `Smoothed NDVI peak ${peak.ndvi.toFixed(2)}` },
    ],
    series: smoothed.map(({ date, ndvi }) => ({ date, ndvi })),
  };

  // 5. Compare with the learned profile
  if (inWindow && peak.ndvi >= profile.minPeakNdvi) {
    return {
      ...result,
      status: "green",
      summary: `Peak timing and smoothed NDVI (${peak.ndvi.toFixed(2)}) fit ${label}.`,
    };
  }

  if (inWindow) {
    return {
      ...result,
      status: "yellow",
      summary: `Peak timing fits ${label}, but smoothed NDVI ${peak.ndvi.toFixed(2)} is below the expected minimum (${profile.minPeakNdvi.toFixed(2)}).`,
    };
  }

  return {
    ...result,
    status: "red",
    summary: `Smoothed NDVI peak on ${peak.date} (DOY ${peak.doy}) is outside the expected window for ${label} (${profile.peakStartDoy}–${profile.peakEndDoy}).`,
  };
}
