import type { AnalysisState } from "../../types/analysis";
import { ProgressBar } from "../ui/ProgressBar";

export function BackgroundStatus({ season }: { season: AnalysisState }) {
  if (season.phase === "done") {
    return (
      <p className="bg-status bg-status--done">
        Full-season analysis is ready. Choose Spring, Summer, Autumn or Full
        season above.
      </p>
    );
  }
  if (season.phase === "error") {
    return <p className="error">Full-season analysis failed: {season.error}</p>;
  }
  return (
    <div className="bg-status">
      <p className="muted">
        Full-season analysis is running in the background…
      </p>
      {season.phase === "reading" && <ProgressBar {...season.progress} />}
    </div>
  );
}
