import { dayOfYear } from "../../lib/dates";
import type { DateRange, NdviObservation } from "../../types/timeseries";

const W = 300;
const H = 36;

interface Props {
  observations: NdviObservation[];
  bounds: DateRange;
  range: DateRange;
}

export function SeasonOverview({ observations, bounds, range }: Props) {
  const x = (doy: number) =>
    ((doy - bounds.startDoy) / (bounds.endDoy - bounds.startDoy)) * W;
  const y = (ndvi: number) => H - 2 - Math.max(0, Math.min(1, ndvi)) * (H - 4);

  const path = observations
    .map((o, i) => `${i ? "L" : "M"}${x(dayOfYear(o.date))},${y(o.ndvi)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="overview"
      aria-hidden="true"
    >
      <rect x={0} y={0} width={W} height={H} className="overview__bg" />
      <rect
        x={x(range.startDoy)}
        y={0}
        width={x(range.endDoy) - x(range.startDoy)}
        height={H}
        className="overview__sel"
      />
      {observations.length > 1 && (
        <path
          d={path}
          className="overview__line"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
