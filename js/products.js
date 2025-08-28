
async function renderFeaturedProducts(){
  const grid = document.getElementById("featured-grid");
  const products = await STORE.loadProducts();
  const featured = products.slice(0, 3);
  grid.innerHTML = featured.map(cardHtml).join("");
}

function clearSearch(){
  const q = document.getElementById("q");
  if(q){ q.value = ""; renderProductsPage(); }
}

async function renderProductsPage(){
  const grid = document.getElementById("products-grid");
  const q = document.getElementById("q");
  const term = (q?.value || "").toLowerCase().trim();

  const products = await STORE.loadProducts();
  const filtered = term ? products.filter(p =>
    p.title.toLowerCase().includes(term) ||
    p.description.toLowerCase().includes(term) ||
    (p.tags||[]).join(" ").toLowerCase().includes(term)
  ) : products;

  if(q){ q.oninput = () => renderProductsPage(); }

  grid.innerHTML = filtered.map(cardHtml).join("");
}

function cardHtml(p){
  const price = STORE.formatPrice(p.price);
  const img = (p.images && p.images[0]) || "assets/img/placeholder.png";
  return `
  <article class="product-card card">
    <a class="imgbox" href="product.html?id=${encodeURIComponent(p.id)}">
      <img src="${img}" alt="${escapeHtml(p.title)}">
    </a>
    <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h3>
    <p>${escapeHtml(p.description)}</p>
    <div class="price">${price}</div>
    <div class="controls">
      <button class="btn" onclick='location.href="product.html?id=${encodeURIComponent(p.id)}"'>View</button>
      <button class="btn btn-primary" onclick='STORE.addToCart({id:"${p.id}", title:"${escapeAttr(p.title)}", price:${p.price}, image:"${img}"})'>Add</button>
    </div>
  </article>`;
}

function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function escapeAttr(s){ return (s||"").replace(/"/g, '&quot;'); }
