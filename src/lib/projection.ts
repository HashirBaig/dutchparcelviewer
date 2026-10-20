import proj4 from "proj4";
import type { ParcelGeometry } from "../types/parcel";
import { flattenPolygons, type Polygons } from "./geometry";

export function projectPolygons(
  geometry: ParcelGeometry,
  epsg: number,
): Polygons {
  if (epsg < 32601 || epsg > 32660)
    throw new Error(`Unsupported CRS: EPSG:${epsg}`);
  const zone = epsg - 32600;
  const converter = proj4(
    "EPSG:4326",
    `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`,
  );
  return flattenPolygons(geometry).map((polygon) =>
    polygon.map((ring) =>
      ring.map(([lon, lat]) => converter.forward([lon, lat])),
    ),
  );
}
