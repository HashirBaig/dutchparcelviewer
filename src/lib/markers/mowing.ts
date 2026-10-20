import { MIN_OBSERVATIONS, MOWING } from "../../constants/markers";
import type { MarkerEvent, MarkerResult } from "../../types/marker";
import type { NdviObservation } from "../../types/timeseries";
import { dayOfYear, daysBetween, midDate } from "../dates";

export function detectMowing(observations: NdviObservation[]): MarkerEvent[] {
  const obs = observations.filter((o) => {
    const doy = dayOfYear(o.date);
    return doy >= MOWING.windowStartDoy && doy <= MOWING.windowEndDoy;
  });

  const raw: MarkerEvent[] = [];
  for (let i = 1; i < obs.length; i++) {
    const prev = obs[i - 1];
    const cur = obs[i];
    const drop = prev.ndvi - cur.ndvi;
    if (daysBetween(prev.date, cur.date) > MOWING.maxGapDays) continue;
    if (prev.ndvi < MOWING.minPriorNdvi || drop < MOWING.minDrop) continue;

    const recovered = obs
      .slice(i + 1)
      .some(
        (o) =>
          daysBetween(cur.date, o.date) <= MOWING.recoveryWindowDays &&
          o.ndvi >= cur.ndvi + MOWING.minRecovery,
      );
    if (!recovered) continue;

    raw.push({
      date: midDate(prev.date, cur.date),
      label: `Mowing/grazing (NDVI −${drop.toFixed(2)})`,
    });
  }

  return raw.reduce<MarkerEvent[]>((kept, event) => {
    const last = kept[kept.length - 1];
    if (!last || daysBetween(last.date, event.date) > MOWING.mergeWithinDays)
      kept.push(event);
    return kept;
  }, []);
}

export function evaluateMowing(observations: NdviObservation[]): MarkerResult {
  const base = { id: "mowing", name: "Grassland mowing" };
  if (observations.length < MIN_OBSERVATIONS) {
    return {
      ...base,
      status: "insufficient",
      summary: `Only ${observations.length} clear observations (need ${MIN_OBSERVATIONS}).`,
      events: [],
    };
  }
  const events = detectMowing(observations);
  return events.length > 0
    ? {
        ...base,
        status: "green",
        summary: `${events.length} mowing/grazing event(s) detected.`,
        events,
      }
    : {
        ...base,
        status: "yellow",
        summary:
          "No mowing event detected. Could be pasture, or gaps between clear observations.",
        events,
      };
}
