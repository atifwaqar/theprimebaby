/* mapper.js — tiny data binder for products, categories, and site copy */
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function tpl(html, data) {
    return html.replace(/\{\{\s*([\w.$\[\]-]+)\s*\}\}/g, (_, path) => {
      const val = path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);
      return val == null ? '' : String(val);
    });
  }

  function htmlToNodes(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content;
  }

  async function loadJSON(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  }

  function setText(el, val) {
    if (!el) return;
    el.textContent = val == null ? '' : String(val);
  }

  function bindSiteCopy(site) {
    qsa('[data-site-key]').forEach((el) => {
      const key = el.getAttribute('data-site-key');
      const val = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), site);
      if (val == null) return;
      if (el.tagName === 'TITLE') document.title = String(val);
      else setText(el, val);
    });

    // nav items (array)
    const navEl = qs('[data-nav]');
    if (navEl && Array.isArray(site?.nav?.items)) {
      navEl.innerHTML = '';
      const frag = document.createDocumentFragment();
      site.nav.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'list-menu__item';
        const a = document.createElement('a');
        a.className = 'list-menu__item link link--text focus-inset';
        a.href = item.url || '#';
        a.textContent = item.label || '';
        li.appendChild(a);
        frag.appendChild(li);
      });
      navEl.appendChild(frag);
    }
  }

  function formatPrice(amount, currency) {
    try {
      const code = currency || 'PKR';
      const locale = (code === 'PKR') ? 'en-PK' : 'en-US';
      return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount / (code === 'PKR' ? 1 : 100));
    } catch (e) {
      return (currency || '') + ' ' + amount;
    }
  }

  function renderList(containerOrSelector, templateId, items, limit) {
  const container = (typeof containerOrSelector === 'string') ? qs(containerOrSelector) : containerOrSelector;
  if (!container) return;
  let tplEl = document.getElementById(templateId);

  // Allow per-grid template override via data-template and local <template> elements.
  const gridTplId = container.getAttribute('data-template');
  if (gridTplId) {
    const el = document.getElementById(gridTplId);
    if (el) tplEl = el;
  }
  if (!tplEl) {
    // Try to find a <template> sibling/descendant if no global ID is given
    const localTpl = container.parentElement && container.parentElement.querySelector('template');
    if (localTpl) tplEl = localTpl;
  }
  if (!tplEl) return;
  const raw = tplEl.innerHTML;

  const frag = document.createDocumentFragment();
  (limit ? items.slice(0, limit) : items).forEach((item) => {
    frag.appendChild(htmlToNodes(tpl(raw, item)));
  });
  container.innerHTML = '';
  container.appendChild(frag);
});
    container.innerHTML = '';
    container.appendChild(frag);
  }

  async function main() {
    const [products, categories, site] = await Promise.all([
      loadJSON('./products.json').catch(() => []),
      loadJSON('./categories.json').catch(() => []),
      loadJSON('./site.json').catch(() => ({})),
    ]);

    bindSiteCopy(site || {});

    // normalize products for template placeholders
    const enrichedProducts = (Array.isArray(products) ? products : []).map((p) => ({
      ...p,
      url: p.url || '#',
      image: (Array.isArray(p.images) && p.images.length) ? p.images[0] : 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
      price_formatted: formatPrice(p.price, p.currency),
      handle: p.slug || p.id || ''
    }));

    const prodContainer = qs('[data-products-grid]');
    if (prodContainer) {
      const limit = parseInt(prodContainer.getAttribute('data-limit') || '0', 10) || undefined;
      renderList('[data-products-grid]', 'product-card-template', enrichedProducts, limit);
    }

    // categories
    const enrichedCats = (Array.isArray(categories) ? categories : []).map((c) => ({
      ...c,
      title: c.name,
      url: c.url || `#cat-${c.slug}`,
      image: c.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
    }));
    const catContainer = qs('[data-categories-grid]');
    if (catContainer) {
      const limit = parseInt(catContainer.getAttribute('data-limit') || '0', 10) || undefined;
      renderList('[data-categories-grid]', 'category-card-template', enrichedCats, limit);
    }
  }

  document.addEventListener('DOMContentLoaded', main);
})();

// Render every categories grid independently
qsa('[data-categories-grid]').forEach((grid) => {
  const limit  = parseInt(grid.getAttribute('data-limit') || '0', 10) || undefined;
  const tplId  = grid.getAttribute('data-template') || 'category-card-template';
  renderList(grid, tplId, (Array.isArray(categories) ? categories : []).map((c) => ({
    ...c,
    title: c.name || c.title || c.id,
    url: c.url || `#cat-${c.slug || c.id || ''}`,
    image: c.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
  })), limit);
});
