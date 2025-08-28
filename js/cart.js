
function renderCart(){
  const list = document.getElementById("cart-list");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");

  const cart = STORE.getCart();
  if(cart.length === 0){
    list.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    list.innerHTML = cart.map(itemHtml).join("");
  }

  const {subtotal, total} = STORE.cartTotals();
  subtotalEl.textContent = STORE.formatPrice(subtotal);
  totalEl.textContent = STORE.formatPrice(total);

  wireCheckout(cart, total);
}

function itemHtml(x){
  return `
    <div class="cart-item">
      <img src="${x.image || "assets/img/placeholder.png"}" alt="">
      <div>
        <div><strong>${escapeHtml(x.title)}</strong></div>
        <div class="muted">${STORE.formatPrice(x.price)}</div>
        <button class="btn" onclick="STORE.removeFromCart('${x.id}'); renderCart();">Remove</button>
      </div>
      <div class="qty">
        <button onclick="STORE.updateQty('${x.id}', Math.max(1, getQty('${x.id}')-1)); renderCart();">-</button>
        <span id="q_${x.id}">${x.qty}</span>
        <button onclick="STORE.updateQty('${x.id}', getQty('${x.id}')+1); renderCart();">+</button>
      </div>
    </div>
  `;
}

function getQty(id){
  const el = document.getElementById("q_"+id);
  return el ? Number(el.textContent) : 1;
}

function wireCheckout(cart, total){
  const waBtn = document.getElementById("whatsapp-checkout");
  const emailBtn = document.getElementById("email-checkout");

  const lines = cart.map(c => `• ${c.title} × ${c.qty} — ${STORE.formatPrice(c.price*c.qty)}`);
  const summary = lines.join("%0A");
  const grand = encodeURIComponent("Total: " + STORE.formatPrice(total));
  const subject = encodeURIComponent("Order Request from Your Store");
  const body = encodeURIComponent(`Hello,%0A%0AI'd like to order:%0A${lines.join("%0A")}%0A%0A${"Total: " + STORE.formatPrice(total)}%0A%0AName:%0APhone:%0AAddress:`);

  // Replace with your WhatsApp number in international format without '+' e.g., 923001234567
  const whatsappNumber = "923001234567";

  waBtn.onclick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${summary}%0A%0A${grand}`;
    window.open(url, "_blank");
  };

  // Replace with your store email
  const storeEmail = "orders@example.com";
  emailBtn.href = `mailto:${storeEmail}?subject=${subject}&body=${body}`;
}

function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});
