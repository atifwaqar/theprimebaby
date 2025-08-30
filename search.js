// search.js - simple client-side product search

document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('woocommerce-product-search-field-2738');
  const resultsWrap = document.querySelector('.search-results');
  const resultsContainer = document.getElementById('datafetch');
  if (!input || !resultsWrap || !resultsContainer) return;

  let products = [];
  try {
    const res = await fetch('./products.json', { cache: 'no-store' });
    products = await res.json();
  } catch (err) {
    console.error('Failed to load products.json', err);
  }

  function formatPrice(amount, currency) {
    try {
      const code = currency || 'PKR';
      const locale = code === 'PKR' ? 'en-PK' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
      }).format(amount / (code === 'PKR' ? 1 : 100));
    } catch (e) {
      return (currency || '') + ' ' + amount;
    }
  }

  function search(term) {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
      const categories = Array.isArray(p.categories) ? p.categories.join(' ').toLowerCase() : '';
      return name.includes(q) || tags.includes(q) || categories.includes(q);
    }).slice(0, 5);
  }

  function render(items) {
    if (!items.length) {
      resultsContainer.innerHTML = '<p>No products found</p>';
      return;
    }
    const html = items.map(p => `
      <a href="${p.url || '#'}" class="search-item">
        <span class="search-item-name">${p.name || ''}</span>
        <span class="search-item-price">${p.price ? formatPrice(p.price, p.currency) : ''}</span>
      </a>
    `).join('');
    resultsContainer.innerHTML = html;
  }

  input.addEventListener('input', () => {
    const term = input.value;
    if (!term.trim()) {
      resultsWrap.style.display = 'none';
      resultsContainer.innerHTML = '';
      return;
    }
    const items = search(term);
    render(items);
    resultsWrap.style.display = items.length ? 'block' : 'none';
  });

  document.addEventListener('click', (e) => {
    if (!resultsWrap.contains(e.target) && e.target !== input) {
      resultsWrap.style.display = 'none';
    }
  });
});
