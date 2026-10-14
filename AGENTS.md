# Base44 Dev Environment

This repository is **Chart.js v2.5.0** — a standalone JavaScript charting *library*
(not a web app). It has no web server of its own; the user-facing preview is the
collection of static HTML samples under `samples/`, which load the bundled library
from `dist/Chart.bundle.js`.

## How it runs here

- `docker-compose.base44.yml` — single `web` service on `node:8` (matches the
  2017-era gulp 3.x / karma 0.12 toolchain; newer Node breaks gulp 3.x).
- Source is bind-mounted at `/app`; `node_modules` lives in an anonymous volume so
  the host checkout stays clean.
- Startup: `npm install` → `browserify` bundles `src/chart.js` into
  `dist/Chart.bundle.js` (initial build) → `watchify` (rebuilds `dist/` on
  `src/**` changes) → `node scripts/preview-server.js` (static server on
  `0.0.0.0:3000`, root `/` redirects to `/samples/bar/bar.html`).
- **Why not `gulp build`?** The gulpfile `require('gulp-connect')` at module top
  pulls in an ancient `socket.io` whose `store.js` does
  `Store.prototype.__proto__ = EventEmitter.prototype` — `EventEvent.prototype` is
  `undefined` on Node 8+, so the gulpfile crashes on load and `gulp build`/`gulp watch`
  never run. Building with `browserify`/`watchify` directly (already devDeps) produces
  the same `dist/Chart.bundle.js` the samples need, without the broken server dep.
- Preview is reachable on host port **3000**.

## Build / test commands (inside the container)

- Build (preview bundle): `node_modules/.bin/browserify src/chart.js --standalone Chart -p bundle-collapser/plugin -o dist/Chart.bundle.js`
- Watch (rebuild on src change): `node_modules/.bin/watchify src/chart.js --standalone Chart -p bundle-collapser/plugin -o dist/Chart.bundle.js -v`
- Lint: `node_modules/.bin/eslint src/ test/` (gulp itself is broken — see note above)
- Unit tests: `node_modules/.bin/gulp unittest` (needs a browser launcher; CI uses
  Chrome/Firefox via karma — not configured in the sandbox preview)

## Quirks

- `dist/` is gitignored and **must be generated** (`gulp build`) before any sample
  renders. The compose startup does this automatically.
- Samples reference `../../dist/Chart.bundle.js` (top-level samples use
  `../dist/Chart.bundle.js`); the preview server serves from the repo root so both
  resolve.
- `gulp 3.9.x` does not run on Node 12+ (graceful-fs regression) — keep `node:8`.
- Commit `8c90b9f2` ("Fix Chart.PluginBase") swapped the load order in
  `src/chart.js` so `core.element` loads before `core.plugin`, and changed
  `Chart.PluginBase` from `helpers.inherits({})` (broken — `this` was the `helpers`
  object, not a constructor) to `Chart.Element.extend({})`. This is a correct fix;
  the build succeeds with it.

## Verifying the preview

```bash
curl -s http://localhost:3000/samples/utils.js | head    # static server up
curl -s http://localhost:3000/dist/Chart.bundle.js | head # bundle built
```
