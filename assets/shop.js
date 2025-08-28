
// Simple store utilities
const Store = (() => {
  const KEY = 'cart.v1';
  async function loadProducts(){
    const res = await fetch('products.json?_=' + Date.now());
    return await res.json();
  }
  function getCart(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; }
  }
  function setCart(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    updateCartBadge();
  }
  function addToCart(id, qty=1){
    const cart = getCart();
    const i = cart.findIndex(x => x.id === id);
    if(i >= 0) cart[i].qty += qty;
    else cart.push({id, qty});
    setCart(cart);
  }
  function removeFromCart(id){
    setCart(getCart().filter(x => x.id !== id));
  }
  function updateQty(id, qty){
    const cart = getCart();
    const i = cart.findIndex(x => x.id === id);
    if(i >= 0){
      cart[i].qty = Math.max(1, qty|0);
      setCart(cart);
    }
  }
  function cartCount(){
    return getCart().reduce((a,b)=>a + (b.qty||0), 0);
  }
  function formatCurrency(amount, currency='PKR'){
    try{ return amount.toLocaleString('en-PK') + ' ' + currency; }catch(e){ return `${amount} ${currency}`; }
  }
  function composeOrderMessage({items, products, name, phone, address, notes}){
    let lines = [];
    lines.push(`New order from ${name||'N/A'} (${phone||'N/A'})`);
    lines.push(`Address: ${address||'N/A'}`);
    lines.push('');
    let total = 0;
    items.forEach(it => {
      const p = products.find(x => x.id === it.id);
      if(!p) return;
      const line = (p.price * it.qty);
      total += line;
      lines.push(`• ${p.title}  x${it.qty}  @ ${p.price} = ${line}`);
    });
    lines.push('');
    lines.push(`Total: ${total}`);
    if(notes) { lines.push(''); lines.push('Notes: ' + notes); }
    return lines.join('%0A'); // URL-encoded newline
  }
  function updateCartBadge(){
    const el = document.querySelector('[data-cart-count]');
    if(el) el.textContent = cartCount();
  }
  // Shared header injection
  function injectHeader(){
    if(document.getElementById('site-header')) return;
    const wrap = document.createElement('div');
    wrap.id = 'site-header';
    wrap.className = 'site-header';
    wrap.innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html">My Shop</a>
        <nav class="nav">
          <a href="products.html">Products</a>
          <a href="cart.html" class="btn secondary">Cart <span class="badge" data-cart-count>0</span></a>
        </nav>
      </div>`;
    document.body.prepend(wrap);
    updateCartBadge();
  }

  return { loadProducts, getCart, setCart, addToCart, removeFromCart, updateQty, cartCount, formatCurrency, composeOrderMessage, injectHeader, updateCartBadge };
})();

// Page initializers
async function initProductsPage(){
  Store.injectHeader();
  const grid = document.getElementById('grid');
  const search = document.getElementById('search');
  const category = document.getElementById('category');
  const sort = document.getElementById('sort');
  const products = await Store.loadProducts();
  // Build categories
  const cats = Array.from(new Set(products.map(p => p.category || 'Uncategorized'))).sort();
  category.innerHTML = '<option value="">All categories</option>' + cats.map(c=>`<option>${c}</option>`).join('');

  function apply(){
    const q = (search.value||'').toLowerCase();
    const cat = category.value;
    const order = sort.value;
    let list = products.filter(p => 
      (!cat || (p.category||'Uncategorized') === cat) &&
      (p.title.toLowerCase().includes(q) || (p.tags||[]).join(' ').toLowerCase().includes(q))
    );
    if(order === 'price-asc') list.sort((a,b)=>a.price-b.price);
    if(order === 'price-desc') list.sort((a,b)=>b.price-a.price);
    if(order === 'newest') list.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
    render(list);
  }

  function render(items){
    grid.innerHTML = items.map(p => `
      <article class="card">
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <img src="${p.image}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover"/>
        </a>
        <div class="pad">
          <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${p.title}</a></h3>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">${Store.formatCurrency(p.price, p.currency||'PKR')}</span>
            <button class="btn" onclick="Store.addToCart('${p.id}',1);this.textContent='Added';setTimeout(()=>this.textContent='Add',1000)">Add</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  [search, category, sort].forEach(el => el && el.addEventListener('input', apply));
  apply();
}

async function initProductPage(){
  Store.injectHeader();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const products = await Store.loadProducts();
  const p = products.find(x => x.id === id) || products[0];

  const main = document.getElementById('product');
  if(!p){ main.innerHTML = '<p>Product not found.</p>'; return; }

  main.innerHTML = `
    <div class="container">
      <div style="display:grid;grid-template-columns:1fr;gap:24px;align-items:start">
        <div class="card"><img src="${p.image}" alt="${p.title}" style="width:100%;height:auto;"/></div>
        <div>
          <h1 style="margin:0 0 10px 0">${p.title}</h1>
          <div style="font-size:20px;margin-bottom:10px">${Store.formatCurrency(p.price, p.currency||'PKR')}</div>
          <p style="color:#444">${p.description || ''}</p>
          <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
            <input id="qty" type="number" value="1" min="1" style="width:90px"/>
            <button class="btn" id="addBtn">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('addBtn').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('qty').value || '1', 10);
    Store.addToCart(p.id, qty);
  });
}

async function initCartPage(){
  Store.injectHeader();
  const products = await Store.loadProducts();
  const cart = Store.getCart();
  const table = document.getElementById('cart-table');
  const summary = document.getElementById('summary');

  function line(p, it){
    return (p.price * it.qty);
  }
  function render(){
    const items = Store.getCart();
    if(items.length === 0){
      table.innerHTML = '<p>Your cart is empty.</p>';
      summary.innerHTML = '';
      return;
    }
    let total = 0;
    table.innerHTML = `
      <table class="table">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead>
        <tbody>
          ${items.map(it => {
            const p = products.find(x => x.id === it.id);
            if(!p) return '';
            const l = line(p, it); total += l;
            return `
              <tr>
                <td><div style="display:flex;gap:10px;align-items:center">
                  <img src="${p.image}" alt="${p.title}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--border)"/>
                  <a href="product.html?id=${encodeURIComponent(p.id)}">${p.title}</a>
                </div></td>
                <td><input type="number" min="1" value="${it.qty}" style="width:80px" onchange="(function(v){ Store.updateQty('${it.id}', parseInt(v.value||'1',10)); render(); })(this)"></td>
                <td>${Store.formatCurrency(p.price, p.currency||'PKR')}</td>
                <td>${Store.formatCurrency(l, p.currency||'PKR')}</td>
                <td><button class="btn secondary" onclick="Store.removeFromCart('${it.id}'); render();">Remove</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    summary.innerHTML = `
      <div class="summary">
        <h3 style="margin:0 0 10px 0">Order Summary</h3>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span>Subtotal</span><strong>${Store.formatCurrency(total)}</strong>
        </div>
        <p style="color:#555;font-size:13px">Taxes and shipping calculated at checkout.</p>
        <div class="field">
          <label>Your name</label>
          <input id="name" type="text" placeholder="Full name">
        </div>
        <div class="field">
          <label>Phone (WhatsApp preferred)</label>
          <input id="phone" type="text" placeholder="+92XXXXXXXXXX or +46...">
        </div>
        <div class="field">
          <label>Address</label>
          <textarea id="address" rows="3" placeholder="Street, city, country"></textarea>
        </div>
        <div class="field">
          <label>Notes</label>
          <textarea id="notes" rows="2" placeholder="Any delivery instructions"></textarea>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap">
          <a id="whats" class="btn">Checkout via WhatsApp</a>
          <a id="email" class="btn secondary">Email Order</a>
        </div>
      </div>
    `;
    // Build checkout links
    const name = encodeURIComponent(document.getElementById('name').value || '');
    const phone = encodeURIComponent(document.getElementById('phone').value || '');
    const address = encodeURIComponent(document.getElementById('address').value || '');
    const notes = encodeURIComponent(document.getElementById('notes').value || '');
    const msg = Store.composeOrderMessage({items: Store.getCart(), products, name, phone, address, notes});
    const whatsappNumber = '';// put your receiving number here, like '923001234567'
    const wa = `https://wa.me/${whatsappNumber}?text=${msg}`;
    document.getElementById('whats').setAttribute('href', wa);
    const mailto = `mailto:orders@example.com?subject=New%20Order&body=${msg}`;
    document.getElementById('email').setAttribute('href', mailto);
  }

  // Rebuild links when user updates fields
  document.addEventListener('input', (e)=>{
    if(['name','phone','address','notes'].includes(e.target.id)){
      render();
    }
  });

  render();
}

// Auto-run page initializers by data-page attribute on <body>
document.addEventListener('DOMContentLoaded', () => {
  Store.injectHeader();
  const page = document.body && document.body.getAttribute('data-page');
  if(page === 'products') initProductsPage();
  if(page === 'product') initProductPage();
  if(page === 'cart') initCartPage();
  Store.updateCartBadge();
});
