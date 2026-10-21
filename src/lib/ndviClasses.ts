import { NDVI_CLASSES } from "../constants/ndviMap";
import type { ClassShare } from "../types/ndviMap";

export function classIndex(value: number): number {
  let result = 0;
  NDVI_CLASSES.forEach((cls, i) => {
    if (value >= cls.min) result = i;
  });
  return result;
}

export function classRangeLabel(index: number): string {
  const lower = NDVI_CLASSES[index].min;
  const upper = NDVI_CLASSES[index + 1]?.min;
  if (index === 0) return `< ${upper}`;
  return upper === undefined ? `≥ ${lower}` : `${lower}–${upper}`;
}

export function colorToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function summarizeValues(values: Float32Array): {
  shares: ClassShare[];
  validCount: number;
} {
  const counts = new Array<number>(NDVI_CLASSES.length).fill(0);
  let validCount = 0;
  for (const value of values) {
    if (Number.isNaN(value)) continue;
    counts[classIndex(value)]++;
    validCount++;
  }
  const shares = NDVI_CLASSES.map((cls, index) => ({
    cls,
    index,
    share: validCount > 0 ? counts[index] / validCount : 0,
  }));
  return { shares, validCount };
}
