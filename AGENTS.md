# Base44 Setup Notes — Chart.js (v2.5.0)

## What this is
This repository is the **Chart.js** JavaScript charting library (v2.5.0), not a web application. It has no server, database, or external services — just library source (`src/`) and static HTML sample demos (`samples/`).

## How it runs in the sandbox
- **Build:** `npx browserify src/chart.js --standalone Chart -p bundle-collapser/plugin -o dist/Chart.bundle.js` bundles the library. The sample HTML files load `../../dist/Chart.bundle.js`.
- **Watch:** `npx watchify` (same args) runs in the background to rebuild `dist/Chart.bundle.js` when `src/` changes.
- **Serve:** A custom `dev-server.js` (minimal Node HTTP static server) serves the repo root on port **8000** (mapped to host port **3000** in compose). The index gallery is at `/` and samples are at `/samples/...`.
- **Why not gulp:** `gulp-connect` depends on an old `socket.io` that crashes on Node 10+ (`Cannot read property 'prototype' of undefined`). The gulpfile can't even load, so `gulp build`/`gulp server`/`gulp watch` all fail. Browserify + watchify (already devDependencies) replace the build/watch tasks; `dev-server.js` replaces the server.
- **Node version:** `node:10` Docker image — the old devDependencies (browserify 13, watchify 3, etc.) are not compatible with modern Node (16+).

## No secrets required
No external credentials are needed — the project is a self-contained JS library.

## Verifying it works
- `curl http://localhost:3000/` → the index gallery page
- `curl http://localhost:3000/dist/Chart.bundle.js` → the built library (~547 KB)
- Open any sample link in the preview to see a rendered chart

## Compose details
- `node_modules` is a named volume (not bind-mounted) to avoid host/platform filesystem issues.
- Healthcheck probes `GET /samples/utils.js` on port 8000.
- `restart: on-failure` so transient npm install issues self-heal.
