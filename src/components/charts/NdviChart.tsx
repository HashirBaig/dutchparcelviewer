import { CHART, Y_TICKS } from "../../constants/chart";
import { buildTicks } from "../../lib/chartTicks";
import { filterByRange } from "../../lib/dateRange";
import { dayOfYear } from "../../lib/dates";
import type { MarkerEvent, SeriesPoint } from "../../types/marker";
import type { DateRange, NdviObservation } from "../../types/timeseries";

interface Props {
  observations: NdviObservation[];
  events: MarkerEvent[];
  year: number;
  range: DateRange;
  smoothed?: SeriesPoint[];
  expectedWindow?: { startDoy: number; endDoy: number };
}

export function NdviChart({
  observations,
  events,
  year,
  range,
  smoothed,
  expectedWindow,
}: Props) {
  const { width, height, margin } = CHART;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const x = (doy: number) =>
    margin.left +
    ((doy - range.startDoy) / (range.endDoy - range.startDoy)) * innerW;
  const y = (v: number) =>
    margin.top + (1 - Math.max(0, Math.min(1, v))) * innerH;

  const visibleObs = filterByRange(observations, range);
  const visibleSmooth = smoothed ? filterByRange(smoothed, range) : [];
  const visibleEvents = filterByRange(events, range);
  const ticks = buildTicks(year, range);

  const windowVisible =
    expectedWindow &&
    expectedWindow.endDoy > range.startDoy &&
    expectedWindow.startDoy < range.endDoy;

  const toPath = (points: { date: string; ndvi: number }[]) =>
    points
      .map((p, i) => `${i ? "L" : "M"}${x(dayOfYear(p.date))},${y(p.ndvi)}`)
      .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart"
      role="img"
      aria-label="NDVI time series"
    >
      {windowVisible && (
        <rect
          x={x(Math.max(expectedWindow.startDoy, range.startDoy))}
          y={margin.top}
          width={
            x(Math.min(expectedWindow.endDoy, range.endDoy)) -
            x(Math.max(expectedWindow.startDoy, range.startDoy))
          }
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
      {ticks.map((tick) => (
        <text
          key={tick.doy}
          x={x(tick.doy)}
          y={height - 8}
          textAnchor="middle"
          className="chart__label"
        >
          {tick.label}
        </text>
      ))}
      {visibleEvents.map((event) => (
        <line
          key={`${event.date}-${event.label}`}
          x1={x(dayOfYear(event.date))}
          x2={x(dayOfYear(event.date))}
          y1={margin.top}
          y2={margin.top + innerH}
          className="chart__event"
        />
      ))}
      {visibleObs.length > 1 && (
        <path d={toPath(visibleObs)} className="chart__line" />
      )}
      {visibleObs.map((o) => (
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
      {visibleSmooth.length > 1 && (
        <path d={toPath(visibleSmooth)} className="chart__smooth" />
      )}
      {visibleSmooth.map((p) => (
        <circle
          key={p.date}
          cx={x(dayOfYear(p.date))}
          cy={y(p.ndvi)}
          r={2.5}
          className="chart__smooth-point"
        >
          <title>{`${p.date}: smoothed NDVI ${p.ndvi.toFixed(2)}`}</title>
        </circle>
      ))}
    </svg>
  );
}
