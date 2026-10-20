import type { CropGroup } from "../types/parcel";
import type { CropProfile } from "../types/marker";

export const CROP_GROUP_PATTERNS: {
  group: Exclude<CropGroup, "other">;
  pattern: RegExp;
}[] = [
  { group: "grassland", pattern: /gras/i },
  { group: "maize", pattern: /ma[iï]s/i },
  { group: "potato", pattern: /aardappel/i },
  { group: "sugarbeet", pattern: /suikerbiet/i },
  { group: "cereal", pattern: /tarwe|gerst|rogge|triticale|haver/i },
];

export const CROP_LABELS: Record<CropGroup, string> = {
  grassland: "Grassland",
  maize: "Maize",
  potato: "Potato",
  sugarbeet: "Sugar beet",
  cereal: "Cereals",
  other: "Other",
};

export const CROP_COLORS: Record<CropGroup, string> = {
  grassland: "#4caf50",
  maize: "#f9a825",
  potato: "#8d6e63",
  sugarbeet: "#ab47bc",
  cereal: "#d4b106",
  other: "#607d8b",
};

// Expected NDVI peak window (day of year) and minimum peak NDVI. Rough first guesses.
export const CROP_PROFILES: Partial<Record<CropGroup, CropProfile>> = {
  maize: { peakStartDoy: 190, peakEndDoy: 250, minPeakNdvi: 0.7 },
  potato: { peakStartDoy: 160, peakEndDoy: 240, minPeakNdvi: 0.65 },
  sugarbeet: { peakStartDoy: 180, peakEndDoy: 260, minPeakNdvi: 0.7 },
  cereal: { peakStartDoy: 110, peakEndDoy: 185, minPeakNdvi: 0.65 },
};
