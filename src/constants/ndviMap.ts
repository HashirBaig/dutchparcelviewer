import type { NdviClass } from "../types/ndviMap";

// Generic thresholds. NDVI depends on crop and growth stage, so read the
// classes relative to the selected period, not as an absolute health score.
export const NDVI_CLASSES: NdviClass[] = [
  { id: "bare", label: "Bare / very sparse", min: -1, color: "#d73027" },
  { id: "sparse", label: "Sparse / stressed", min: 0.2, color: "#fc8d59" },
  { id: "moderate", label: "Moderate", min: 0.4, color: "#fee08b" },
  { id: "healthy", label: "Healthy", min: 0.6, color: "#91cf60" },
  { id: "dense", label: "Dense / vigorous", min: 0.8, color: "#1a9850" },
];

export const MIN_SCENES_PER_PIXEL = 1;

export const NDVI_PANE = "ndvi-pane";
export const NDVI_PANE_Z_INDEX = 350; // above tiles (200), below parcel outlines (400)
export const NDVI_OVERLAY_OPACITY = 0.85;

// Output image resolution (metres per canvas pixel) and size cap
export const OUTPUT_METERS_PER_PIXEL = 2;
export const MAX_OUTPUT_PIXELS = 400_000;

export const ZOOM_TO_PARCEL_MAX = 18;
export const ZOOM_TO_PARCEL_PADDING = 48;
export const ZOOM_TO_PARCEL_SECONDS = 0.6;
