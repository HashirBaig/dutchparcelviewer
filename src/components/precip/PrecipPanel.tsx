import { useState } from "react";
import {
  DEFAULT_LAG_DAYS,
  LAG_OPTIONS_DAYS,
  OPEN_METEO_ATTRIBUTION,
  SLOPE_UNIT_MM,
} from "../../constants/precip";
import { usePrecipitation } from "../../hooks/usePrecipitation";
import { usePrecipRegressions } from "../../hooks/usePrecipRegressions";
import { formatDoy } from "../../lib/dates";
import {
  describeRelationship,
  formatP,
  formatSigned,
} from "../../lib/regressionText";
import type { Parcel } from "../../types/parcel";
import type { DateRange, NdviObservation } from "../../types/timeseries";
import { PrecipScatter } from "../charts/PrecipScatter";
import { RegressionTable } from "./RegressionTable";

interface Props {
  parcel: Parcel;
  year: number;
  observations: NdviObservation[];
  range: DateRange;
}

export function PrecipPanel({ parcel, year, observations, range }: Props) {
  const precip = usePrecipitation(parcel, year);
  const [lagDays, setLagDays] = useState<number>(DEFAULT_LAG_DAYS);
  const regressions = usePrecipRegressions(
    observations,
    precip.data,
    year,
    range,
    lagDays,
  );

  return (
    <section className="card precip">
      <header className="card__header">
        <h3>Rainfall vs NDVI</h3>
      </header>

      {precip.status === "loading" && (
        <p className="muted">Loading precipitation…</p>
      )}
      {precip.status === "error" && <p className="error">{precip.error}</p>}

      {regressions && (
        <>
          <div className="chips">
            {LAG_OPTIONS_DAYS.map((days) => (
              <button
                key={days}
                type="button"
                className={`chip${days === lagDays ? " chip--active" : ""}`}
                onClick={() => setLagDays(days)}
              >
                {days}-day rain
              </button>
            ))}
          </div>

          <p className="muted">
            {formatDoy(year, range.startDoy)} – {formatDoy(year, range.endDoy)}{" "}
            · {regressions.selected.points.length} paired observations
          </p>

          <PrecipScatter
            points={regressions.selected.points}
            result={regressions.selected.result}
            lagDays={lagDays}
          />

          {regressions.selected.result && (
            <dl className="stats">
              <div>
                <dt>r</dt>
                <dd>{formatSigned(regressions.selected.result.r)}</dd>
              </div>
              <div>
                <dt>R²</dt>
                <dd>{regressions.selected.result.r2.toFixed(2)}</dd>
              </div>
              <div>
                <dt>p</dt>
                <dd>{formatP(regressions.selected.result.p)}</dd>
              </div>
              <div>
                <dt>Slope /{SLOPE_UNIT_MM} mm</dt>
                <dd>
                  {formatSigned(
                    regressions.selected.result.slope * SLOPE_UNIT_MM,
                    3,
                  )}
                </dd>
              </div>
            </dl>
          )}

          <p>{describeRelationship(regressions.selected.result)}</p>

          <RegressionTable
            periods={regressions.periods}
            activeId={regressions.activeId}
          />

          <p className="muted">
            Each dot is one cloud-free Sentinel-2 date: parcel median NDVI
            against rain accumulated in the {lagDays} days before it. NDVI also
            follows the growth cycle, so r (date-adj.) removes the effect of day
            of year and is the more reliable number. One parcel in one season is
            a small sample: treat results as exploratory. Rainfall is gridded
            data at the parcel centre, not measured on the field.{" "}
            <a
              href={OPEN_METEO_ATTRIBUTION.url}
              target="_blank"
              rel="noreferrer"
            >
              {OPEN_METEO_ATTRIBUTION.text}
            </a>{" "}
            (CC BY 4.0).
          </p>
        </>
      )}
    </section>
  );
}
