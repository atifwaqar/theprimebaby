(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const jsonCache = {};
  async function loadJSON(url) {
    if (!jsonCache[url]) {
      const res = await fetch(url, {cache:'no-store'});
      if (!res.ok) throw new Error('Failed to load ' + url);
      jsonCache[url] = await res.json();
    }
    return jsonCache[url];
  }
  function renderTemplate(tpl, data) {
    let out = tpl;
    out = out.replace(/\{\{#each\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (m, key, inner) => {
      const arr = data[key];
      if (!Array.isArray(arr) || !arr.length) return '';
      return arr.map(item => inner.replace(/\{\{\s*this\s*\}\}/g, String(item))).join('');
    });
    out = out.replace(/\{\{#if_([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if_[a-zA-Z0-9_]+\}\}/g, (m, key, inner) => {
      return data[key] ? inner : '';
    });
    out = out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (m, key) => {
      const val = data[key];
      return (val === undefined || val === null) ? '' : String(val);
    });
    return out;
  }
  function formatPrice(value, currency) {
    if (currency === 'PKR') {
      try { return 'Rs ' + Number(value).toLocaleString('en-PK'); } catch (e) {}
      return 'Rs ' + value;
    }
    try { return new Intl.NumberFormat(undefined, { style:'currency', currency }).format(value); }
    catch { return currency + ' ' + value; }
  }
  function normalizeProduct(p) {
    const image = Array.isArray(p.images) && p.images.length ? p.images[0] : '';
    const url = p.url || (p.slug ? `product.html?slug=${encodeURIComponent(p.slug)}` : '#');
    const priceFormatted = formatPrice(p.price, p.currency || 'PKR');
    const compare = (typeof p.compare_at_price === 'number') && p.compare_at_price > (p.price || 0);
    const compareFormatted = compare ? formatPrice(p.compare_at_price, p.currency || 'PKR') : '';
    const badges = Array.isArray(p.badges) ? p.badges : [];
    return {
      ...p,
      title: p.name || p.slug || p.id || 'Product',
      image,
      url,
      price_formatted: priceFormatted,
      compare_at_price_formatted: compareFormatted,
      if_compare: compare,
      if_badges: badges && badges.length > 0,
      badges
    };
  }
  function sortLatest(products) {
    const haveDates = products.every(p => !!p.created_at);
    if (haveDates) return [...products].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return [...products].reverse();
  }
  function renderList(container, tplId, items, limit) {
    const tpl = qs('#' + tplId);
    if (!tpl) { container.innerHTML = '<!-- TODO: Missing template #' + tplId + ' -->'; return; }
    const html = items.slice(0, limit || items.length).map(item => renderTemplate(tpl.innerHTML, item)).join('');
    container.innerHTML = html || '<!-- Empty list -->';
  }
  async function initProductsGrid() {
    const grids = qsa('[data-products-grid]');
    if (!grids.length) return;
    // Default to products.json at repo root
    const defaultSrc = 'products.json';
    const srcs = new Set(grids.map(g => g.getAttribute('data-source') || defaultSrc));
    const sourceMap = {};
    for (const src of srcs) {
      try { sourceMap[src] = await loadJSON(src); } catch (e) { console.error(e); sourceMap[src] = []; }
    }
    grids.forEach(grid => {
      const src = grid.getAttribute('data-source') || defaultSrc;
      const all = Array.isArray(sourceMap[src]) ? sourceMap[src] : [];
      const templateId = grid.getAttribute('data-template') || 'product-card-template';
      const limit = parseInt(grid.getAttribute('data-limit') || '0', 10) || undefined;
      const filter = (grid.getAttribute('data-filter') || '').trim().toLowerCase();
      let items = all.map(normalizeProduct);
      if (filter === 'latest') items = sortLatest(items);
      renderList(grid, templateId, items, limit);
    });
  }
  if (typeof window !== 'undefined') {
    window.initProductsGrid = initProductsGrid;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsGrid);
  } else {
    initProductsGrid();
  }
})();
