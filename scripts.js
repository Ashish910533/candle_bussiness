// Fallback product list (used when `fetch('products.json')` is blocked when opening via file://)
const FALLBACK_PRODUCTS = [
  {"id":1,"name":"Jasmine Bliss","price":499,"category":"scented","image":"🌸","slug":"jasmine-bliss","description":"Soft floral jasmine with calming notes."},
  {"id":2,"name":"Sandalwood Serenity","price":599,"category":"scented","image":"🌿","slug":"sandalwood-serenity","description":"Warm sandalwood, earthy and grounding."},
  {"id":3,"name":"Citrus Calm","price":449,"category":"scented","image":"🍋","slug":"citrus-calm","description":"Bright citrus to uplift your space."},
  {"id":4,"name":"Rose Garden","price":549,"category":"scented","image":"🌹","slug":"rose-garden","description":"Romantic rose fragrance with depth."},
  {"id":5,"name":"Lotus Sculpture","price":799,"category":"decorative","image":"🪷","slug":"lotus-sculpture","description":"Hand-moulded lotus-shaped decorative candle."},
  {"id":6,"name":"Om Symbol","price":699,"category":"decorative","image":"🕉️","slug":"om-symbol","description":"Decorative candle with Om motif."},
  {"id":7,"name":"Buddha Peace","price":899,"category":"decorative","image":"🧘","slug":"buddha-peace","description":"Meditative design inspired by serenity."},
  {"id":8,"name":"Diya Traditional","price":649,"category":"decorative","image":"🪔","slug":"diya-traditional","description":"Traditional diya-inspired candle for rituals."},
  {"id":9,"name":"Festival Joy Set","price":1299,"category":"gift","image":"🎁","slug":"festival-joy-set","description":"Curated festival gift set."},
  {"id":10,"name":"Luxury Collection","price":1999,"category":"gift","image":"💝","slug":"luxury-collection","description":"Premium luxury gift collection."},
  {"id":11,"name":"Wedding Blessing Set","price":1599,"category":"gift","image":"🌟","slug":"wedding-blessing-set","description":"Elegant set for weddings."},
  {"id":12,"name":"Wellness Trio","price":1149,"category":"gift","image":"✨","slug":"wellness-trio","description":"Three scents for relaxation and balance."}
];

let PRODUCTS = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', ()=>{
  initUI();
  loadProducts();
  updateCartCount();
});

function initUI(){
  const mobile = document.getElementById('mobileMenu');
  if(mobile){
    mobile.addEventListener('click', ()=>{
      const nav = document.getElementById('navLinks');
      if(nav) nav.classList.toggle('active');
    });
  }
  const cartBtn = document.getElementById('cartBtn');
  if(cartBtn) cartBtn.addEventListener('click', ()=>{ renderCart(); });
}

async function loadProducts(){
  try{
    const res = await fetch('products.json');
    if(!res.ok) throw new Error('Network response not ok');
    PRODUCTS = await res.json();
    renderProducts(PRODUCTS);
  }catch(e){
    console.warn('Failed to load products.json, falling back to embedded catalog.', e);
    PRODUCTS = FALLBACK_PRODUCTS.slice();
    renderProducts(PRODUCTS);
  }
}

function renderProducts(list){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  grid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">${p.image}</div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.price}</div>
        <div class="product-actions">
          <button class="btn btn-secondary" onclick="addToCart(${p.id})">Add to Cart</button>
          <button class="btn btn-primary" onclick="orderWhatsApp('${encodeURIComponent(p.name)}')">Order</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterProducts(cat){
  currentFilter = cat;
  if(cat === 'all') renderProducts(PRODUCTS);
  else renderProducts(PRODUCTS.filter(p=>p.category === cat));
  showPage('shop');
}

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  if(id === 'cart') renderCart();
}

function orderWhatsApp(item){
  const phone = '919084494147';
  const text = `Hi Samridhi Aroma Candles, I'd like to order: ${decodeURIComponent(item)}`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url,'_blank');
}

function getCart(){
  return JSON.parse(localStorage.getItem('cart')||'{}');
}

function saveCart(cart){
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id){
  const cart = getCart();
  cart[id] = (cart[id]||0) + 1;
  saveCart(cart);
  flashMessage('Added to cart');
}

function updateCartCount(){
  const cart = getCart();
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  const el = document.getElementById('cartCount');
  if(el) el.textContent = count;
}

function renderCart(){
  const container = document.getElementById('cartItems');
  if(!container) return;
  const cart = getCart();
  const ids = Object.keys(cart).map(k=>parseInt(k));
  if(ids.length === 0){ container.innerHTML = '<p>Your cart is empty.</p>'; return; }
  let html = '';
  let total = 0;
  ids.forEach(id=>{
    const qty = cart[id];
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    total += p.price * qty;
    html += `
      <div class="cart-item">
        <div style="font-size:2rem">${p.image}</div>
        <div style="flex:1">
          <div style="font-weight:700">${p.name}</div>
          <div>₹${p.price} x ${qty} = ₹${p.price*qty}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn btn-secondary" onclick="changeQty(${id},${qty-1})">-</button>
          <button class="btn btn-secondary" onclick="changeQty(${id},${qty+1})">+</button>
          <button class="btn" onclick="removeItem(${id})">Remove</button>
        </div>
      </div>
    `;
  });
  html += `<div style="margin-top:1rem" class="cart-summary"><strong>Total: ₹${total}</strong></div>`;
  container.innerHTML = html;
}

function changeQty(id, qty){
  const cart = getCart();
  if(qty <= 0){ delete cart[id]; }
  else cart[id] = qty;
  saveCart(cart);
  renderCart();
}

function removeItem(id){
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
  renderCart();
}

function proceedToCheckout(){
  showPage('checkout');
  renderCart();
}

function completeOrder(e){
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const summary = Object.fromEntries(data.entries());
  // In a real app we'd send this to server. Here we'll clear cart and show confirmation.
  localStorage.removeItem('cart');
  updateCartCount();
  alert('Thank you! Your order has been placed. We will contact you soon.');
  showPage('home');
}

function submitForm(e){
  e.preventDefault();
  alert('Thanks for contacting us — we will reply shortly.');
}

function flashMessage(msg){
  // small ephemeral message
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.right = '20px';
  el.style.bottom = '20px';
  el.style.background = 'var(--muted-gold)';
  el.style.padding = '0.6rem 1rem';
  el.style.borderRadius = '8px';
  el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1500);
}

// Ensure cart page re-renders when opened
document.addEventListener('click',(e)=>{
  if(e.target && e.target.closest && e.target.closest('[onclick^="showPage(\'cart\')"]')){
    renderCart();
  }
});
