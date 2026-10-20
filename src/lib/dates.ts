import { SEASON_END_MONTH, SEASON_START_MONTH } from "../constants/analysis";

const MS_PER_DAY = 86_400_000;
const parse = (date: string) => Date.parse(`${date}T00:00:00Z`);
const pad = (n: number) => String(n).padStart(2, "0");

export const daysBetween = (a: string, b: string): number =>
  Math.round((parse(b) - parse(a)) / MS_PER_DAY);

export const dayOfYear = (date: string): number =>
  daysBetween(`${date.slice(0, 4)}-01-01`, date) + 1;

export const addDays = (date: string, days: number): string =>
  new Date(parse(date) + days * MS_PER_DAY).toISOString().slice(0, 10);

export const midDate = (a: string, b: string): string =>
  addDays(a, Math.round(daysBetween(a, b) / 2));

export const monthStartDoy = (year: number, month: number): number =>
  dayOfYear(`${year}-${pad(month)}-01`);

export const seasonInterval = (year: number): string =>
  `${year}-${pad(SEASON_START_MONTH)}-01T00:00:00Z/${year}-${pad(SEASON_END_MONTH)}-31T23:59:59Z`;
