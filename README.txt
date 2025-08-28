# Shopstic Static Bundle (Browser Runtime)

This bundle contains your theme's assets, templates (JSON/sections/snippets), and a tiny LiquidJS bootstrap that renders the homepage in the browser and wraps it with `layout/theme.liquid` so CSS/JS load.

## How to run
1) Replace **assets/js/liquid.browser.min.js** with the real LiquidJS browser build (from the LiquidJS project).
2) Serve the folder over HTTP (or push to GitHub Pages) and open `index.html`.

## Notes
- Data lives under `/data/*.json` (settings, products). Adjust as needed.
- Translations will load automatically from `/locales/en.default.json` if present in your theme.
