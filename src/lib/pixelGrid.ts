import { S2_PIXEL_SIZE_M } from "../constants/analysis";
import type { PixelGrid } from "../types/pixels";
import { boundsOf, type Polygons } from "./geometry";

/** A 10 m grid snapped to multiples of 10 m, which matches the Sentinel-2 grid. */
export function buildPixelGrid(polygons: Polygons, epsg: number): PixelGrid {
  const [minX, minY, maxX, maxY] = boundsOf(polygons);
  const size = S2_PIXEL_SIZE_M;
  const originX = Math.floor(minX / size) * size;
  const originY = Math.ceil(maxY / size) * size;

  return {
    epsg,
    originX,
    originY,
    resX: size,
    resY: -size,
    width: Math.max(1, Math.ceil((maxX - originX) / size)),
    height: Math.max(1, Math.ceil((originY - minY) / size)),
  };
}
