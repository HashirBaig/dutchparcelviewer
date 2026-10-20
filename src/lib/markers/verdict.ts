import type {
  MarkerResult,
  MarkerStatus,
  ParcelVerdict,
} from "../../types/marker";

const PRIORITY: MarkerStatus[] = ["red", "yellow", "insufficient", "green"];

export function getVerdict(markers: MarkerResult[]): ParcelVerdict {
  if (markers.length === 0) {
    return {
      status: "not-assessed",
      summary: "No marker is defined for this crop group yet.",
    };
  }
  const status =
    PRIORITY.find((s) => markers.some((m) => m.status === s)) ?? "not-assessed";
  return { status, summary: markers.map((m) => m.summary).join(" ") };
}
