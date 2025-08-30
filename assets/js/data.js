let _cache = null;

export async function loadProducts(path) {
  // Prefer the same path used by Latest Products in this codebase.
  const url = path || 'products.json';
  if (_cache) return _cache;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  _cache = Array.isArray(data) ? data : (data.products || []);
  _cache.forEach(p => {
    p.badges = Array.isArray(p.badges) ? p.badges : [];
    p.tags = Array.isArray(p.tags) ? p.tags : [];
    p.categories = Array.isArray(p.categories) ? p.categories : [];
    p.images = Array.isArray(p.images) ? p.images : [];
  });
  return _cache;
}

export function filterByBadge(arr, badge) {
  return (arr || []).filter(p => (p.badges || []).includes(badge));
}

export function getLatest(arr, n = 8) {
  return [...(arr || [])]
    .sort((a,b) => (Date.parse(b.created_at||0)||0) - (Date.parse(a.created_at||0)||0))
    .slice(0, n);
}
