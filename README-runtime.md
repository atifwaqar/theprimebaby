# Shopstic – Browser Runtime (LiquidJS) Starter

This is a **minimal in‑browser Liquid renderer** starter for hosting a Shopify‑style theme on **GitHub Pages** (no backend). It uses the **LiquidJS** browser bundle to parse `.liquid` templates and render them at runtime with a JSON context (settings + mock data).

> ⚠️ Replace `assets/js/liquid.browser.min.js` with the **real LiquidJS browser build**. This repo ships a small placeholder so the page won’t 404.

## Folder layout

```
/assets/js/liquid.browser.min.js   # ← replace with real LiquidJS browser bundle
/assets/js/liquid-bootstrap.js     # runtime loader rendering templates to #app
/data/settings.json                # theme settings / sections mock
/data/products.json                # mock catalog to demo product cards
/templates/index.liquid            # demo home template
/templates/snippets/card-product.liquid
/index.html
```

## How it works

1. `index.html` loads the LiquidJS browser bundle **(you provide it)** and then `assets/js/liquid-bootstrap.js`.
2. `liquid-bootstrap.js` fetches `/data/*.json` + `/templates/index.liquid`, builds a Shopify‑like context (`shop`, `collections`, `routes`, `all_products`, `cart`) and renders the template into `#app`.
3. Includes/snippets are resolved from `/templates/snippets/*.liquid` via a custom LiquidJS FS adapter.

## Use with your Shopstic theme

1. **Copy your theme files** into this structure:
   - Put your **page template** as `/templates/index.liquid` (or adjust the bootstrap to point to another file).
   - Put **snippets** into `/templates/snippets/…` (keep filenames).
   - Copy your theme `/assets` (CSS, JS, fonts, images) into `/assets`. **Remove** Shopify‑specific JS (e.g., `Shopify.*`, `/cart.js`) and jQuery if not used.
2. **Data mapping:**
   - Convert your homepage section settings into `data/settings.json`. For collection/product loops, fill `data/products.json` and reference handles in `settings.collections.frontpage.products` (see the demo).
   - Replace `money_format`, `shop_name`, etc., with your data.
3. **Liquid objects to replace/mock:**
   - `product`, `collection`, `cart`, `routes`, `shop`, `all_products`, forms to `/cart` – provide static JSON or stub behaviors.
4. **GitHub Pages base path:**
   - If your site is at `user.github.io/repo`, keep paths **relative**. Optionally uncomment `<base href="./">` in `index.html`.
5. **Build nothing:** This approach needs **no Node build**. It renders entirely in the browser.

## Limitations / Tips

- Complex Shopify tags/filters not supported by LiquidJS will need to be simplified.
- Forms (`add to cart`, `search`) should be stubbed or wired to your own backend/serverless function.
- If your theme uses **Dawn-style `templates/*.json`**, you can either pre-compose those into a single Liquid page, or extend `liquid-bootstrap.js` to parse the JSON and stitch sections at runtime.

## Swapping in the real LiquidJS browser bundle

Build from the official repo and place the bundle at `/assets/js/liquid.browser.min.js`. The bundle should expose **`window.liquidjs.Liquid`** (preferred) or **`window.Liquid`**.

Once replaced, `index.html` → open in a browser (or GH Pages) and you should see the demo grid rendered. Then start replacing the demo templates/data with Shopstic’s.
