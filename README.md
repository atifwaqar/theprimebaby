# theprimebaby – Static Theme Port
_Build time_: 2025-08-28T20:19:28.371441Z
## What this is
A static HTML/CSS/JS port built **only** from your installer ZIP. Liquid removed; Shopify/jQuery calls disabled.
- **Layout**: Derived from `layout/theme.liquid`.
## Pages generated
- `index.html` from `index.json`
- `product.html` from `product.json`
- `collections.html` from `collection.json`
- `cart.html` from `cart.json`
- `search.html` from `search.json`
- `blog.html` from `blog.json`
- `article.html` from `article.json`
- `collections-list.html` from `list-collections.json`
- `page.html` from `page.json`
- `products.html` from `sections/collection-list.liquid`

## Assets
- Mirrored to `/assets` exactly.

## JavaScript sanitization
Files with disabled lines:
- `assets/compare.js` — 9 line(s) disabled.
- `assets/countdown.js` — 1 line(s) disabled.
- `assets/customer.js` — 4 line(s) disabled.
- `assets/global.js` — 44 line(s) disabled.
- `assets/jquery-3.6.4.min.js` — 2 line(s) disabled.
- `assets/owl.carousel.min.js` — 4 line(s) disabled.
- `assets/product-model.js` — 3 line(s) disabled.
- `assets/quick-add.js` — 2 line(s) disabled.
- `assets/wishlist.js` — 9 line(s) disabled.

## Feature parity / Stubs
- Dynamic features (cart, predictive search, recommendations, variant selectors, accounts) are **stubbed/disabled**.

## GitHub Pages deploy
1. Push these files to a repo.
2. Settings → Pages → select branch and root `/`.
3. (Optional) add `CNAME` with your domain.
4. Keep relative paths like `./assets/...`.

## Anti-hallucination report
### Installer tree (top)
```
_porter_work_installer/
├─ assets/
│  ├─ arrow.svg
│  ├─ base.css
│  ├─ call.png
│  ├─ cart-drawer.js
│  ├─ cart-notification.js
│  ├─ cart.js
│  ├─ collage.css
│  ├─ collapsible-content.css
│  ├─ compare.js
│  ├─ component-accordion.css
│  ├─ component-article-card.css
│  ├─ component-card.css
│  ├─ component-cart-drawer.css
│  ├─ component-cart-items.css
│  ├─ component-cart-notification.css
│  ├─ component-cart.css
│  ├─ component-collection-hero.css
│  ├─ component-complementary-products.css
│  ├─ component-deferred-media.css
│  ├─ component-discounts.css
│  ├─ component-facets.css
│  ├─ component-image-with-text.css
│  ├─ component-list-menu.css
│  ├─ component-list-payment.css
│  ├─ component-list-social.css
│  ├─ component-loading-overlay.css
│  ├─ component-localization-form.css
│  ├─ component-mega-menu.css
│  ├─ component-menu-drawer.css
│  ├─ component-modal-video.css
│  ├─ component-model-viewer-ui.css
│  ├─ component-newsletter.css
│  ├─ component-pagination.css
│  ├─ component-pickup-availability.css
│  ├─ component-predictive-search.css
│  ├─ component-price.css
│  ├─ component-product-model.css
│  ├─ component-rating.css
│  ├─ component-search.css
│  ├─ component-show-more.css
│  ├─ component-slider.css
│  ├─ component-slideshow.css
│  ├─ component-totals.css
│  ├─ constants.js
│  ├─ countdown.js
│  ├─ customer.css
│  ├─ customer.js
│  ├─ details-disclosure.js
│  ├─ details-modal.js
│  ├─ facets.js
│  ├─ global.js
│  ├─ jquery-3.6.4.min.js
│  ├─ localization-form.js
│  ├─ location.png
│  ├─ logo-bar.css
│  ├─ magnify.js
│  ├─ mail.png
│  ├─ main-search.js
│  ├─ media-gallery.js
│  ├─ newsletter-section.css
│  ├─ owl.carousel.css
│  ├─ owl.carousel.min.js
│  ├─ password-modal.js
│  ├─ pickup-availability.js
│  ├─ predictive-search.js
│  ├─ product-form.js
│  ├─ product-info.js
│  ├─ product-modal.js
│  ├─ product-model.js
│  ├─ product_tab.css
│  ├─ pubsub.js
│  ├─ quick-add.css
│  ├─ quick-add.js
│  ├─ recipient-form.js
│  ├─ search-form.js
│  ├─ section-blog-post.css
│  ├─ section-collection-list.css
│  ├─ section-contact-form.css
│  ├─ section-email-signup-banner.css
│  ├─ section-featured-blog.css
│  ├─ section-featured-product.css
│  ├─ section-footer.css
│  ├─ section-image-banner.css
│  ├─ section-main-blog.css
│  ├─ section-main-page.css
│  ├─ section-main-product.css
│  ├─ section-mobile-menu.css
│  ├─ section-multicolumn.css
│  ├─ section-password.css
│  ├─ section-related-products.css
│  ├─ section-rich-text.css
│  ├─ section-service.css
│  ├─ section-subbanners.css
│  ├─ share.js
│  ├─ show-more.js
│  ├─ template-collection.css
│  ├─ template-giftcard.css
│  ├─ theme-editor.js
│  ├─ tm-notification-products.css
│  ├─ video-section.css
│  └─ wishlist.js
├─ config/
│  ├─ settings_data.json
│  └─ settings_schema.json
├─ layout/
│  ├─ password.liquid
│  └─ theme.liquid
├─ locales/
│  ├─ bg-BG.json
│  ├─ cs.json
│  ├─ cs.schema.json
│  ├─ da.json
│  ├─ da.schema.json
│  ├─ de.json
│  ├─ de.schema.json
│  ├─ el.json
│  ├─ en.default.json
│  ├─ en.default.schema.json
│  ├─ es.json
│  ├─ es.schema.json
│  ├─ fi.json
│  ├─ fi.schema.json
│  ├─ fr.json
│  ├─ fr.schema.json
│  ├─ hr-HR.json
│  ├─ hu.json
│  ├─ id.json
│  ├─ it.json
│  ├─ it.schema.json
│  ├─ ja.json
│  ├─ ja.schema.json
│  ├─ ko.json
│  ├─ ko.schema.json
│  ├─ lt-LT.json
│  ├─ nb.json
│  ├─ nb.schema.json
│  ├─ nl.json
│  ├─ nl.schema.json
│  ├─ pl.json
│  ├─ pl.schema.json
│  ├─ pt-BR.json
│  ├─ pt-BR.schema.json
│  ├─ pt-PT.json
│  ├─ pt-PT.schema.json
│  ├─ ro-RO.json
│  ├─ ru.json
│  ├─ sk-SK.json
│  ├─ sl-SI.json
│  ├─ sv.json
│  ├─ sv.schema.json
│  ├─ th.json
│  ├─ th.schema.json
│  ├─ tr.json
│  ├─ tr.schema.json
│  ├─ vi.json
│  ├─ vi.schema.json
│  ├─ zh-CN.json
│  ├─ zh-CN.schema.json
│  ├─ zh-TW.json
│  └─ zh-TW.schema.json
├─ sections/
│  ├─ announcement-bar.liquid
│  ├─ apps.liquid
│  ├─ cart-drawer.liquid
│  ├─ cart-icon-bubble.liquid
│  ├─ cart-live-region-text.liquid
│  ├─ cart-notification-button.liquid
│  ├─ cart-notification-product.liquid
│  ├─ collage.liquid
│  ├─ collapsible-content.liquid
│  ├─ collection-list.liquid
│  ├─ compare-template.liquid
│  ├─ contact-form.liquid
│  ├─ custom-liquid.liquid
│  ├─ email-signup-banner.liquid
│  ├─ featured-blog.liquid
│  ├─ featured-collection.liquid
│  ├─ featured-product.liquid
│  ├─ footer-group.json
│  ├─ footer.liquid
│  ├─ header-bottom.liquid
│  ├─ header-group.json
│  ├─ header-top.liquid
│  ├─ header.liquid
│  ├─ image-banner.liquid
│  ├─ image-with-text.liquid
│  ├─ logo-bar.liquid
│  ├─ main-404.liquid
│  ├─ main-account.liquid
│  ├─ main-activate-account.liquid
│  ├─ main-addresses.liquid
│  ├─ main-article.liquid
│  ├─ main-blog.liquid
│  ├─ main-cart-footer.liquid
│  ├─ main-cart-items.liquid
│  ├─ main-collection-banner.liquid
│  ├─ main-collection-product-grid.liquid
│  ├─ main-list-collections.liquid
│  ├─ main-login.liquid
│  ├─ main-order.liquid
│  ├─ main-page.liquid
│  ├─ main-password-footer.liquid
│  ├─ main-password-header.liquid
│  ├─ main-product.liquid
│  ├─ main-register.liquid
│  ├─ main-reset-password.liquid
│  ├─ main-search.liquid
│  ├─ mobile-menu.liquid
│  ├─ multicolumn.liquid
│  ├─ multirow.liquid
│  ├─ newsletter.liquid
│  ├─ page.liquid
│  ├─ pickup-availability.liquid
│  ├─ predictive-search.liquid
│  ├─ product-card-compare-template.liquid
│  ├─ product-card-template.liquid
│  ├─ product_tab.liquid
│  ├─ related-products.liquid
│  ├─ rich-text.liquid
│  ├─ service.liquid
│  ├─ slideshow.liquid
│  ├─ subbanner.liquid
│  ├─ tm-notification-products.liquid
│  ├─ video.liquid
│  └─ wishlist-template.liquid
├─ snippets/
│  ├─ article-card.liquid
│  ├─ button-wishlist-compare.liquid
│  ├─ buy-buttons.liquid
│  ├─ card-collection.liquid
│  ├─ card-product.liquid
│  ├─ cart-drawer.liquid
│  ├─ cart-notification.liquid
│  ├─ countdown.liquid
│  ├─ country-localization.liquid
│  ├─ email-signup-banner-background-mobile.liquid
│  ├─ email-signup-banner-background.liquid
│  ├─ facets.liquid
│  ├─ footer-call.liquid
│  ├─ footer-icon-account.liquid
│  ├─ footer-icon-home.liquid
│  ├─ footer-icon-shop.liquid
│  ├─ gift-card-recipient-form.liquid
│  ├─ icon-3d-model.liquid
│  ├─ icon-accordion.liquid
│  ├─ icon-account.liquid
│  ├─ icon-addcompare.liquid
│  ├─ icon-arrow.liquid
│  ├─ icon-call.liquid
│  ├─ icon-caret.liquid
│  ├─ icon-cart-empty.liquid
│  ├─ icon-cart.liquid
│  ├─ icon-checkmark.liquid
│  ├─ icon-clipboard.liquid
│  ├─ icon-clock.liquid
│  ├─ icon-close-small.liquid
│  ├─ icon-close.liquid
│  ├─ icon-cmcompare.liquid
│  ├─ icon-cmheart.liquid
│  ├─ icon-compare.liquid
│  ├─ icon-discount.liquid
│  ├─ icon-error.liquid
│  ├─ icon-facebook.liquid
│  ├─ icon-filter.liquid
│  ├─ icon-grid.liquid
│  ├─ icon-hamburger-menu.liquid
│  ├─ icon-hamburger.liquid
│  ├─ icon-home.liquid
│  ├─ icon-instagram.liquid
│  ├─ icon-list.liquid
│  ├─ icon-mail.liquid
│  ├─ icon-minus.liquid
│  ├─ icon-padlock.liquid
│  ├─ icon-pause.liquid
│  ├─ icon-pinterest.liquid
│  ├─ icon-play.liquid
│  ├─ icon-plus.liquid
│  ├─ icon-quickview.liquid
│  ├─ icon-remove.liquid
│  ├─ icon-select-option.liquid
│  ├─ icon-share.liquid
│  ├─ icon-snapchat.liquid
│  ├─ icon-solidheart.liquid
│  ├─ icon-store.liquid
│  ├─ icon-success.liquid
│  ├─ icon-tick.liquid
│  ├─ icon-tiktok.liquid
│  ├─ icon-tumblr.liquid
│  ├─ icon-twitter.liquid
│  ├─ icon-unavailable.liquid
│  ├─ icon-vimeo.liquid
│  ├─ icon-wishlist.liquid
│  ├─ icon-with-text.liquid
│  ├─ icon-youtube.liquid
│  ├─ icon-zoom.liquid
│  ├─ language-localization.liquid
│  ├─ live-view.liquid
│  ├─ meta-tags.liquid
│  ├─ pagination.liquid
│  ├─ price.liquid
│  ├─ product-card-compare.liquid
│  ├─ product-card-wishlist.liquid
│  ├─ product-media-gallery.liquid
│  ├─ product-media-modal.liquid
│  ├─ product-media.liquid
│  ├─ product-thumbnail.liquid
│  ├─ product-variant-options.liquid
│  ├─ product-variant-picker.liquid
│  ├─ share-button.liquid
│  ├─ sidecategory.liquid
│  ├─ social-icons.liquid
│  ├─ swatch-input.liquid
│  ├─ swatch.liquid
│  └─ tm-breadcrumbs.liquid
└─ templates/
   ├─ customers/
   │  ├─ account.json
   │  ├─ activate_account.json
   │  ├─ addresses.json
   │  ├─ login.json
   │  ├─ order.json
   │  ├─ register.json
   │  └─ reset_password.json
   ├─ 404.json
   ├─ article.json
   ├─ blog.json
   ├─ cart.json
   ├─ collection.json
   ├─ gift_card.liquid
   ├─ index.json
   ├─ list-collections.json
   ├─ page.compare.json
   ├─ page.contact.json
   ├─ page.json
   ├─ page.wishlist.json
   ├─ password.json
   ├─ product.card.json
   ├─ product.json
   └─ search.json
```
### Sections found
```
announcement-bar
apps
cart-drawer
cart-icon-bubble
cart-live-region-text
cart-notification-button
cart-notification-product
collage
collapsible-content
collection-list
compare-template
contact-form
custom-liquid
email-signup-banner
featured-blog
featured-collection
featured-product
footer
header
header-bottom
header-top
image-banner
image-with-text
logo-bar
main-404
main-account
main-activate-account
main-addresses
main-article
main-blog
main-cart-footer
main-cart-items
main-collection-banner
main-collection-product-grid
main-list-collections
main-login
main-order
main-page
main-password-footer
main-password-header
main-product
main-register
main-reset-password
main-search
mobile-menu
multicolumn
multirow
newsletter
page
pickup-availability
predictive-search
product-card-compare-template
product-card-template
product_tab
related-products
rich-text
service
slideshow
subbanner
tm-notification-products
video
wishlist-template
```
### Templates detected
```
index: json -> index.json
product: json -> product.json
collection: json -> collection.json
cart: json -> cart.json
search: json -> search.json
blog: json -> blog.json
article: json -> article.json
list-collections: json -> list-collections.json
page: json -> page.json
```
### JS lines disabled
```
assets/compare.js: 9 line(s)
assets/countdown.js: 1 line(s)
assets/customer.js: 4 line(s)
assets/global.js: 44 line(s)
assets/jquery-3.6.4.min.js: 2 line(s)
assets/owl.carousel.min.js: 4 line(s)
assets/product-model.js: 3 line(s)
assets/quick-add.js: 2 line(s)
assets/wishlist.js: 9 line(s)
```
