# Piper Archer PA-28-TX Weight & Balance

A simple React + Tailwind CSS PWA for calculating weight & balance and altitude/performance data for the Piper Archer PA-28-TX.

## What’s included

- Weight & balance table with automatic moment and arm calculations
- Fuel conversions (gal → lb) and fuel burn sync (hr ⇄ gal)
- Highlighted ramp, takeoff, and landing rows
- PWA-ready manifest and service worker

## Quick start

Install dependencies and start the dev server:

```shell
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build a production bundle

```shell
npm run build
npm run preview
```

## Notes

- To use the PWA offline, build and serve the production bundle (the service worker is enabled there).

- CG Envelope:

> The CG envelope for the PA-28-TX features a fixed aft limit of 93.0 inches. The forward limit is 82.0 inches up to 2,050 lb, then slopes linearly to 88.5 inches at 2,550 lb. The app performs real-time CG validation against this weight-dependent envelope and visually warns the pilot if the CG is out of limits.

## Deployment

- Build the production assets before deploying:

	```shell
	npm run build
	```

- Publish the compiled `dist` folder via Cloudflare Wrangler (the `wrangler.jsonc` config already points to the assets directory):

	```shell
	npx wrangler deploy --assets ./dist
	```
