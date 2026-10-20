import type { Position } from "geojson";
import { INNER_BUFFER_RULES } from "../constants/analysis";
import type { ParcelGeometry } from "../types/parcel";
import type { RasterWindow } from "../types/raster";

export type Ring = Position[];
export type PolygonCoords = Ring[]; // outer ring first, then holes
export type Polygons = PolygonCoords[];
export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export const flattenPolygons = (geometry: ParcelGeometry): Polygons =>
  geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

export function boundsOf(polygons: Polygons): Bounds {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const polygon of polygons) {
    for (const [x, y] of polygon[0]) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return [minX, minY, maxX, maxY];
}

export const padBounds = ([a, b, c, d]: Bounds, pad: number): Bounds => [
  a - pad,
  b - pad,
  c + pad,
  d + pad,
];

function ringArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(sum) / 2;
}

export function polygonsAreaM2(polygons: Polygons): number {
  return polygons.reduce((total, [outer, ...holes]) => {
    const holeArea = holes.reduce((s, h) => s + ringArea(h), 0);
    return total + ringArea(outer) - holeArea;
  }, 0);
}

/** Area of a lon/lat geometry using a local equirectangular approximation. */
export function approxAreaHa(geometry: ParcelGeometry): number {
  const polygons = flattenPolygons(geometry);
  const lat0 = polygons[0]?.[0]?.[0]?.[1] ?? 52;
  const kx = 111_320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110_540;
  const local = polygons.map((p) =>
    p.map((r) => r.map(([lon, lat]) => [lon * kx, lat * ky])),
  );
  return polygonsAreaM2(local) / 10_000;
}

export function pickBufferM(areaM2: number): number {
  return (
    INNER_BUFFER_RULES.find((rule) => areaM2 >= rule.minAreaM2)?.bufferM ?? 0
  );
}

function inRing(x: number, y: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

const inPolygon = (x: number, y: number, [outer, ...holes]: PolygonCoords) =>
  inRing(x, y, outer) && !holes.some((h) => inRing(x, y, h));

/** True when all four corners of the bounds lie inside the polygon (lon/lat or projected, same CRS). */
export function containsBounds(
  polygon: PolygonCoords,
  [minX, minY, maxX, maxY]: Bounds,
): boolean {
  const corners: [number, number][] = [
    [minX, minY],
    [minX, maxY],
    [maxX, minY],
    [maxX, maxY],
  ];
  return corners.every(([x, y]) => inPolygon(x, y, polygon));
}

function distanceToSegment(
  px: number,
  py: number,
  a: Position,
  b: Position,
): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t =
    len2 === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / len2));
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
}

function distanceToEdges(x: number, y: number, polygons: Polygons): number {
  let min = Infinity;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length - 1; i++) {
        min = Math.min(min, distanceToSegment(x, y, ring[i], ring[i + 1]));
      }
    }
  }
  return min;
}

export interface PixelMask {
  mask: Uint8Array;
  count: number;
}

/** Marks pixels whose centre lies inside the parcel and at least bufferM from its edge. */
export function buildPixelMask(
  polygons: Polygons,
  win: RasterWindow,
  bufferM: number,
): PixelMask {
  const mask = new Uint8Array(win.width * win.height);
  let count = 0;
  for (let row = 0; row < win.height; row++) {
    for (let col = 0; col < win.width; col++) {
      const x = win.originX + (col + 0.5) * win.resX;
      const y = win.originY + (row + 0.5) * win.resY;
      if (!polygons.some((p) => inPolygon(x, y, p))) continue;
      if (bufferM > 0 && distanceToEdges(x, y, polygons) < bufferM) continue;
      mask[row * win.width + col] = 1;
      count++;
    }
  }
  return { mask, count };
}
