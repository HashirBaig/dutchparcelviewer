import {
  COMPOSITE_DAYS,
  COMPOSITE_MIDPOINT_OFFSET_DAYS,
  SMOOTHING_WINDOW,
} from "../constants/markers";
import type { NdviComposite, NdviObservation } from "../types/timeseries";
import { dayOfYear } from "./dates";
import { median } from "./stats";

interface CompositeGroup {
  values: number[];
  year: number;
  startDoy: number;
  index: number;
}

/**
 * Fixed 12-day composites: the median NDVI of all observations
 * falling in the same bin, dated at the bin midpoint.
 */
export function createNdviComposites(
  observations: NdviObservation[],
): NdviComposite[] {
  const groups = new Map<string, CompositeGroup>();

  for (const observation of observations) {
    if (!Number.isFinite(observation.ndvi)) continue;

    const date = new Date(`${observation.date.slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) continue;

    const year = date.getUTCFullYear();
    const index = Math.floor(
      (dayOfYear(observation.date) - 1) / COMPOSITE_DAYS,
    );
    const key = `${year}-${index}`;

    const group = groups.get(key);
    if (group) {
      group.values.push(observation.ndvi);
    } else {
      groups.set(key, {
        values: [observation.ndvi],
        year,
        startDoy: index * COMPOSITE_DAYS + 1,
        index,
      });
    }
  }

  return [...groups.values()]
    .map((group) => {
      const date = new Date(
        Date.UTC(
          group.year,
          0,
          group.startDoy + COMPOSITE_MIDPOINT_OFFSET_DAYS,
        ),
      )
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
 * Centred rolling median over neighbouring bins. Only bins within the
 * window count, so gaps are not bridged. Needs at least 2 values.
 */
export function smoothNdvi(composites: NdviComposite[]): NdviComposite[] {
  const half = Math.floor(SMOOTHING_WINDOW / 2);

  return composites.flatMap((composite) => {
    const values = composites
      .filter((other) => Math.abs(other.index - composite.index) <= half)
      .map((other) => other.ndvi);

    return values.length < 2 ? [] : [{ ...composite, ndvi: median(values) }];
  });
}
