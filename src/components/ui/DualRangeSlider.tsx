interface Props {
  min: number;
  max: number;
  low: number;
  high: number;
  minGap: number;
  onChange: (low: number, high: number) => void;
  labelLow?: string;
  labelHigh?: string;
}

export function DualRangeSlider({
  min,
  max,
  low,
  high,
  minGap,
  onChange,
  labelLow = "Range start",
  labelHigh = "Range end",
}: Props) {
  const pct = (value: number) => ((value - min) / (max - min)) * 100;
  // keep the start thumb reachable when both thumbs sit near the right edge
  const lowOnTop = low > max - (max - min) * 0.1;

  return (
    <div className="dual">
      <div className="dual__track" />
      <div
        className="dual__fill"
        style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={low}
        aria-label={labelLow}
        style={{ zIndex: lowOnTop ? 3 : 2 }}
        onChange={(e) =>
          onChange(Math.min(Number(e.target.value), high - minGap), high)
        }
      />
      <input
        type="range"
        min={min}
        max={max}
        value={high}
        aria-label={labelHigh}
        style={{ zIndex: 2 }}
        onChange={(e) =>
          onChange(low, Math.max(Number(e.target.value), low + minGap))
        }
      />
    </div>
  );
}
