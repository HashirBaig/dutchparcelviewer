import { MIN_RANGE_DAYS, RANGE_PRESETS } from "../../constants/dateFilter";
import { presetToRange, sameRange } from "../../lib/dateRange";
import { formatDoy } from "../../lib/dates";
import type { RangePreset } from "../../types/dateFilter";
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
  onPreset: (preset: RangePreset) => void;
  onReset: () => void;
}

export function DateRangeFilter({
  year,
  observations,
  bounds,
  range,
  isFull,
  onChange,
  onPreset,
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

      <div className="chips">
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`chip${sameRange(range, presetToRange(year, preset)) ? " chip--active" : ""}`}
            onClick={() => onPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

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
