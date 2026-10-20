import type { Progress } from "../../types/timeseries";

export function ProgressBar({ done, total }: Progress) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuenow={percent}>
      <div className="progress__bar" style={{ width: `${percent}%` }} />
      <span className="progress__label">
        Reading scenes {done}/{total}
      </span>
    </div>
  );
}
