import { classRangeLabel } from "../../lib/ndviClasses";
import type { NdviMapState } from "../../types/ndviMap";

interface Props {
  state: NdviMapState;
  visible: boolean;
  onToggle: (visible: boolean) => void;
}

export function NdviLegend({ state, visible, onToggle }: Props) {
  if (state.status === "idle") return null;

  return (
    <div className="ndvi-legend">
      <label className="ndvi-legend__toggle">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onToggle(e.target.checked)}
        />
        NDVI map
      </label>

      {state.status === "loading" && (
        <p className="muted">Processing scenes…</p>
      )}

      {state.status === "empty" && (
        <p className="muted">No clear observations in this period.</p>
      )}

      {state.status === "ready" && (
        <>
          <ul>
            {[...state.shares].reverse().map(({ cls, index, share }) => (
              <li key={cls.id}>
                <span
                  className="ndvi-legend__swatch"
                  style={{ backgroundColor: cls.color }}
                />
                <span className="ndvi-legend__label">
                  {cls.label} <small>{classRangeLabel(index)}</small>
                </span>
                <span className="ndvi-legend__share">
                  {Math.round(share * 100)}%
                </span>
              </li>
            ))}
          </ul>
          <p className="muted">
            Median of {state.sceneCount} scenes
            {state.coverage !== null
              ? ` · ${Math.round(state.coverage * 100)}% of parcel covered`
              : ""}
          </p>
        </>
      )}
    </div>
  );
}
