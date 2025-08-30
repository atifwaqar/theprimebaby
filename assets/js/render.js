export function renderProductCard(product) {
  const currency = product.currency || 'PKR';
  const title = product.name || product.title || product.slug || product.id || 'Product';
  const url = product.url || (product.slug ? `product.html?slug=${encodeURIComponent(product.slug)}` : '#');
  const image = Array.isArray(product.images) && product.images.length ? product.images[0] : '';
  const compare = typeof product.compare_at_price === 'number' && product.compare_at_price > (product.price || 0);
  const formatPrice = value => {
    if (currency === 'PKR') {
      try { return 'Rs ' + Number(value).toLocaleString('en-PK'); } catch (e) { return 'Rs ' + value; }
    }
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value); }
    catch { return currency + ' ' + value; }
  };

  const li = document.createElement('li');
  li.className = 'entry content-bg loop-entry product type-product status-publish has-post-thumbnail cart-button-1 action-style-default product-hover-style1 image-hover-icon hover-right splide__slide';

  const thumb = document.createElement('div');
  thumb.className = 'product-thumbnail';
  li.appendChild(thumb);

  if (compare) {
    const sale = document.createElement('div');
    sale.className = 'product-onsale';
    const s = document.createElement('span');
    s.className = 'onsale';
    const pct = Math.round((1 - (product.price || 0) / product.compare_at_price) * 100);
    s.textContent = pct ? `-${pct}%` : 'Sale';
    const sr = document.createElement('span');
    sr.className = 'screen-reader-text';
    sr.textContent = 'Product on sale';
    sale.appendChild(s);
    sale.appendChild(sr);
    thumb.appendChild(sale);
  }

  const a = document.createElement('a');
  a.className = 'woocommerce-loop-image-link woocommerce-LoopProduct-link woocommerce-loop-product__link';
  a.href = url;
  a.setAttribute('aria-label', title);
  thumb.appendChild(a);

  const img = document.createElement('img');
  img.src = image;
  img.alt = title;
  img.loading = 'lazy';
  img.className = 'attachment-woocommerce_thumbnail size-woocommerce_thumbnail';
  a.appendChild(img);

  if (Array.isArray(product.badges) && product.badges.length) {
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'product-badges';
    product.badges.forEach(b => {
      const span = document.createElement('span');
      span.className = `badge badge-${b}`;
      span.textContent = b;
      badgeWrap.appendChild(span);
    });
    thumb.appendChild(badgeWrap);
  }

  const details = document.createElement('div');
  details.className = 'woocommerce-product-details';
  li.appendChild(details);

  const h2 = document.createElement('h2');
  h2.className = 'woocommerce-loop-product__title';
  details.appendChild(h2);

  const titleLink = document.createElement('a');
  titleLink.href = url;
  titleLink.textContent = title;
  h2.appendChild(titleLink);

  const price = document.createElement('span');
  price.className = 'price';
  details.appendChild(price);

  if (compare) {
    const del = document.createElement('del');
    const delSpan = document.createElement('span');
    delSpan.className = 'woocommerce-Price-amount amount';
    delSpan.textContent = formatPrice(product.compare_at_price);
    del.appendChild(delSpan);
    price.appendChild(del);
  }

  const ins = document.createElement('ins');
  const insSpan = document.createElement('span');
  insSpan.className = 'woocommerce-Price-amount amount';
  insSpan.textContent = formatPrice(product.price);
  ins.appendChild(insSpan);
  price.appendChild(ins);

  return li;
}
