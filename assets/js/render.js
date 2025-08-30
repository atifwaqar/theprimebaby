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
  li.className = 'product type-product status-publish has-post-thumbnail';

  const wrap = document.createElement('div');
  wrap.className = 'cz_product_grid product-wrapper';
  li.appendChild(wrap);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'product-image';
  wrap.appendChild(imgWrap);

  const a = document.createElement('a');
  a.className = 'woocommerce-LoopProduct-link woocommerce-loop-product__link';
  a.href = url;
  imgWrap.appendChild(a);

  const img = document.createElement('img');
  img.src = image;
  img.alt = title;
  img.loading = 'lazy';
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
    imgWrap.appendChild(badgeWrap);
  }

  const info = document.createElement('div');
  info.className = 'product-info';
  wrap.appendChild(info);

  const h3 = document.createElement('h3');
  h3.className = 'woocommerce-loop-product__title';
  info.appendChild(h3);

  const titleLink = document.createElement('a');
  titleLink.href = url;
  titleLink.textContent = title;
  h3.appendChild(titleLink);

  const price = document.createElement('span');
  price.className = 'price';
  info.appendChild(price);

  if (compare) {
    const del = document.createElement('del');
    del.className = 'compare-at';
    del.textContent = formatPrice(product.compare_at_price);
    price.appendChild(del);
  }

  const ins = document.createElement('ins');
  ins.className = 'current';
  ins.textContent = formatPrice(product.price);
  price.appendChild(ins);

  return li;
}
