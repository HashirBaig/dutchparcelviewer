import {
  MIN_POINTS_REGRESSION,
  SIGNIFICANCE_LEVEL,
  STRENGTH,
} from "../constants/precip";
import type { RegressionResult } from "../types/regression";

export function formatP(p: number | null): string {
  if (p === null) return "–";
  return p < 0.001 ? "<0.001" : p.toFixed(3);
}

export function formatSigned(value: number | null, digits = 2): string {
  if (value === null || Number.isNaN(value)) return "–";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

export function describeRelationship(result: RegressionResult | null): string {
  if (!result) {
    return `Not enough paired observations (need at least ${MIN_POINTS_REGRESSION}).`;
  }
  const abs = Math.abs(result.r);
  const strength =
    abs < STRENGTH.weak
      ? "weak"
      : abs < STRENGTH.moderate
        ? "moderate"
        : "strong";
  const direction = result.r >= 0 ? "positive" : "negative";
  const significant = result.p !== null && result.p < SIGNIFICANCE_LEVEL;

  return (
    `${strength[0].toUpperCase()}${strength.slice(1)} ${direction} relationship ` +
    `(r = ${formatSigned(result.r)}, n = ${result.n}), ` +
    `${significant ? "statistically significant" : "not statistically significant"} at p < ${SIGNIFICANCE_LEVEL}. ` +
    `Rainfall accounts for ${Math.round(result.r2 * 100)}% of the NDVI variance here. ` +
    `This is an association, not proof of cause.`
  );
}
