import { CROP_PROFILES } from "../../constants/crops";
import type { DateRangeController } from "../../hooks/useDateRange";
import { filterByRange } from "../../lib/dateRange";
import { computeRangeStats } from "../../lib/rangeStats";
import type { AnalysisState } from "../../types/analysis";
import type { Parcel } from "../../types/parcel";
import { NdviChart } from "../charts/NdviChart";
import { DateRangeFilter } from "../filters/DateRangeFilter";
import { ProgressBar } from "../ui/ProgressBar";
import { StatusBadge } from "../ui/StatusBadge";
import { MarkerCard } from "./MarkerCard";
import { ParcelSummary } from "./ParcelSummary";
import { ProfileNote } from "./ProfileNote";
import { RangeStatsPanel } from "./RangeStatsPanel";
import { PrecipPanel } from "../precip/PrecipPanel";

interface Props {
  parcel: Parcel | null;
  analysis: AnalysisState;
  dateRange: DateRangeController;
}

export function ParcelPanel({ parcel, analysis, dateRange }: Props) {
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
  const smoothed = analysis.markers.find((m) => m.series)?.series;
  const stats = computeRangeStats(
    filterByRange(analysis.observations, dateRange.range),
  );

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

          <DateRangeFilter
            year={year}
            observations={analysis.observations}
            bounds={dateRange.bounds}
            range={dateRange.range}
            isFull={dateRange.isFull}
            onChange={dateRange.setRange}
            onPreset={dateRange.applyPreset}
            onReset={dateRange.reset}
          />

          <NdviChart
            observations={analysis.observations}
            events={events}
            smoothed={smoothed}
            year={year}
            range={dateRange.range}
            expectedWindow={
              profile
                ? { startDoy: profile.peakStartDoy, endDoy: profile.peakEndDoy }
                : undefined
            }
          />

          <RangeStatsPanel stats={stats} />
          <PrecipPanel
            key={parcel.id}
            parcel={parcel}
            year={year}
            observations={analysis.observations}
            range={dateRange.range}
          />

          <p className="muted">
            {analysis.observations.length} clear observations from{" "}
            {analysis.scenesTotal} scenes
            {analysis.scenesFailed > 0
              ? ` (${analysis.scenesFailed} failed to read)`
              : ""}
            . Dots: per-scene median NDVI of cloud-free pixels.
            {smoothed ? " Orange line: 12-day composites, smoothed." : ""} The
            map on the parcel shows the per-pixel median NDVI for the selected
            period. The period filter changes the view only. Markers always use
            the full season.
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
