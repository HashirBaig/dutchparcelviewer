import { MIN_RANGE_DAYS } from "../../constants/dateFilter";
import { formatDoy } from "../../lib/dates";
import type { DateRange, NdviObservation } from "../../types/timeseries";
import { SeasonOverview } from "../charts/SeasonOverview";
import { DualRangeSlider } from "../ui/DualRangeSlider";

interface Props {
  year: number;
  observations: NdviObservation[];
  bounds: DateRange;
  range: DateRange;
  isFull: boolean;
  onChange: (range: DateRange) => void;
  onReset: () => void;
}

export function DateRangeFilter({
  year,
  observations,
  bounds,
  range,
  isFull,
  onChange,
  onReset,
}: Props) {
  const days = range.endDoy - range.startDoy + 1;

  return (
    <section className="filter">
      <header className="filter__header">
        <strong>
          {formatDoy(year, range.startDoy)} – {formatDoy(year, range.endDoy)}
        </strong>
        <span className="muted">{days} days</span>
        {!isFull && (
          <button type="button" className="link-button" onClick={onReset}>
            Reset
          </button>
        )}
      </header>

      <div className="filter__brush">
        <SeasonOverview
          observations={observations}
          bounds={bounds}
          range={range}
        />
        <DualRangeSlider
          min={bounds.startDoy}
          max={bounds.endDoy}
          low={range.startDoy}
          high={range.endDoy}
          minGap={MIN_RANGE_DAYS}
          onChange={(startDoy, endDoy) => onChange({ startDoy, endDoy })}
        />
        <div className="filter__ends">
          <span>{formatDoy(year, bounds.startDoy)}</span>
          <span>{formatDoy(year, bounds.endDoy)}</span>
        </div>
      </div>
    </section>
  );
}
