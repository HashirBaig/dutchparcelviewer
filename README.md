# Pipe network pilot (fictional water utility)

Portfolio project for a GIS information-analyst role. The analysis package lives in `/docs`;
this prototype implements the user stories listed below. Asset data is synthetic, street geometry is
OpenStreetMap (ODbL). Static app, no backend (NFR-01).

## Run it

```bash
cd app
npm install
npm run generate            # fetch streets from Overpass, write public/network.geojson
# npm run generate:offline  # no network? synthetic street grid instead
npm run dev
```

Commit the generated `network.geojson` so the demo is stable (NFR-02, seed 42).

## Traceability (implemented so far)

| Story | What it covers | Where |
|---|---|---|
| US-01 | Network on a map | `app/src/components/MapView.tsx` |
| US-02 | Colour by condition, legend, "not scored" style | `app/src/condition.ts`, `ConditionLegend.tsx` |
| US-04 | Pipe details, missing values marked | `app/src/components/PipeDetail.tsx` (first version) |
| NFR-01 | Static app, no backend | `vite.config.ts`, `scripts/generate-network.mjs` |
| NFR-02 | Reproducible data | `scripts/generate-network.mjs` (seeded PRNG, fixed reference year) |
| DQ-01 to DQ-05 | Defects injected for the data-quality layer | `scripts/generate-network.mjs`, ground truth in `scripts/output/injected-defects.json` |

DQ-06 (disconnected segment) and DQ-07 (diameter grows downstream) need network topology and come with US-10.
