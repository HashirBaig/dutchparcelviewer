import { OPEN_METEO_ARCHIVE_URL } from "../constants/precip";
import { daysBetween } from "../lib/dates";
import { fetchJson } from "../lib/http";
import type { DailyPrecip } from "../types/precip";

interface ArchiveResponse {
  daily?: { time: string[]; precipitation_sum: (number | null)[] };
}

// Shared by parcels in the same area. No AbortSignal on purpose: callers ignore stale results themselves.
const cache = new Map<string, Promise<DailyPrecip>>();

async function load(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DailyPrecip> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start_date: startDate,
    end_date: endDate,
    daily: "precipitation_sum",
    timezone: "auto",
  });
  const response = await fetchJson<ArchiveResponse>(
    `${OPEN_METEO_ARCHIVE_URL}?${params}`,
  );
  const daily = response.daily;
  if (!daily) throw new Error("Open-Meteo returned no daily data.");

  const length = daysBetween(startDate, endDate) + 1;
  const values = new Array<number>(length).fill(Number.NaN);
  daily.time.forEach((date, i) => {
    const index = daysBetween(startDate, date);
    const value = daily.precipitation_sum[i];
    if (index >= 0 && index < length && value !== null) values[index] = value;
  });
  return { startDate, values };
}

export function fetchDailyPrecip(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DailyPrecip> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${startDate},${endDate}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const request = load(lat, lon, startDate, endDate).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, request);
  return request;
}
