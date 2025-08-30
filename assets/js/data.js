
(function(){
  const PRODUCTS_URL = (window.__DATA_PRODUCTS_URL__) || (new URL('products.json', document.baseURI)).toString();
  const CATEGORIES_URL = (window.__DATA_CATEGORIES_URL__) || (new URL('categories.json', document.baseURI)).toString();

  const _cache = { products: null, categories: null };

  async function loadJSON(url){
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('Failed to load '+url);
    return await res.json();
  }

  async function loadProducts(){
    if(_cache.products) return _cache.products;
    const items = await loadJSON(PRODUCTS_URL);
    _cache.products = items.map(x => ({
      id: x.id || x.slug || x.sku || String(Math.random()).slice(2),
      slug: x.slug || (x.id ? String(x.id) : null),
      name: x.name || x.title || 'Untitled',
      images: Array.isArray(x.images) ? x.images : (x.image ? [x.image] : []),
      price: Number(x.price || 0),
      currency: x.currency || 'PKR',
      categories: Array.isArray(x.categories) ? x.categories : [],
      tags: (Array.isArray(x.tags) ? x.tags : []).map(t => String(t).toLowerCase()),
      url: x.url || null,
      brand: x.brand || '',
      inStock: (typeof x.inStock === 'boolean') ? x.inStock : true,
      sku: x.sku || ''
    }));
    return _cache.products;
  }

  async function loadCategories(){
    if(_cache.categories) return _cache.categories;
    const cats = await loadJSON(CATEGORIES_URL);
    _cache.categories = Array.isArray(cats) ? cats : [];
    return _cache.categories;
  }

  function findBySlug(list, slug){
    slug = String(slug || '').trim().toLowerCase();
    return (list || []).find(p => String(p.slug||'').toLowerCase() === slug) || null;
  }

  function byTag(list, tag){
    tag = String(tag||'').toLowerCase();
    return (list||[]).filter(p => (p.tags||[]).includes(tag));
  }

  function byCategory(list, cat){
    cat = String(cat||'').toLowerCase();
    return (list||[]).filter(p => (p.categories||[]).map(String).map(s=>s.toLowerCase()).includes(cat));
  }

  function search(list, q){
    q = String(q||'').trim().toLowerCase();
    if(!q) return [];
    return (list||[]).filter(p => {
      const hay = [
        p.name, p.brand, p.sku, ...(p.tags||[]), ...(p.categories||[])
      ].filter(Boolean).map(s => String(s).toLowerCase()).join(' | ');
      return hay.includes(q);
    });
  }

  window.DataAPI = { loadProducts, loadCategories, findBySlug, byTag, byCategory, search };
})();
