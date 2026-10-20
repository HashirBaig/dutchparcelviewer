import { fromUrl } from "geotiff";
import type { Bounds } from "../lib/geometry";
import type { RasterWindow } from "../types/raster";

/** Reads band 1 of a Cloud-Optimized GeoTIFF for a bbox given in the raster's CRS. */
export async function readWindow(
  url: string,
  bounds: Bounds,
  signal?: AbortSignal,
): Promise<RasterWindow | null> {
  const tiff = await fromUrl(url, {}, signal);
  const image = await tiff.getImage();
  const [originX, originY] = image.getOrigin();
  const [resX, resY] = image.getResolution();
  const [minX, minY, maxX, maxY] = bounds;

  const x0 = Math.max(0, Math.floor((minX - originX) / resX));
  const x1 = Math.min(image.getWidth(), Math.ceil((maxX - originX) / resX));
  const y0 = Math.max(0, Math.floor((maxY - originY) / resY));
  const y1 = Math.min(image.getHeight(), Math.ceil((minY - originY) / resY));
  if (x1 <= x0 || y1 <= y0) return null;

  const rasters = await image.readRasters({
    window: [x0, y0, x1, y1],
    samples: [0],
    signal,
  });
  const band = (rasters as unknown as ArrayLike<number>[])[0];

  return {
    values: band,
    width: x1 - x0,
    height: y1 - y0,
    originX: originX + x0 * resX,
    originY: originY + y0 * resY,
    resX,
    resY,
  };
}
