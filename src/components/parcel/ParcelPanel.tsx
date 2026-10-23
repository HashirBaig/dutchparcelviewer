import type { PeriodController } from "../../hooks/usePeriod";
import type { AnalysisState } from "../../types/analysis";
import type { Parcel } from "../../types/parcel";
import { PeriodTabs } from "../filters/PeriodTabs";
import { ParcelSummary } from "./ParcelSummary";
import { RecentView } from "./RecentView";
import { SeasonPending } from "./SeasonPending";
import { SeasonView } from "./SeasonView";

interface Props {
  parcel: Parcel | null;
  recent: AnalysisState;
  season: AnalysisState;
  period: PeriodController;
}

export function ParcelPanel({ parcel, recent, season, period }: Props) {
  if (!parcel) {
    return (
      <div className="panel panel--empty">
        <p>
          Select a crop parcel on the map. The most recent Sentinel-2 scenes
          appear first, and the full season loads in the background.
        </p>
      </div>
    );
  }

  const year = parcel.year ?? new Date().getFullYear();
  const seasonReady = season.phase === "done";

  return (
    <div className="panel">
      <ParcelSummary parcel={parcel} />

      <PeriodTabs
        year={year}
        mode={period.mode}
        range={period.dateRange.range}
        seasonReady={seasonReady}
        onRecent={period.selectRecent}
        onPreset={period.selectPreset}
      />

      {period.mode === "recent" ? (
        <RecentView recent={recent} season={season} />
      ) : seasonReady ? (
        <SeasonView
          parcel={parcel}
          year={year}
          season={season}
          period={period}
        />
      ) : (
        <SeasonPending season={season} />
      )}
    </div>
  );
}
