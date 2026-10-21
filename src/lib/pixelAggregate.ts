import { MIN_SCENES_PER_PIXEL } from "../constants/ndviMap";
import type { AggregatedMap, PixelStack } from "../types/pixels";
import type { DateRange } from "../types/timeseries";
import { filterByRange } from "./dateRange";

/** Per-pixel median NDVI over the clear scenes inside the date range. */
export function aggregateStack(
  stack: PixelStack,
  range: DateRange,
): AggregatedMap {
  const scenes = filterByRange(stack.scenes, range);
  const size = stack.grid.width * stack.grid.height;
  const values = new Float32Array(size).fill(Number.NaN);

  if (scenes.length === 0) return { grid: stack.grid, values, sceneCount: 0 };

  const buffer = new Float32Array(scenes.length);
  for (let i = 0; i < size; i++) {
    let n = 0;
    for (const scene of scenes) {
      const value = scene.ndvi[i];
      if (!Number.isNaN(value)) buffer[n++] = value;
    }
    if (n < MIN_SCENES_PER_PIXEL) continue;

    const sorted = buffer.subarray(0, n).sort();
    const mid = n >> 1;
    values[i] = n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return { grid: stack.grid, values, sceneCount: scenes.length };
}
