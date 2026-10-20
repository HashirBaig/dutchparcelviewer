import { CROP_LABELS, CROP_PROFILES } from "../../constants/crops";
import {
  MIN_OBSERVATIONS,
  MIN_OBS_IN_PEAK_WINDOW,
  PROFILE_WINDOW_MARGIN_DAYS,
} from "../../constants/markers";
import type { MarkerResult } from "../../types/marker";
import type { CropGroup } from "../../types/parcel";
import type { NdviObservation } from "../../types/timeseries";
import { dayOfYear } from "../dates";

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

  const margin = PROFILE_WINDOW_MARGIN_DAYS;
  const nearWindow = observations.filter((o) => {
    const doy = dayOfYear(o.date);
    return (
      doy >= profile.peakStartDoy - margin && doy <= profile.peakEndDoy + margin
    );
  });
  if (nearWindow.length < MIN_OBS_IN_PEAK_WINDOW) {
    return {
      ...base,
      status: "insufficient",
      summary: "Too few clear observations in the expected peak window.",
    };
  }

  const peak = observations.reduce((best, o) =>
    o.ndvi > best.ndvi ? o : best,
  );
  const peakDoy = dayOfYear(peak.date);
  const inWindow =
    peakDoy >= profile.peakStartDoy && peakDoy <= profile.peakEndDoy;
  const events = [
    { date: peak.date, label: `NDVI peak ${peak.ndvi.toFixed(2)}` },
  ];

  if (inWindow && peak.ndvi >= profile.minPeakNdvi) {
    return {
      ...base,
      events,
      status: "green",
      summary: `Peak timing and height fit ${label}.`,
    };
  }
  if (inWindow) {
    return {
      ...base,
      events,
      status: "yellow",
      summary: `Peak timing fits ${label}, but peak NDVI ${peak.ndvi.toFixed(2)} is low.`,
    };
  }
  return {
    ...base,
    events,
    status: "red",
    summary: `NDVI peak on ${peak.date} is outside the expected window for ${label}.`,
  };
}
