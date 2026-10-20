import { CHART, MONTH_LABELS, Y_TICKS } from "../../constants/chart";
import { SEASON_END_MONTH, SEASON_START_MONTH } from "../../constants/analysis";
import { dayOfYear, monthStartDoy } from "../../lib/dates";
import type { MarkerEvent } from "../../types/marker";
import type { NdviObservation } from "../../types/timeseries";

interface Props {
  observations: NdviObservation[];
  events: MarkerEvent[];
  year: number;
  expectedWindow?: { startDoy: number; endDoy: number };
}

export function NdviChart({
  observations,
  events,
  year,
  expectedWindow,
}: Props) {
  const { width, height, margin } = CHART;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xMin = monthStartDoy(year, SEASON_START_MONTH);
  const xMax = monthStartDoy(year, SEASON_END_MONTH + 1) - 1;
  const x = (doy: number) =>
    margin.left + ((doy - xMin) / (xMax - xMin)) * innerW;
  const y = (v: number) =>
    margin.top + (1 - Math.max(0, Math.min(1, v))) * innerH;

  const months = Array.from(
    { length: SEASON_END_MONTH - SEASON_START_MONTH + 1 },
    (_, i) => SEASON_START_MONTH + i,
  );
  const path = observations
    .map((o, i) => `${i ? "L" : "M"}${x(dayOfYear(o.date))},${y(o.ndvi)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart"
      role="img"
      aria-label="NDVI time series"
    >
      {expectedWindow && (
        <rect
          x={x(expectedWindow.startDoy)}
          y={margin.top}
          width={x(expectedWindow.endDoy) - x(expectedWindow.startDoy)}
          height={innerH}
          className="chart__window"
        />
      )}
      {Y_TICKS.map((tick) => (
        <g key={tick}>
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={y(tick)}
            y2={y(tick)}
            className="chart__grid"
          />
          <text
            x={margin.left - 6}
            y={y(tick) + 4}
            textAnchor="end"
            className="chart__label"
          >
            {tick.toFixed(1)}
          </text>
        </g>
      ))}
      {months.map((month) => (
        <text
          key={month}
          x={x(monthStartDoy(year, month))}
          y={height - 8}
          className="chart__label"
        >
          {MONTH_LABELS[month - 1]}
        </text>
      ))}
      {events.map((event) => (
        <line
          key={`${event.date}-${event.label}`}
          x1={x(dayOfYear(event.date))}
          x2={x(dayOfYear(event.date))}
          y1={margin.top}
          y2={margin.top + innerH}
          className="chart__event"
        />
      ))}
      {observations.length > 0 && <path d={path} className="chart__line" />}
      {observations.map((o) => (
        <circle
          key={o.itemId}
          cx={x(dayOfYear(o.date))}
          cy={y(o.ndvi)}
          r={3.5}
          opacity={0.4 + 0.6 * o.validFraction}
          className="chart__point"
        >
          <title>{`${o.date}: NDVI ${o.ndvi.toFixed(2)} (${Math.round(o.validFraction * 100)}% clear)`}</title>
        </circle>
      ))}
    </svg>
  );
}
