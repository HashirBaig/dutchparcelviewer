# ParcelLens

**Satellite-powered crop parcel monitoring and land-cover change analysis for the Netherlands.**

ParcelLens is a web-based geospatial prototype inspired by the EU Common Agricultural Policy (CAP) **Area Monitoring System (AMS)**. It brings together Dutch agricultural parcel declarations, satellite observations, and interpretable monitoring markers to explore how crop declarations could be checked against seasonal field activity.

The application is designed around an interactive map: select an agricultural parcel, inspect its declared crop, and review satellite-derived signals that may support or contradict the declaration. A complementary land-cover change analysis view is planned using satellite embeddings.

> **Project status:** Prototype / work in progress. Monitoring outcomes are illustrative decision-support signals, **not official CAP compliance decisions**.

## Features

### Parcel monitoring

- **Interactive Dutch parcel map:** Explore agricultural parcels and select one to investigate.
- **Declared crop context:** Use crop parcel information from the Dutch _Basisregistratie Gewaspercelen_ (BRP), published through PDOK.
- **Satellite time series:** The intended monitoring workflow uses **Sentinel-2** optical imagery and **Sentinel-1** radar observations across a growing season.
- **Agricultural markers:** Analyze seasonal signals such as vegetation development and potential field activity. The current prototype focuses on Sentinel-2 NDVI markers.
- **Explainable assessment:** Compare observed signals with the declared crop and present a **green / yellow / red** indication with a confidence score (planned / evolving).

### Land-cover change detection (planned)

A separate analysis view will use **satellite embeddings** to highlight areas with potential land-cover change. Results are intended for map-based exploration and review rather than automatic ground-truth labeling.

## How it works

```text
Dutch BRP parcel declarations (PDOK)
                |
                v
       Select a crop parcel
                |
                v
   Retrieve seasonal satellite data
      Sentinel-2 / Sentinel-1
                |
                v
     Calculate monitoring markers
      (e.g., NDVI time series)
                |
                v
   Compare markers to declared crop
                |
                v
     Review assessment + confidence
          Green / Yellow / Red
```

The planned change-detection workflow runs alongside parcel monitoring:

```text
Area of interest -> Satellite embeddings -> Change analysis -> Map visualization
```

## Data sources

| Source                               | Purpose                                                      | Reference                                                           |
| ------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| **PDOK / BRP**                       | Dutch agricultural parcel geometries and declared crops      | [PDOK](https://www.pdok.nl/)                                        |
| **Copernicus Sentinel-2**            | Multispectral optical imagery, including bands used for NDVI | [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/) |
| **Copernicus Sentinel-1**            | Radar observations to complement optical monitoring          | [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/) |
| **Satellite embeddings** _(planned)_ | Representation-based land-cover change analysis              | Provider / model to be selected                                     |

Data availability, update frequency, coverage, terms of use, and processing limitations depend on the selected services and datasets.

## Technology

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Mapping:** Interactive web map with parcel selection
- **Deployment:** Netlify
- **Geospatial data:** PDOK BRP; Sentinel imagery for the monitoring workflow

Specific imagery processing, embedding, and hosting services may change as the prototype evolves.

## Getting started

### Prerequisites

- Node.js and npm (use a version compatible with the project's Vite configuration)
- Access to any external APIs configured by the application

### Run locally

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
npm install
npm run dev
```

Open the local URL printed by Vite (often `http://localhost:5173`).

> If your implementation requires API keys or service URLs, define them in a local `.env` file following the project's configuration. Do not commit secrets. Remember that variables exposed to Vite frontend code are visible to browser users.

### Build for production

```bash
npm run build
npm run preview
```

Vite typically writes the production bundle to `dist/`.

## Deploy to Netlify

1. Push the repository to GitHub, GitLab, or another supported Git provider.
2. In Netlify, create a site from the repository.
3. Set the **build command** to `npm run build` and the **publish directory** to `dist` (for a standard Vite build).
4. Add any required environment variables in Netlify's project settings.
5. Deploy and verify parcel loading and API requests in the production environment.

If client-side routing is added, configure a Netlify redirect so deep links resolve to `index.html`.

## Roadmap

- [x] Define the ParcelLens concept and prototype map interface
- [x] Add parcel selection and a parcel information panel
- [ ] Expand the Sentinel-2 NDVI time-series markers
- [ ] Integrate Sentinel-1 seasonal signals
- [ ] Add crop-specific marker rules and interpretable evidence
- [ ] Implement calibrated confidence and green/yellow/red assessments
- [ ] Add satellite-embedding-based land-cover change detection
- [ ] Add reproducible evaluation against reference observations

Roadmap checkboxes describe project direction; actual completion should be updated as implementation progresses.

## Important limitations

- A declared crop and satellite-derived vegetation signal are **not interchangeable**: cloud cover, mixed pixels, crop rotation, parcel geometry, radar interpretation, and acquisition gaps can affect results.
- A green/yellow/red output should represent **screening priority or evidence consistency**, not a definitive finding of non-compliance.
- Confidence scores require a documented methodology and validation before they can be interpreted as calibrated probabilities.
- Parcel declarations and remote-sensing products may cover different dates or seasons. Always compare matching periods.

## Purpose

ParcelLens is a portfolio and experimentation project exploring how **GeoAI, remote sensing, and geospatial web development** can make agricultural monitoring more transparent, accessible, and explainable.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to grant others permission to reuse or redistribute the code.
