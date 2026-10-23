import type { MarkerResult, ParcelVerdict } from "./marker";
import type { PixelStack } from "./pixels";
import type { NdviObservation, Progress } from "./timeseries";

export type AnalysisPhase = "idle" | "searching" | "reading" | "done" | "error";

export interface AnalysisState {
  parcelId: string | null; // which parcel this state belongs to
  phase: AnalysisPhase;
  progress: Progress;
  observations: NdviObservation[];
  pixels: PixelStack | null;
  markers: MarkerResult[];
  verdict: ParcelVerdict | null;
  scenesTotal: number;
  scenesFailed: number;
  error: string | null;
}
