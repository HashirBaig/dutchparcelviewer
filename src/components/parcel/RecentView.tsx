import { RECENT_DAYS } from "../../constants/recent";
import { formatIsoDate } from "../../lib/dates";
import { computeRangeStats } from "../../lib/rangeStats";
import { getRecentWindow } from "../../lib/recent";
import type { AnalysisState } from "../../types/analysis";
import { ProgressBar } from "../ui/ProgressBar";
import { BackgroundStatus } from "./BackgroundStatus";

interface Props {
  recent: AnalysisState;
  season: AnalysisState;
}

export function RecentView({ recent, season }: Props) {
  const { from, to } = getRecentWindow();
  const stats = computeRangeStats(recent.observations);
  const latest = recent.observations[recent.observations.length - 1];

  return (
    <div className="recent">
      <header className="filter__header">
        <strong>Last {RECENT_DAYS} days</strong>
        <span className="muted">
          {formatIsoDate(from)} – {formatIsoDate(to)}
        </span>
      </header>

      {(recent.phase === "idle" || recent.phase === "searching") && (
        <p className="muted">Searching Sentinel-2 scenes…</p>
      )}
      {recent.phase === "reading" && <ProgressBar {...recent.progress} />}
      {recent.phase === "error" && <p className="error">{recent.error}</p>}

      {recent.phase === "done" && recent.observations.length === 0 && (
        <p className="muted">
          {recent.scenesTotal === 0
            ? `No Sentinel-2 scene covers this parcel in the last ${RECENT_DAYS} days.`
            : `${recent.scenesTotal} scene(s) found, but clouds covered too much of the parcel. The season tabs show earlier observations once they are ready.`}
        </p>
      )}

      {recent.phase === "done" && latest && (
        <>
          <dl className="stats">
            <div>
              <dt>Clear scenes</dt>
              <dd>
                {stats.count} / {recent.scenesTotal}
              </dd>
            </div>
            <div>
              <dt>Mean NDVI</dt>
              <dd>{stats.mean?.toFixed(2) ?? "–"}</dd>
            </div>
            <div>
              <dt>Latest</dt>
              <dd>{formatIsoDate(latest.date)}</dd>
            </div>
            <div>
              <dt>Latest NDVI</dt>
              <dd>{latest.ndvi.toFixed(2)}</dd>
            </div>
          </dl>

          <table className="reg-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>NDVI</th>
                <th>Clear</th>
              </tr>
            </thead>
            <tbody>
              {[...recent.observations].reverse().map((o) => (
                <tr key={o.itemId}>
                  <td>{formatIsoDate(o.date)}</td>
                  <td>{o.ndvi.toFixed(2)}</td>
                  <td>{Math.round(o.validFraction * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="muted">
            The map on the parcel shows the per-pixel median NDVI of these
            scenes. The crop-profile check needs the full season and appears
            under the season tabs.
          </p>
        </>
      )}

      <BackgroundStatus season={season} />
    </div>
  );
}
