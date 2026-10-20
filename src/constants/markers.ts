import type { MarkerStatus } from "../types/marker";

export const MIN_OBSERVATIONS = 8;
export const PROFILE_WINDOW_MARGIN_DAYS = 15;
export const MIN_OBS_IN_PEAK_WINDOW = 2;

export const MOWING = {
  windowStartDoy: 100,
  windowEndDoy: 290,
  minPriorNdvi: 0.5,
  minDrop: 0.15,
  maxGapDays: 21,
  recoveryWindowDays: 45,
  minRecovery: 0.08,
  mergeWithinDays: 14,
} as const;

export const STATUS_LABELS: Record<MarkerStatus, string> = {
  green: "Consistent",
  yellow: "Review",
  red: "Inconsistent",
  insufficient: "Insufficient data",
  "not-assessed": "Not assessed",
};

export const STATUS_COLORS: Record<MarkerStatus, string> = {
  green: "#2e9e5b",
  yellow: "#d99a00",
  red: "#d64545",
  insufficient: "#7a8794",
  "not-assessed": "#9aa5b1",
};
