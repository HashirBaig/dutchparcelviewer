import {
  FETCH_CONCURRENCY,
  MIN_VALID_FRACTION,
  S2_DEFAULT_OFFSET,
  S2_DEFAULT_SCALE,
  S2_OFFSET_CHANGE_DATE,
  SCL_PREFILTER_SLACK,
  VALID_SCL_CLASSES,
} from "../constants/analysis";
import { S2_ASSET_KEYS } from "../constants/api";
import { mapWithConcurrency } from "../lib/async";
import { isAbortError } from "../lib/errors";
import {
  buildPixelMask,
  padBounds,
  pickBufferM,
  polygonsAreaM2,
  type PixelMask,
  type Polygons,
} from "../lib/geometry";
import { buildPixelGrid } from "../lib/pixelGrid";
import { projectPolygons } from "../lib/projection";
import { sampleWindow } from "../lib/raster";
import { median } from "../lib/stats";
import type { Parcel } from "../types/parcel";
import type { PixelGrid, PixelStack } from "../types/pixels";
import type { RasterWindow } from "../types/raster";
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

/** Share of clear pixels inside the parcel on the coarse SCL grid. Null if no SCL pixel falls inside. */
function clearFraction(scl: RasterWindow, polygons: Polygons): number | null {
  const { mask, count } = buildPixelMask(polygons, scl, 0);
  if (count === 0) return null;
  let clear = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] && VALID_SCL_CLASSES.has(scl.values[i])) clear++;
  }
  return clear / count;
}

/** Everything that depends only on the parcel and the scene CRS, built once. */
interface GridContext {
  polygons: Polygons;
  grid: PixelGrid;
  inside: PixelMask; // pixel centres inside the parcel
  core: PixelMask; // same, minus the inner edge buffer (used for statistics)
}

interface SeriesContext {
  parcel: Parcel;
  grids: Map<number, GridContext>;
  signal: AbortSignal;
}

interface SceneResult {
  observation: NdviObservation;
  epsg: number;
  pixels: Float32Array;
}

function getGridContext(ctx: SeriesContext, epsg: number): GridContext {
  let entry = ctx.grids.get(epsg);
  if (!entry) {
    const polygons = projectPolygons(ctx.parcel.geometry, epsg);
    const grid = buildPixelGrid(polygons, epsg);
    entry = {
      polygons,
      grid,
      inside: buildPixelMask(polygons, grid, 0),
      core: buildPixelMask(
        polygons,
        grid,
        pickBufferM(polygonsAreaM2(polygons)),
      ),
    };
    ctx.grids.set(epsg, entry);
  }
  return entry;
}

async function observeItem(
  item: StacItem,
  ctx: SeriesContext,
): Promise<SceneResult | null> {
  const epsg = getItemEpsg(item);
  const { polygons, grid, inside, core } = getGridContext(ctx, epsg);

  const redAsset = item.assets[S2_ASSET_KEYS.red];
  const nirAsset = item.assets[S2_ASSET_KEYS.nir];
  const sclAsset = item.assets[S2_ASSET_KEYS.scl];
  if (!redAsset || !nirAsset || !sclAsset || core.count === 0) return null;

  const bounds = padBounds(
    [
      grid.originX,
      grid.originY + grid.height * grid.resY,
      grid.originX + grid.width * grid.resX,
      grid.originY,
    ],
    10,
  );

  // Phase 1: cheap 20 m scene classification. Skip cloudy scenes before touching red/NIR.
  const scl = await readWindow(sclAsset.href, bounds, ctx.signal);
  if (!scl) return null;
  const prefilter = clearFraction(scl, polygons);
  if (
    prefilter !== null &&
    prefilter < MIN_VALID_FRACTION - SCL_PREFILTER_SLACK
  )
    return null;

  // Phase 2: 10 m red and NIR
  const [red, nir] = await Promise.all([
    readWindow(redAsset.href, bounds, ctx.signal),
    readWindow(nirAsset.href, bounds, ctx.signal),
  ]);
  if (!red || !nir) return null;

  const datetime = item.properties.datetime;
  const redParams = getReflectanceParams(redAsset, datetime);
  const nirParams = getReflectanceParams(nirAsset, datetime);

  const pixels = new Float32Array(grid.width * grid.height).fill(Number.NaN);
  const coreValues: number[] = [];

  for (let row = 0; row < grid.height; row++) {
    for (let col = 0; col < grid.width; col++) {
      const index = row * grid.width + col;
      if (!inside.mask[index]) continue;

      const x = grid.originX + (col + 0.5) * grid.resX;
      const y = grid.originY + (row + 0.5) * grid.resY;
      const redDn = sampleWindow(red, x, y);
      const nirDn = sampleWindow(nir, x, y);
      const sclValue = sampleWindow(scl, x, y);
      if (
        !redDn ||
        !nirDn ||
        sclValue === null ||
        !VALID_SCL_CLASSES.has(sclValue)
      )
        continue;

      const r = redDn * redParams.scale + redParams.offset;
      const n = nirDn * nirParams.scale + nirParams.offset;
      if (n + r <= 0) continue;

      const value = (n - r) / (n + r);
      pixels[index] = value;
      if (core.mask[index]) coreValues.push(value);
    }
  }

  const validFraction = coreValues.length / core.count;
  if (coreValues.length === 0 || validFraction < MIN_VALID_FRACTION)
    return null;

  return {
    epsg,
    pixels,
    observation: {
      date: datetime.slice(0, 10),
      ndvi: median(coreValues),
      validFraction,
      itemId: item.id,
    },
  };
}

/** Keeps the best result per day (overlapping tiles can give duplicates). */
function dedupeByDate(results: SceneResult[]): SceneResult[] {
  const best = new Map<string, SceneResult>();
  for (const result of results) {
    const current = best.get(result.observation.date);
    if (
      !current ||
      result.observation.validFraction > current.observation.validFraction
    ) {
      best.set(result.observation.date, result);
    }
  }
  return [...best.values()].sort((a, b) =>
    a.observation.date.localeCompare(b.observation.date),
  );
}

/** Pixel stack for the CRS that most scenes use (a parcel can straddle two UTM zones). */
function buildPixelStack(
  ctx: SeriesContext,
  results: SceneResult[],
): PixelStack | null {
  const counts = new Map<number, number>();
  for (const result of results)
    counts.set(result.epsg, (counts.get(result.epsg) ?? 0) + 1);

  const primary = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const context = primary === undefined ? undefined : ctx.grids.get(primary);
  if (primary === undefined || !context) return null;

  return {
    parcelId: ctx.parcel.id,
    grid: context.grid,
    insideCount: context.inside.count,
    scenes: results
      .filter((result) => result.epsg === primary)
      .map((result) => ({
        date: result.observation.date,
        itemId: result.observation.itemId,
        ndvi: result.pixels,
      })),
  };
}

export async function buildNdviSeries(
  parcel: Parcel,
  items: StacItem[],
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
): Promise<NdviSeriesResult> {
  const ctx: SeriesContext = { parcel, grids: new Map(), signal };
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

  const kept = dedupeByDate(
    results.filter((r): r is SceneResult => r !== null),
  );
  return {
    observations: kept.map((r) => r.observation),
    itemsTotal: items.length,
    itemsFailed: failed,
    pixels: buildPixelStack(ctx, kept),
  };
}
