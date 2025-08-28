# Static Site from "Shopstic" Package (Shopify theme)

This static export was auto-built from the `Shopstic-Installer.zip` contents found in your package.

## What you get
- `/index.html` assembled from `layout/theme.liquid`, homepage sections defined in `templates/index.json`, and common header/footer sections (Liquid removed).
- `/assets/` copied from the theme assets (CSS/JS/images/fonts). Linked CSS/JS are auto-included.

## Notes & limitations
- Shopify Liquid (`{{ }}`, `{% %}`) has been **stripped**, so dynamic data, loops, and settings won't render.
- Some components rely on Shopify's runtime (cart, product forms, localization, routes). Those are not present in this static build.
- You can now host this on GitHub Pages and progressively enhance with your own JS (e.g., a JSON product catalog and cart in LocalStorage).

## Next steps
1. Open `index.html` to see the base layout. Clean up any empty placeholders left by Liquid removal.
2. Add additional pages by copying `index.html` and replacing the `<main>` content.
3. Wire your products using a `products.json` + a simple JS renderer (I can scaffold this if you’d like).

Auto-detected sections included: 15
Assets copied: 101


---
### Included scaffold
- `products.json` (sample data, PKR)
- `products.html` (client-side grid renderer)
