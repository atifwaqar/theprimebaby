# theprimebaby – Static Theme Port (Fixed)
_Build time_: 2025-08-28T20:26:39.539073Z
Improvements:
- Removed `{% schema %}` blocks completely so JSON doesn’t print on the page.
- Dropped `{% style %}` blocks to avoid broken `%` values from Liquid math.
- Rewrote `asset_url`/`stylesheet_tag`/`script_tag` to local `./assets/...` paths.
- Removed empty preload/script tags to clear console errors.
- Liquid stripped from sections/snippets/layout; Shopify/jQuery-dependent features remain disabled.

Pages generated:
- index.html ← index.json
- product.html ← product.json
- collections.html ← collection.json
- cart.html ← cart.json
- search.html ← search.json
- blog.html ← blog.json
- article.html ← article.json
- collections-list.html ← list-collections.json
- page.html ← page.json
- products.html ← sections/featured-collection.liquid
