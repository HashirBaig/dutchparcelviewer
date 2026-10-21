import { TREND_THRESHOLD } from "../../constants/dateFilter";
import type { RangeStats } from "../../types/timeseries";

function trendLabel(trend: number | null): string {
  if (trend === null) return "–";
  const arrow =
    trend > TREND_THRESHOLD ? "↗" : trend < -TREND_THRESHOLD ? "↘" : "→";
  return `${arrow} ${trend >= 0 ? "+" : ""}${trend.toFixed(2)} / 30 d`;
}

export function RangeStatsPanel({ stats }: { stats: RangeStats }) {
  if (stats.count === 0) {
    return <p className="muted">No clear observations in this period.</p>;
  }

  return (
    <dl className="stats">
      <div>
        <dt>Observations</dt>
        <dd>{stats.count}</dd>
      </div>
      <div>
        <dt>Mean NDVI</dt>
        <dd>{stats.mean?.toFixed(2) ?? "–"}</dd>
      </div>
      <div>
        <dt>Period peak</dt>
        <dd>
          {stats.peak
            ? `${stats.peak.ndvi.toFixed(2)} · ${stats.peak.date.slice(5)}`
            : "–"}
        </dd>
      </div>
      <div>
        <dt>Trend</dt>
        <dd>{trendLabel(stats.trendPer30Days)}</dd>
      </div>
    </dl>
  );
}
