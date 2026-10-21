/** Geometry of a north-up raster grid. resY is normally negative. */
export interface GridSpec {
  width: number;
  height: number;
  originX: number; // x of the top-left corner
  originY: number; // y of the top-left corner
  resX: number;
  resY: number;
}

export interface RasterWindow extends GridSpec {
  values: ArrayLike<number>;
}
