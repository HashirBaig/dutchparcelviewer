import {
  MAX_OUTPUT_PIXELS,
  NDVI_CLASSES,
  OUTPUT_METERS_PER_PIXEL,
} from "../constants/ndviMap";
import type { NdviMapImage } from "../types/ndviMap";
import type { ParcelGeometry } from "../types/parcel";
import type { AggregatedMap } from "../types/pixels";
import { boundsOf, flattenPolygons, pointInPolygons } from "./geometry";
import { classIndex, colorToRgb } from "./ndviClasses";
import { getUtmConverter, projectPolygons } from "./projection";

const PALETTE = NDVI_CLASSES.map((cls) => colorToRgb(cls.color));

/**
 * Draws the aggregated NDVI grid onto a lon/lat canvas so it lines up with the
 * Leaflet map. Each canvas pixel samples the UTM grid (nearest neighbour) and
 * is clipped to the exact parcel outline.
 */
export function renderNdviImage(
  aggregated: AggregatedMap,
  geometry: ParcelGeometry,
): NdviMapImage | null {
  const [west, south, east, north] = boundsOf(flattenPolygons(geometry));
  const latMid = (south + north) / 2;
  const widthM = (east - west) * 111_320 * Math.cos((latMid * Math.PI) / 180);
  const heightM = (north - south) * 110_540;

  const metersPerPixel = Math.max(
    OUTPUT_METERS_PER_PIXEL,
    Math.sqrt((widthM * heightM) / MAX_OUTPUT_PIXELS),
  );
  const width = Math.max(1, Math.ceil(widthM / metersPerPixel));
  const height = Math.max(1, Math.ceil(heightM / metersPerPixel));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(width, height);
  const { grid, values } = aggregated;
  const converter = getUtmConverter(grid.epsg);
  const projected = projectPolygons(geometry, grid.epsg);

  for (let j = 0; j < height; j++) {
    const lat = north - ((j + 0.5) / height) * (north - south);
    for (let i = 0; i < width; i++) {
      const lon = west + ((i + 0.5) / width) * (east - west);
      const [x, y] = converter.forward([lon, lat]);

      const col = Math.floor((x - grid.originX) / grid.resX);
      const row = Math.floor((y - grid.originY) / grid.resY);
      if (col < 0 || row < 0 || col >= grid.width || row >= grid.height)
        continue;

      const value = values[row * grid.width + col];
      if (Number.isNaN(value) || !pointInPolygons(x, y, projected)) continue;

      const [r, g, b] = PALETTE[classIndex(value)];
      const offset = (j * width + i) * 4;
      image.data[offset] = r;
      image.data[offset + 1] = g;
      image.data[offset + 2] = b;
      image.data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return {
    url: canvas.toDataURL("image/png"),
    bounds: [
      [south, west],
      [north, east],
    ],
  };
}
