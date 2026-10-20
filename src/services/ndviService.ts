import {
  FETCH_CONCURRENCY,
  MIN_VALID_FRACTION,
  S2_DEFAULT_OFFSET,
  S2_DEFAULT_SCALE,
  S2_OFFSET_CHANGE_DATE,
  VALID_SCL_CLASSES,
} from "../constants/analysis";
import { S2_ASSET_KEYS } from "../constants/api";
import { mapWithConcurrency } from "../lib/async";
import { isAbortError } from "../lib/errors";
import {
  boundsOf,
  buildPixelMask,
  padBounds,
  pickBufferM,
  polygonsAreaM2,
  type PixelMask,
  type Polygons,
} from "../lib/geometry";
import { projectPolygons } from "../lib/projection";
import { sampleWindow } from "../lib/raster";
import { median } from "../lib/stats";
import type { Parcel } from "../types/parcel";
import type { StacAsset, StacItem } from "../types/stac";
import type {
  NdviObservation,
  NdviSeriesResult,
  Progress,
} from "../types/timeseries";
import { readWindow } from "./cogService";

function getItemEpsg(item: StacItem): number {
  const direct = item.properties["proj:epsg"];
  if (direct) return direct;
  const code = item.properties["proj:code"]?.match(/EPSG:(\d+)/);
  if (code) return Number(code[1]);
  throw new Error(`Scene ${item.id} has no CRS information.`);
}

function getReflectanceParams(asset: StacAsset, datetime: string) {
  const band = asset["raster:bands"]?.[0];
  const afterChange = datetime.slice(0, 10) >= S2_OFFSET_CHANGE_DATE;
  return {
    scale: band?.scale ?? S2_DEFAULT_SCALE,
    offset: band?.offset ?? (afterChange ? S2_DEFAULT_OFFSET : 0),
  };
}

interface SeriesContext {
  parcel: Parcel;
  projected: Map<number, Polygons>;
  masks: Map<string, PixelMask>;
  signal: AbortSignal;
}

async function observeItem(
  item: StacItem,
  ctx: SeriesContext,
): Promise<NdviObservation | null> {
  const epsg = getItemEpsg(item);
  let polygons = ctx.projected.get(epsg);
  if (!polygons) {
    polygons = projectPolygons(ctx.parcel.geometry, epsg);
    ctx.projected.set(epsg, polygons);
  }

  const redAsset = item.assets[S2_ASSET_KEYS.red];
  const nirAsset = item.assets[S2_ASSET_KEYS.nir];
  const sclAsset = item.assets[S2_ASSET_KEYS.scl];
  if (!redAsset || !nirAsset || !sclAsset) return null;

  const bounds = padBounds(boundsOf(polygons), 10);
  const [red, nir, scl] = await Promise.all([
    readWindow(redAsset.href, bounds, ctx.signal),
    readWindow(nirAsset.href, bounds, ctx.signal),
    readWindow(sclAsset.href, bounds, ctx.signal),
  ]);
  if (!red || !nir || !scl) return null;
  if (red.width !== nir.width || red.height !== nir.height) return null;

  const maskKey = `${epsg}:${nir.originX}:${nir.originY}:${nir.width}:${nir.height}`;
  let pixelMask = ctx.masks.get(maskKey);
  if (!pixelMask) {
    pixelMask = buildPixelMask(
      polygons,
      nir,
      pickBufferM(polygonsAreaM2(polygons)),
    );
    ctx.masks.set(maskKey, pixelMask);
  }
  if (pixelMask.count === 0) return null;

  const datetime = item.properties.datetime;
  const redParams = getReflectanceParams(redAsset, datetime);
  const nirParams = getReflectanceParams(nirAsset, datetime);
  const values: number[] = [];

  for (let row = 0; row < nir.height; row++) {
    for (let col = 0; col < nir.width; col++) {
      const index = row * nir.width + col;
      if (!pixelMask.mask[index]) continue;
      const redDn = red.values[index];
      const nirDn = nir.values[index];
      if (redDn === 0 || nirDn === 0) continue; // nodata

      const x = nir.originX + (col + 0.5) * nir.resX;
      const y = nir.originY + (row + 0.5) * nir.resY;
      const sclValue = sampleWindow(scl, x, y);
      if (sclValue === null || !VALID_SCL_CLASSES.has(sclValue)) continue;

      const r = redDn * redParams.scale + redParams.offset;
      const n = nirDn * nirParams.scale + nirParams.offset;
      if (n + r <= 0) continue;
      values.push((n - r) / (n + r));
    }
  }

  const validFraction = values.length / pixelMask.count;
  if (values.length === 0 || validFraction < MIN_VALID_FRACTION) return null;

  return {
    date: datetime.slice(0, 10),
    ndvi: median(values),
    validFraction,
    itemId: item.id,
  };
}

/** Keeps the best observation per day (overlapping tiles can give duplicates). */
function dedupeByDate(observations: NdviObservation[]): NdviObservation[] {
  const best = new Map<string, NdviObservation>();
  for (const obs of observations) {
    const current = best.get(obs.date);
    if (!current || obs.validFraction > current.validFraction)
      best.set(obs.date, obs);
  }
  return [...best.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function buildNdviSeries(
  parcel: Parcel,
  items: StacItem[],
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
): Promise<NdviSeriesResult> {
  const ctx: SeriesContext = {
    parcel,
    projected: new Map(),
    masks: new Map(),
    signal,
  };
  let done = 0;
  let failed = 0;

  const results = await mapWithConcurrency(
    items,
    FETCH_CONCURRENCY,
    async (item) => {
      try {
        return await observeItem(item, ctx);
      } catch (error) {
        if (isAbortError(error)) throw error;
        failed++;
        return null;
      } finally {
        done++;
        onProgress({ done, total: items.length });
      }
    },
    signal,
  );

  if (items.length > 0 && failed === items.length) {
    throw new Error(
      "Could not read any Sentinel-2 scenes (network or CORS problem). Check the browser console.",
    );
  }

  const observations = dedupeByDate(
    results.filter((o): o is NdviObservation => o !== null),
  );
  return { observations, itemsTotal: items.length, itemsFailed: failed };
}
