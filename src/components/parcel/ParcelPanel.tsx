import { CROP_PROFILES } from "../../constants/crops";
import { useParcelAnalysis } from "../../hooks/useParcelAnalysis";
import type { Parcel } from "../../types/parcel";
import { NdviChart } from "../charts/NdviChart";
import { ProgressBar } from "../ui/ProgressBar";
import { StatusBadge } from "../ui/StatusBadge";
import { MarkerCard } from "./MarkerCard";
import { ParcelSummary } from "./ParcelSummary";
import { ProfileNote } from "./ProfileNote";

export function ParcelPanel({ parcel }: { parcel: Parcel | null }) {
  const analysis = useParcelAnalysis(parcel);

  if (!parcel) {
    return (
      <div className="panel panel--empty">
        <p>
          Select a crop parcel on the map to build its Sentinel-2 NDVI time
          series and run markers.
        </p>
      </div>
    );
  }

  const year = parcel.year ?? new Date().getFullYear();
  const profile = CROP_PROFILES[parcel.cropGroup];
  const events = analysis.markers.flatMap((m) => m.events);
  const smoothed = analysis.markers.find((marker) => marker.series)?.series;

  return (
    <div className="panel">
      <ParcelSummary parcel={parcel} />

      {analysis.phase === "searching" && (
        <p className="muted">Searching Sentinel-2 scenes…</p>
      )}
      {analysis.phase === "reading" && <ProgressBar {...analysis.progress} />}
      {analysis.phase === "error" && <p className="error">{analysis.error}</p>}

      {analysis.phase === "done" && analysis.verdict && (
        <>
          <div className="verdict">
            <StatusBadge status={analysis.verdict.status} />
            <span>{analysis.verdict.summary}</span>
          </div>

          <NdviChart
            observations={analysis.observations}
            events={events}
            smoothed={smoothed}
            year={year}
            expectedWindow={
              profile
                ? { startDoy: profile.peakStartDoy, endDoy: profile.peakEndDoy }
                : undefined
            }
          />

          <p className="muted">
            {analysis.observations.length} clear observations from{" "}
            {analysis.scenesTotal} scenes
            {analysis.scenesFailed > 0
              ? ` (${analysis.scenesFailed} failed to read)`
              : ""}
            . Dots: per-scene median NDVI of cloud-free pixels.{" "}
            {smoothed
              ? "Orange line: 12-day composites, smoothed, used for the peak."
              : ""}
          </p>

          {analysis.markers.map((marker) => (
            <MarkerCard key={marker.id} marker={marker} />
          ))}

          <ProfileNote group={parcel.cropGroup} />
        </>
      )}
    </div>
  );
}
