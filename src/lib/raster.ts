import type { RasterWindow } from "../types/raster";

/** Returns the value at map coordinate (x, y), or null when outside the window. */
export function sampleWindow(
  win: RasterWindow,
  x: number,
  y: number,
): number | null {
  const col = Math.floor((x - win.originX) / win.resX);
  const row = Math.floor((y - win.originY) / win.resY);
  if (col < 0 || row < 0 || col >= win.width || row >= win.height) return null;
  return win.values[row * win.width + col];
}
