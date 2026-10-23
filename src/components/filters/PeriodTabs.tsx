import { RANGE_PRESETS } from "../../constants/dateFilter";
import { RECENT_DAYS } from "../../constants/recent";
import { presetToRange, sameRange } from "../../lib/dateRange";
import type { PeriodMode, RangePreset } from "../../types/dateFilter";
import type { DateRange } from "../../types/timeseries";

interface Props {
  year: number;
  mode: PeriodMode;
  range: DateRange;
  seasonReady: boolean;
  onRecent: () => void;
  onPreset: (preset: RangePreset) => void;
}

export function PeriodTabs({
  year,
  mode,
  range,
  seasonReady,
  onRecent,
  onPreset,
}: Props) {
  return (
    <div className="chips" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "recent"}
        className={`chip${mode === "recent" ? " chip--active" : ""}`}
        onClick={onRecent}
      >
        Last {RECENT_DAYS} days
      </button>

      {RANGE_PRESETS.map((preset) => {
        const active =
          mode === "season" && sameRange(range, presetToRange(year, preset));
        return (
          <button
            key={preset.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`chip${active ? " chip--active" : ""}`}
            onClick={() => onPreset(preset)}
          >
            {preset.label}
            {!seasonReady && (
              <span
                className="chip__dot"
                title="Processing in the background"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
