# IDEAtlas - Informal Settlements User Portal

A web-based platform for analysing informal settlements using prediction models, reference data, and user-generated evaluation layers.

## About

IDEAtlas is the public-facing user portal of the IDEAtlas project,
focusing on mapping, visualizing, and analysing informal settlements
across various regions. More information can be found on the official
project website: https://ideatlas.eu/

## Features

Mapping & Analysis

-   Interactive OpenLayers map

-   High-resolution basemaps (ESRI, OSM, Sentinel TCC)

-   Prediction layers incl. time series (2019–2024)

-   SSI layers (public + authenticated users)

-   City statistics

-   GeoSearch for global / city-specific navigation

Authentication

-   Login via Keycloak

-   Authenticated users gain access to:

    -   High-resolution prediction layers (10m)
    -   Reference layers
    -   Evaluation editing tools


## Tech Stack / Version Info

Component /	Version
- Node.js v22.14.0
- NPM v10.9.2
- Vue.js v3
- Vite v4
- PrimeVue	v3
- OpenLayers v8.2.0
- TypeScript v5.0.2
- Keycloak v26.2.0

## Project Structure

``` bash
ideatlas_frontend/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ services/
│  ├─ stores/
│  ├─ types/
│  ├─ App.vue
│  └─ main.ts
├─ LICENSE
├─ package.json
└─ README.md
```

## Get Started

``` bash
git clone https://github.com/geoville/ideatlas_frontend.git
cd ideatlas_frontend
npm install
npm run dev
```

## Build & Deployment

``` bash
npm run build
npm run preview
```

## Configuration
The following environment variables are required:
``` bash
VITE_ADMIN_USER_ID=
VITE_GEOSERVER_AUTH=
``` 
Create a `.env` file in the project root when needed.

## Contributing

Contributions are welcome! Please: 
- Open an issue before major
changes 
- Follow standard Vue 3 + Vite best practices 
- Use clear commit
messages and pull requests

## License

This project is licensed under the MIT License -- see the LICENSE file
for details.

## Contact

For questions or collaboration inquiries: **GeoVille GmbH**
https://www.geoville.com/
