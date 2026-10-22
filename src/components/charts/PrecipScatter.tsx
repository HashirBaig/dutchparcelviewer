import { SCATTER, SCATTER_X_TICKS, Y_TICKS } from "../../constants/chart";
import type { PairedPoint, RegressionResult } from "../../types/regression";

interface Props {
  points: PairedPoint[];
  result: RegressionResult | null;
  lagDays: number;
}

export function PrecipScatter({ points, result, lagDays }: Props) {
  const { width, height, margin } = SCATTER;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xMax =
    Math.ceil(Math.max(10, ...points.map((p) => p.precipMm)) / 10) * 10;
  const x = (mm: number) => margin.left + (mm / xMax) * innerW;
  const y = (ndvi: number) =>
    margin.top + (1 - Math.max(0, Math.min(1, ndvi))) * innerH;
  const xTicks = Array.from(
    { length: SCATTER_X_TICKS + 1 },
    (_, i) => (xMax * i) / SCATTER_X_TICKS,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart"
      role="img"
      aria-label="NDVI versus rainfall"
    >
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
      {xTicks.map((tick) => (
        <text
          key={tick}
          x={x(tick)}
          y={height - 22}
          textAnchor="middle"
          className="chart__label"
        >
          {Math.round(tick)}
        </text>
      ))}
      <text
        x={margin.left + innerW / 2}
        y={height - 6}
        textAnchor="middle"
        className="chart__label"
      >
        Rain in the {lagDays} days before overpass (mm)
      </text>
      <text
        x={10}
        y={margin.top + innerH / 2}
        className="chart__label"
        transform={`rotate(-90 10 ${margin.top + innerH / 2})`}
        textAnchor="middle"
      >
        NDVI
      </text>

      {result && (
        <line
          x1={x(0)}
          y1={y(result.intercept)}
          x2={x(xMax)}
          y2={y(result.intercept + result.slope * xMax)}
          className="scatter__line"
        />
      )}
      {points.map((p) => (
        <circle
          key={p.date}
          cx={x(p.precipMm)}
          cy={y(p.ndvi)}
          r={4}
          className="scatter__dot"
        >
          <title>{`${p.date}: NDVI ${p.ndvi.toFixed(2)}, ${p.precipMm.toFixed(1)} mm`}</title>
        </circle>
      ))}
    </svg>
  );
}
