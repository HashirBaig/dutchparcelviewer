import { RECENT_DAYS } from "../constants/recent";
import { addDays, todayIso } from "./dates";

export interface RecentWindow {
  from: string;
  to: string;
}

export function getRecentWindow(): RecentWindow {
  const to = todayIso();
  return { from: addDays(to, -RECENT_DAYS), to };
}

/** STAC datetime interval. */
export const recentInterval = ({ from, to }: RecentWindow): string =>
  `${from}T00:00:00Z/${to}T23:59:59Z`;
