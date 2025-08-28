
async function renderProduct(){
  const container = document.getElementById("product-detail");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const products = await STORE.loadProducts();
  const p = products.find(x => x.id === id) || products[0];
  if(!p){
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }
  const images = p.images && p.images.length ? p.images : ["assets/img/placeholder.png"];
  const price = STORE.formatPrice(p.price);
  container.innerHTML = `
    <div class="pdp-images card">
      <div class="main-img"><img id="mainImg" src="${images[0]}" alt="${escapeHtml(p.title)}"></div>
      <div class="thumb-row">
        ${images.map(src => `<div class="thumb" onclick="document.getElementById('mainImg').src='${src}'"><img src="${src}" alt=""></div>`).join("")}
      </div>
    </div>
    <div class="card">
      <h1>${escapeHtml(p.title)}</h1>
      <div class="price">${price}</div>
      <p>${escapeHtml(p.description)}</p>
      <div style="display:flex;gap:.5rem;margin-top:1rem">
        <button class="btn" onclick='STORE.addToCart({id:"${p.id}", title:"${escapeAttr(p.title)}", price:${p.price}, image:"${images[0]}"})'>Add to Cart</button>
        <a class="btn btn-primary" href="cart.html">Go to Cart</a>
      </div>
    </div>
  `;
}
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function escapeAttr(s){ return (s||"").replace(/"/g, '&quot;'); }

document.addEventListener("DOMContentLoaded", renderProduct);
