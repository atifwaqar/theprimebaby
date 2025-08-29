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

  function renderList(containerSel, templateId, items, limit) {
    const container = qs(containerSel);
    const tplEl = document.getElementById(templateId);
    if (!container || !tplEl) return;
    const raw = tplEl.innerHTML;
    const frag = document.createDocumentFragment();
    (limit ? items.slice(0, limit) : items).forEach((item) => {
      frag.appendChild(htmlToNodes(tpl(raw, item)));
    });
    container.innerHTML = '';
    container.appendChild(frag);
  }

  
function isOnSale(p) {
  return p.compare_at_price != null && p.compare_at_price > p.price;
}

function selectProducts(all, filterStr) {
  if (!filterStr) return all;
  const [key, rawVal] = filterStr.split(':');
  const val = rawVal?.trim();

  switch (key) {
    case 'badge':
      return all.filter(p => (p.badges || []).includes(val));
    case 'category':
      return all.filter(p => (p.categories || []).includes(val));
    case 'tag':
      return all.filter(p => (p.tags || []).includes(val));
    case 'sale':
      return all.filter(isOnSale);
    case 'latest': {
      const days = parseInt(val || '30', 10);
      const cutoff = Date.now() - days * 864e5;
      return all.filter(p => p.created_at && new Date(p.created_at).getTime() >= cutoff);
    }
    default:
      return all;
  }
}

function sortProducts(items, sortStr) {
  switch (sortStr) {
    case 'newest':
      return items.sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0));
    case 'price-asc':
      return items.sort((a,b) => a.price - b.price);
    case 'price-desc':
      return items.sort((a,b) => b.price - a.price);
    default:
      return items;
  }
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
  compare_at_price_formatted: isOnSale(p) ? formatPrice(p.compare_at_price, p.currency) : ""
}));

    // Render every products grid independently
qsa('[data-products-grid]').forEach((grid) => {
  const filter = grid.getAttribute('data-filter'); // e.g., "badge:featured", "sale", "category:skincare"
  const sort   = grid.getAttribute('data-sort');   // e.g., "newest", "price-asc"
  const limit  = parseInt(grid.getAttribute('data-limit') || '0', 10) || undefined;

  let items = selectProducts(enrichedProducts, filter);
  items = sortProducts(items, sort);

  renderList('[data-products-grid]', 'product-card-template', items, limit);
});

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