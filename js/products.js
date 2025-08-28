
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
  <div class="card-wrapper product-card-wrapper">
    <div class="card card--product">
      <div class="card__inner color-background-2 gradient ratio">
        <div class="card__media">
          <div class="media media--transparent media--portrait">
            <a href="product.html?id=${encodeURIComponent(p.id)}" class="full-unstyled-link">
              <img class="motion-reduce" src="${img}" alt="${escapeHtml(p.title)}" loading="lazy">
            </a>
          </div>
        </div>
        <div class="card__content">
          <div class="card__information">
            <h3 class="card__heading h5">
              <a href="product.html?id=${encodeURIComponent(p.id)}" class="full-unstyled-link">${escapeHtml(p.title)}</a>
            </h3>
            <div class="card-information">
              <span class="price-item price-item--regular">${price}</span>
            </div>
          </div>
          <div class="quick-add no-js-hidden">
            <button class="btn btn--primary" onclick='STORE.addToCart({id:"${p.id}", title:"${escapeAttr(p.title)}", price:${p.price}, image:"${img}"})'>Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function escapeAttr(s){ return (s||"").replace(/"/g, '&quot;'); }
