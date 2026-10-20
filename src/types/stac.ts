export interface StacRasterBand {
  scale?: number;
  offset?: number;
  nodata?: number;
}

export interface StacAsset {
  href: string;
  "raster:bands"?: StacRasterBand[];
}

export interface StacItem {
  id: string;
  properties: {
    datetime: string;
    "eo:cloud_cover"?: number;
    "proj:epsg"?: number;
    "proj:code"?: string;
  };
  assets: Record<string, StacAsset>;
}

export interface StacLink {
  rel: string;
  href: string;
  method?: string;
  body?: Record<string, unknown>;
}

export interface StacSearchResponse {
  features: StacItem[];
  links?: StacLink[];
}
