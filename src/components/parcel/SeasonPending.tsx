import type { AnalysisState } from "../../types/analysis";
import { ProgressBar } from "../ui/ProgressBar";

export function SeasonPending({ season }: { season: AnalysisState }) {
  if (season.phase === "error") {
    return <p className="error">Season analysis failed: {season.error}</p>;
  }

  return (
    <section className="card pending">
      <h3>Data is being processed</h3>
      <p>
        The season scenes for this parcel are still being processed in the
        background. Spring, Summer, Autumn and Full season will be available as
        soon as this finishes.
      </p>
      {season.phase === "idle" && (
        <p className="muted">Waiting for the last-days analysis to finish…</p>
      )}
      {season.phase === "searching" && (
        <p className="muted">Searching Sentinel-2 scenes…</p>
      )}
      {season.phase === "reading" && <ProgressBar {...season.progress} />}
    </section>
  );
}
