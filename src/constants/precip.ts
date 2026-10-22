export const OPEN_METEO_ARCHIVE_URL =
  "https://archive-api.open-meteo.com/v1/archive";
export const OPEN_METEO_ATTRIBUTION = {
  text: "Weather data by Open-Meteo.com",
  url: "https://open-meteo.com/",
} as const;

export const LAG_OPTIONS_DAYS = [7, 14, 30] as const;
export const DEFAULT_LAG_DAYS = 14;

// Rain is fetched from this many days before the season starts, so early observations have a full lag window
export const PRECIP_LEAD_DAYS = 45;
// Assumed delay of the archive. Days after it are skipped instead of requested. Adjust if you see gaps.
export const ARCHIVE_LAG_DAYS = 7;

export const MIN_POINTS_REGRESSION = 5;
export const SIGNIFICANCE_LEVEL = 0.05;
export const STRENGTH = { weak: 0.3, moderate: 0.6 } as const; // |r| thresholds
export const SLOPE_UNIT_MM = 10;
