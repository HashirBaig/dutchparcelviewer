import { useEffect, useState } from "react";
import { ARCHIVE_LAG_DAYS, PRECIP_LEAD_DAYS } from "../constants/precip";
import { addDays, doyToDate, seasonBounds, todayIso } from "../lib/dates";
import { errorMessage } from "../lib/errors";
import { boundsOf, flattenPolygons } from "../lib/geometry";
import { fetchDailyPrecip } from "../services/precipService";
import type { Parcel } from "../types/parcel";
import type { PrecipState } from "../types/precip";

const LOADING: PrecipState = { status: "loading", data: null, error: null };

export function usePrecipitation(parcel: Parcel, year: number): PrecipState {
  const [state, setState] = useState<PrecipState>(LOADING);

  useEffect(() => {
    let cancelled = false;

    const bounds = seasonBounds(year);
    const startDate = addDays(
      doyToDate(year, bounds.startDoy),
      -PRECIP_LEAD_DAYS,
    );
    const seasonEnd = doyToDate(year, bounds.endDoy);
    const latestAvailable = addDays(todayIso(), -ARCHIVE_LAG_DAYS);
    const endDate = seasonEnd < latestAvailable ? seasonEnd : latestAvailable; // ISO dates compare as strings

    if (endDate < startDate) {
      setState({
        status: "error",
        data: null,
        error: "No precipitation data is available yet for this season.",
      });
      return;
    }

    const [west, south, east, north] = boundsOf(
      flattenPolygons(parcel.geometry),
    );
    setState(LOADING);

    fetchDailyPrecip((south + north) / 2, (west + east) / 2, startDate, endDate)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data, error: null });
      })
      .catch((error) => {
        if (!cancelled)
          setState({ status: "error", data: null, error: errorMessage(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [parcel, year]);

  return state;
}
