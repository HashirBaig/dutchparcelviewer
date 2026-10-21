export const SEASON_START_MONTH = 3; // March
export const SEASON_END_MONTH = 10; // October
export const MAX_CLOUD_COVER = 80; // scene-level filter in STAC search
export const MIN_VALID_FRACTION = 0.6; // min share of clear parcel pixels per scene
export const FETCH_CONCURRENCY = 6;
// SCL is 20 m and the prefilter mask ignores the inner buffer, so allow some slack vs MIN_VALID_FRACTION
export const SCL_PREFILTER_SLACK = 0.1;

// Sentinel-2 Scene Classification: 4 vegetation, 5 not vegetated, 7 unclassified
export const VALID_SCL_CLASSES = new Set([4, 5, 7]);

// Reflectance = DN * scale + offset. Offset of -0.1 applies from processing baseline 04.00.
export const S2_DEFAULT_SCALE = 0.0001;
export const S2_DEFAULT_OFFSET = -0.1;
export const S2_OFFSET_CHANGE_DATE = "2022-01-25";

// Shrink the parcel inward to avoid mixed pixels at field edges (10 m pixels)
export const INNER_BUFFER_RULES = [
  { minAreaM2: 10_000, bufferM: 10 },
  { minAreaM2: 3_000, bufferM: 5 },
  { minAreaM2: 0, bufferM: 0 },
] as const;

export const S2_PIXEL_SIZE_M = 10;
