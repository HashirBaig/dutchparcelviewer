import { CROP_PROFILES } from "../../constants/crops";
import type { PeriodController } from "../../hooks/usePeriod";
import { filterByRange } from "../../lib/dateRange";
import { computeRangeStats } from "../../lib/rangeStats";
import type { AnalysisState } from "../../types/analysis";
import type { Parcel } from "../../types/parcel";
import { NdviChart } from "../charts/NdviChart";
import { DateRangeFilter } from "../filters/DateRangeFilter";
import { PrecipPanel } from "../precip/PrecipPanel";
import { StatusBadge } from "../ui/StatusBadge";
import { MarkerCard } from "./MarkerCard";
import { ProfileNote } from "./ProfileNote";
import { RangeStatsPanel } from "./RangeStatsPanel";

interface Props {
  parcel: Parcel;
  year: number;
  season: AnalysisState;
  period: PeriodController;
}

export function SeasonView({ parcel, year, season, period }: Props) {
  const { dateRange } = period;
  const profile = CROP_PROFILES[parcel.cropGroup];
  const events = season.markers.flatMap((m) => m.events);
  const smoothed = season.markers.find((m) => m.series)?.series;
  const stats = computeRangeStats(
    filterByRange(season.observations, dateRange.range),
  );

  return (
    <>
      {season.verdict && (
        <div className="verdict">
          <StatusBadge status={season.verdict.status} />
          <span>{season.verdict.summary}</span>
        </div>
      )}

      <DateRangeFilter
        year={year}
        observations={season.observations}
        bounds={dateRange.bounds}
        range={dateRange.range}
        isFull={dateRange.isFull}
        onChange={period.selectRange}
        onReset={dateRange.reset}
      />

      <NdviChart
        observations={season.observations}
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
        observations={season.observations}
        range={dateRange.range}
      />

      <p className="muted">
        {season.observations.length} clear observations from{" "}
        {season.scenesTotal} scenes
        {season.scenesFailed > 0
          ? ` (${season.scenesFailed} failed to read)`
          : ""}
        . Dots: per-scene median NDVI of cloud-free pixels.
        {smoothed ? " Orange line: 12-day composites, smoothed." : ""} The map
        on the parcel shows the per-pixel median NDVI for the selected period.
        The period filter changes the view only. Markers always use the full
        season.
      </p>

      {season.markers.map((marker) => (
        <MarkerCard key={marker.id} marker={marker} />
      ))}

      <ProfileNote group={parcel.cropGroup} />
    </>
  );
}
