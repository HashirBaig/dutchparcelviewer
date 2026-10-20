/** A window of a single-band raster. resY is normally negative (north-up). */
export interface RasterWindow {
  values: ArrayLike<number>;
  width: number;
  height: number;
  originX: number; // x of the window's top-left corner
  originY: number; // y of the window's top-left corner
  resX: number;
  resY: number;
}
