
const STORE = {
  currency: "PKR",
  lsCartKey: "cart_v1",
  async loadProducts(){
    const res = await fetch("data/products.json", {cache: "no-store"});
    if(!res.ok) throw new Error("Failed to load products.json");
    return await res.json();
  },
  formatPrice(paisa){
    // Treat numbers as PKR minor units (paisa); if you prefer whole PKR, store integers directly
    // Here our prices in JSON are whole PKR, so format without decimals.
    const n = Number(paisa);
    const formatter = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
    return formatter.format(n);
  },
  getCart(){
    try{
      const raw = localStorage.getItem(this.lsCartKey);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      console.warn("Cart parse error", e);
      return [];
    }
  },
  saveCart(cart){ localStorage.setItem(this.lsCartKey, JSON.stringify(cart)); },
  addToCart(item){
    const cart = this.getCart();
    const i = cart.findIndex(x => x.id === item.id);
    if(i>=0){ cart[i].qty += item.qty ?? 1; }
    else { cart.push({ id: item.id, title: item.title, price: item.price, image: item.image, qty: item.qty ?? 1 }); }
    this.saveCart(cart);
    this.renderCartBadge();
  },
  updateQty(id, qty){
    const cart = this.getCart().map(x => x.id===id ? {...x, qty: Math.max(1, qty)} : x);
    this.saveCart(cart);
    this.renderCartBadge();
  },
  removeFromCart(id){
    const cart = this.getCart().filter(x => x.id !== id);
    this.saveCart(cart);
    this.renderCartBadge();
  },
  clearCart(){ this.saveCart([]); this.renderCartBadge(); },
  cartTotals(){
    const cart = this.getCart();
    const subtotal = cart.reduce((s, x)=> s + x.price * x.qty, 0);
    return { subtotal, total: subtotal };
  },
  renderCartBadge(){
    const el = document.getElementById("cart-count");
    if(!el) return;
    const count = this.getCart().reduce((s,x)=> s + x.qty, 0);
    el.textContent = count;
  }
};

document.addEventListener("DOMContentLoaded", ()=> STORE.renderCartBadge());
