
# Static Shop Starter (Pure HTML/CSS/JS)

A **self-contained static storefront** you can host on **GitHub Pages**.
- No Shopify/WordPress/Liquid/jQuery
- Products loaded from `data/products.json`
- Cart stored in `localStorage`
- Checkout handoff via **WhatsApp** and **Email** (Stripe can be added later with a serverless function)

## File structure

```
static-shop-starter/
├─ index.html          # Home + featured products
├─ products.html       # Product listing with search
├─ product.html        # Product detail page (via URL param ?id=...)
├─ cart.html           # Cart page with quantity, remove, totals, checkout handoffs
├─ css/styles.css
├─ js/store.js         # Data + cart utilities
├─ js/products.js      # Listing UI
├─ js/product.js       # Detail UI
├─ js/cart.js          # Cart page logic + handoff
├─ data/products.json  # Your catalog (edit this!)
└─ assets/img/*        # Your images (replace placeholders)
```

## Customize

- Update **store name** in `<header>` and page titles.
- Replace **WhatsApp number** in `js/cart.js` (`whatsappNumber`).
- Replace **store email** in `js/cart.js` (`storeEmail`).
- Replace product images under `assets/img/` and edit `data/products.json` with your real products.
- Colors and spacing are in `css/styles.css`.

## Local testing

Just open `index.html` directly for a quick preview, or run a simple static server:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080/

## Deploy to GitHub Pages

1. Create a new repo (or use existing). Drag & drop **all files** in this folder into the repo root.
2. Commit and push.
3. In repo **Settings → Pages**, set **Branch** = `main` (or `master`) and root `/`.
4. Your site will be live at `https://<username>.github.io/<repo>/`.

To use a custom domain:
- Add your domain's DNS **CNAME** to point to `<username>.github.io`
- In the repo root, create a file named `CNAME` containing only your domain (e.g. `shop.example.com`)

## Notes

- Prices are formatted in **PKR** with no decimals. Adjust as needed.
- No backend required. To add Stripe later, use serverless (Netlify Functions, Cloudflare Workers, etc.).
- This starter intentionally avoids any Shopify or WordPress code.
