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

const COMPOSITE_DAYS = 12;
const MIN_VALID_COMPOSITES = 9;
const SMOOTHING_WINDOW = 3;

type NdviComposite = {
  date: string;
  doy: number;
  ndvi: number;
  index: number; // 12-day bin number within the year
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * Creates fixed 12-day NDVI composites.
 *
 * Each composite contains the median NDVI of observations
 * falling within the same 12-day interval.
 */
function createNdviComposites(
  observations: NdviObservation[],
): NdviComposite[] {
  const groups = new Map<
    string,
    { values: number[]; year: number; startDoy: number; index: number }
  >();

  for (const observation of observations) {
    if (!Number.isFinite(observation.ndvi)) continue;

    const date = new Date(`${observation.date.slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) continue;

    const year = date.getUTCFullYear();
    const doy = dayOfYear(observation.date);

    const index = Math.floor((doy - 1) / COMPOSITE_DAYS);
    const startDoy = index * COMPOSITE_DAYS + 1;
    const key = `${year}-${index}`;

    const group = groups.get(key);

    if (group) {
      group.values.push(observation.ndvi);
    } else {
      groups.set(key, { values: [observation.ndvi], year, startDoy, index });
    }
  }

  return [...groups.values()]
    .map((group) => {
      // Assign the composite's midpoint as its date.
      const midpointDoy = group.startDoy + 5;

      const date = new Date(Date.UTC(group.year, 0, midpointDoy))
        .toISOString()
        .slice(0, 10);

      return {
        date,
        doy: dayOfYear(date),
        ndvi: median(group.values),
        index: group.index,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Apply a centered rolling median over 3 composites.
 *
 * Requires at least 2 available values.
 */
function smoothNdvi(composites: NdviComposite[]): NdviComposite[] {
  const half = Math.floor(SMOOTHING_WINDOW / 2);
  return composites.flatMap((composite) => {
    const values = composites
      .filter((other) => Math.abs(other.index - composite.index) <= half)
      .map((other) => other.ndvi);
    return values.length < 2 ? [] : [{ ...composite, ndvi: median(values) }];
  });
}

export function evaluateCropProfile(
  group: CropGroup,
  observations: NdviObservation[],
): MarkerResult {
  const profile = CROP_PROFILES[group];
  const label = CROP_LABELS[group].toLowerCase();

  const base = {
    id: "crop-profile",
    name: "Crop profile check",
    events: [],
  };

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

  // Step 1: Generate 12-day median composites.
  const composites = createNdviComposites(observations);

  if (composites.length < MIN_VALID_COMPOSITES) {
    return {
      ...base,
      status: "insufficient",
      summary: `Only ${composites.length} valid NDVI composites (need ${MIN_VALID_COMPOSITES}).`,
    };
  }

  // Step 2: Check observations around the expected peak window.
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

  // Step 3: Apply rolling median smoothing.
  const smoothed = smoothNdvi(composites);

  if (smoothed.length === 0) {
    return {
      ...base,
      status: "insufficient",
      summary: "Unable to calculate a smoothed NDVI profile.",
    };
  }

  // Step 4: Find the peak of the smoothed NDVI series.
  const peak = smoothed.reduce((best, item) =>
    item.ndvi > best.ndvi ? item : best,
  );

  const series = smoothed.map(({ date, ndvi }) => ({ date, ndvi }));

  const peakDoy = peak.doy;
  const inWindow =
    peakDoy >= profile.peakStartDoy && peakDoy <= profile.peakEndDoy;

  const events = [
    {
      date: peak.date,
      label: `Smoothed NDVI peak ${peak.ndvi.toFixed(2)}`,
    },
  ];

  // Step 5: Evaluate against the learned crop profile.
  if (inWindow && peak.ndvi >= profile.minPeakNdvi) {
    return {
      ...base,
      events,
      series,
      status: "green",
      summary: `Peak timing and smoothed NDVI (${peak.ndvi.toFixed(2)}) fit ${label}.`,
    };
  }

  if (inWindow) {
    return {
      ...base,
      events,
      status: "yellow",
      summary: `Peak timing fits ${label}, but smoothed NDVI ${peak.ndvi.toFixed(2)} is below the expected minimum (${profile.minPeakNdvi.toFixed(2)}).`,
    };
  }

  return {
    ...base,
    events,
    status: "red",
    summary: `Smoothed NDVI peak on ${peak.date} (DOY ${peakDoy}) is outside the expected window for ${label} (${profile.peakStartDoy}–${profile.peakEndDoy}).`,
  };
}
