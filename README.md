# Stomata Hour

A teaching simulator of **stomatal aperture**: two guard cells open and close a leaf pore in response to light, CO₂, and drought (ABA) cues. Simple mode keeps the story lean; Advanced adds readouts for aperture index, turgor proxy, phototropin cue, ABA, soil moisture, and a VPD proxy.

This is a didactic weighted-cue model with smooth canvas animation—not a research-grade biophysics engine.

## Develop

```bash
npm install
npm run watch
```

In another terminal, preview the static PWA:

```bash
cd docs && python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

One-shot production build:

```bash
npm run build
```

That minifies Tailwind → `docs/css/stomata-hour.css` and esbuild-minifies `src/js/app.js` → `docs/js/app.js`.

## Stack

- Plain JS (canvas viz + teaching model)
- Tailwind CSS 3 (design tokens: leaf / stomata / guard / pore / drought / co2 / light / mist / ink)
- esbuild minify, concurrently watch
- PWA shell (`manifest.webmanifest`, `sw.js`, icons)

## Deploy

GitHub Pages is **not** enabled on this repo. Deploy or ship only when Frank explicitly asks.
