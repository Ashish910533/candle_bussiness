/* ============================================
   SAMRIDDHI AROMA CANDLES - JAVASCRIPT
   ============================================ */

// Product management
let allProducts = [];
let filteredProducts = [];

// Cart management
let cart = [];

// Load cart from localStorage on page load
function loadCart() {
  const savedCart = localStorage.getItem('samridhiCart');
  cart = savedCart ? JSON.parse(savedCart) : [];
  updateCartUI();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('samridhiCart', JSON.stringify(cart));
  updateCartUI();
}

// Add item to cart
function addToCart(productId, quantity = 1) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const cartItem = cart.find(item => item.id === productId);

  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  saveCart();
  closeModal('quickViewModal');
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

// Update cart item quantity
function updateCartQuantity(productId, quantity) {
  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      cartItem.quantity = quantity;
      saveCart();
    }
  }
}

// Calculate discount for a product
function getProductDiscount(quantity) {
  if (quantity > 5) {
    return 0.15; // 15% discount for more than 5 items
  }
  return 0;
}

// Calculate total price with discount
function calculateCartTotal() {
  let subtotal = 0;
  let totalDiscount = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const discount = getProductDiscount(item.quantity);
    if (discount > 0) {
      totalDiscount += itemTotal * discount;
    }
  });

  const isFreeDelivery = (subtotal - totalDiscount) >= 500;

  return {
    subtotal: subtotal,
    discount: totalDiscount,
    total: subtotal - totalDiscount,
    hasDiscount: totalDiscount > 0,
    isFreeDelivery: isFreeDelivery
  };
}

// Update cart UI
function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItemsContainer = document.getElementById('cartItems');

  // Update cart count badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems > 0) {
    cartCount.textContent = totalItems;
    cartCount.style.display = 'inline-block';
  } else {
    cartCount.style.display = 'none';
  }

  // Render cart items
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">Your cart is empty</p>';
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price}</div>
          ${item.quantity > 5 ? '<div class="discount-badge">15% OFF</div>' : ''}
        </div>
        <div class="cart-item-controls">
          <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
          <input type="number" value="${item.quantity}" onchange="updateCartQuantity(${item.id}, parseInt(this.value))" min="1">
          <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-total">₹${item.price * item.quantity}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">&times;</button>
      </div>
    `).join('');
  }

  // Update totals
  const { subtotal, discount, total, hasDiscount, isFreeDelivery } = calculateCartTotal();
  document.getElementById('subtotal').textContent = `₹${subtotal}`;

  const discountRow = document.getElementById('discountRow');
  if (hasDiscount) {
    discountRow.style.display = 'flex';
    document.getElementById('discount').textContent = `-₹${discount.toFixed(0)}`;
  } else {
    discountRow.style.display = 'none';
  }

  const deliveryRow = document.getElementById('deliveryRow');
  if (isFreeDelivery) {
    deliveryRow.style.display = 'flex';
  } else {
    deliveryRow.style.display = 'none';
  }

  document.getElementById('cartTotal').textContent = `₹${total.toFixed(0)}`;
}

// Toggle cart sidebar
function toggleCart() {
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  cartSidebar.classList.toggle('active');
  cartOverlay.classList.toggle('active');
}

// Checkout function
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const { subtotal, discount, total, isFreeDelivery } = calculateCartTotal();

  // Create order summary message
  let orderMessage = 'Hi! I would like to place an order:\n\n';

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    orderMessage += `${item.name} x${item.quantity} = ₹${itemTotal}\n`;
    if (item.quantity > 5) {
      const discountAmount = itemTotal * 0.15;
      orderMessage += `  (15% discount applied: -₹${discountAmount.toFixed(0)})\n`;
    }
  });

  orderMessage += `\nSubtotal: ₹${subtotal}`;
  if (discount > 0) {
    orderMessage += `\nDiscount: -₹${discount.toFixed(0)}`;
  }
  orderMessage += `\nTotal: ₹${total.toFixed(0)}`;
  if (isFreeDelivery) {
    orderMessage += `\n✅ FREE DELIVERY (Order above ₹500)`;
  }
  orderMessage += `\n\nPlease confirm this order.`;

  const encodedMessage = encodeURIComponent(orderMessage);
  window.open(`https://wa.me/919084494147?text=${encodedMessage}`, '_blank');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  loadProducts();
  setupNavigation();
  setupEventListeners();
});

// Load products from JSON
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    allProducts = await response.json();
    filteredProducts = [...allProducts];

    // Render products on shop page if available
    if (document.getElementById('productsGrid')) {
      renderProducts(filteredProducts);
    }

    // Render featured products on home page if available
    if (document.querySelector('.featured-slider')) {
      renderFeaturedSlider();
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Render products to grid
function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found.</p>';
    return;
  }

  grid.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      ${product.bestSeller ? '<div class="best-seller-badge">⭐ Most Selling</div>' : ''}
      <div class="product-image">
        <img src="${product.image}" alt="${product.imageAlt || product.name}" title="${product.imageCaption || product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}'">
        <figcaption style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(139, 111, 71, 0.9); color: white; padding: 0.5rem; font-size: 0.8rem; opacity: 0; transition: opacity 0.3s; font-style: italic;">${product.imageCaption || ''}</figcaption>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h4 class="product-name">${product.name}</h4>
        <p class="product-description">${product.description}</p>
        <div class="product-price">₹${product.price}</div>
        <div class="product-actions">
          <button class="btn btn-primary" onclick="quickView(${product.id})">Quick View</button>
          <button class="btn btn-secondary" onclick="addToCart(${product.id}, 1); toggleCart();">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Render featured products slider
function renderFeaturedSlider() {
  const featured = allProducts.filter(p => p.featured);
  const slider = document.querySelector('.slider-container');

  if (!slider || featured.length === 0) return;

  slider.innerHTML = featured.map(product => `
    <div class="slide">
      <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 500px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/800x500?text=${encodeURIComponent(product.name)}'">
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; padding: 2rem; text-align: center;">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div style="margin-top: 1rem;">
          <button class="btn btn-primary" onclick="orderOnWhatsApp(${product.id})" style="margin-right: 0.5rem;">Order Now</button>
          <button class="btn btn-secondary" onclick="quickView(${product.id})">View Details</button>
        </div>
      </div>
    </div>
  `).join('');

  initSlider();
}

// Slider functionality
let currentSlide = 0;
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;

  updateSlider();
}

function updateSlider() {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;

  const slider = document.querySelector('.slider-container');
  const offset = -currentSlide * 100;
  slider.style.transform = `translateX(${offset}%)`;
}

function prevSlide() {
  const slides = document.querySelectorAll('.slide');
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
}

function nextSlide() {
  const slides = document.querySelectorAll('.slide');
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
}

// Auto-rotate slider every 5 seconds
setInterval(() => {
  const slider = document.querySelector('.slider-container');
  if (slider && document.querySelectorAll('.slide').length > 0) {
    nextSlide();
  }
}, 5000);

// Quick view modal
function quickView(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quickViewModal');
  if (!modal) return;

  const content = modal.querySelector('.modal-content');
  content.innerHTML = `
    <button class="modal-close" onclick="closeModal('quickViewModal')">&times;</button>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}'">
      </div>
      <div>
        <h3>${product.name}</h3>
        <div style="color: #8b6f47; margin: 1rem 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">${product.category}</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: #8b6f47; margin: 1rem 0;">₹${product.price}</div>
        <p>${product.description}</p>
        <div style="margin: 1.5rem 0;">
          <p><strong>Fragrance Notes:</strong> ${product.fragranceNotes}</p>
          <p><strong>Burn Time:</strong> ${product.burnTime}</p>
          <p><strong>Care Instructions:</strong> ${product.careInstructions}</p>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; margin: 1.5rem 0;">
          <label for="quantityInput" style="font-weight: 600;">Quantity:</label>
          <input type="number" id="quantityInput" value="1" min="1" style="width: 80px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button class="btn btn-primary" style="flex: 1;" onclick="addToCart(${product.id}, parseInt(document.getElementById('quantityInput').value))">Add to Cart</button>
          <button class="btn btn-outline" style="flex: 1;" onclick="closeModal('quickViewModal')">Close</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// WhatsApp order functionality
function orderOnWhatsApp(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const message = `Hi! I'm interested in ordering ${product.name} (₹${product.price}). Please provide more details.`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/919084494147?text=${encodedMessage}`, '_blank');
}

// Navigation mobile toggle
function setupNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('active');
      hamburger.classList.toggle('active');
    });

    // Close menu when a link is clicked
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('active') &&
        !nav.contains(e.target) &&
        !hamburger.contains(e.target)) {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  }
}

// Filter products
function filterByCategory(category) {
  if (category === 'all') {
    filteredProducts = [...allProducts];
  } else {
    filteredProducts = allProducts.filter(p => p.category === category);
  }
  renderProducts(filteredProducts);
}

// Sort products
function sortProducts(sortType) {
  switch (sortType) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      filteredProducts = [...allProducts];
  }
  renderProducts(filteredProducts);
}

// Search products
function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm) ||
    p.description.toLowerCase().includes(searchTerm) ||
    p.fragranceNotes.toLowerCase().includes(searchTerm)
  );
  renderProducts(filteredProducts);
}

// Set up event listeners
function setupEventListeners() {
  // Category filter buttons
  const categoryButtons = document.querySelectorAll('[data-category]');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;

      // Update active state
      categoryButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      filterByCategory(category);
    });
  });

  // Sort dropdown
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortProducts(e.target.value);
    });
  }

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchProducts(e.target.value);
    });
  }

  // Slider buttons
  const prevBtn = document.querySelector('.slider-button.prev');
  const nextBtn = document.querySelector('.slider-button.next');
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // Newsletter form handler
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
}

// Set active navigation link
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Call on page load
document.addEventListener('DOMContentLoaded', setActiveNav);

// Smooth scroll to anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Validate Netlify form
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;

  const inputs = form.querySelectorAll('input, textarea');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = '#d9534f';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  return isValid;
}

// Handle newsletter form submission
function handleNewsletterSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('newsletterForm');
  const emailInput = form.querySelector('input[name="email"]');
  const messageDiv = document.getElementById('newsletterMessage');

  if (!emailInput.value.trim()) {
    messageDiv.textContent = 'Please enter a valid email address';
    messageDiv.style.backgroundColor = '#dc3545';
    messageDiv.style.display = 'block';
    return;
  }

  // Simulate form submission to Netlify
  const formData = new FormData(form);

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData)
  })
    .then(() => {
      messageDiv.textContent = '✓ Thank you for subscribing! Check your email for updates.';
      messageDiv.style.backgroundColor = '#28a745';
      messageDiv.style.display = 'block';
      form.reset();
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    })
    .catch((error) => {
      console.error('Error:', error);
      messageDiv.textContent = 'Thank you for subscribing! We\'ll contact you soon.';
      messageDiv.style.backgroundColor = '#28a745';
      messageDiv.style.display = 'block';
      form.reset();
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    });
}

// Get related products
function getRelatedProducts(productId, limit = 3) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return [];

  return allProducts
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

// Render related products
function renderRelatedProducts(productId) {
  const related = getRelatedProducts(productId);
  const container = document.getElementById('relatedProducts');

  if (!container || related.length === 0) return;

  container.innerHTML = related.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}'">
      </div>
      <div class="product-info">
        <h4 class="product-name">${product.name}</h4>
        <div class="product-price">₹${product.price}</div>
        <div class="product-actions">
          <button class="btn btn-primary" onclick="orderOnWhatsApp(${product.id})">Order</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Format price for display
function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(price);
}

// Handle contact form submission - redirect to WhatsApp
function handleContactFormSubmit(e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  // Validate required fields
  if (!name || !email || !subject || !message) {
    alert('Please fill in all required fields (Name, Email, Subject, Message)');
    return;
  }

  // Create WhatsApp message
  let whatsappMessage = `📧 *New Contact Form Submission*\n\n`;
  whatsappMessage += `*Name:* ${name}\n`;
  whatsappMessage += `*Email:* ${email}\n`;
  if (phone) {
    whatsappMessage += `*Phone:* ${phone}\n`;
  }
  whatsappMessage += `*Subject:* ${subject}\n`;
  whatsappMessage += `*Message:* ${message}`;

  // Encode and open WhatsApp
  const encodedMessage = encodeURIComponent(whatsappMessage);
  window.open(`https://wa.me/919084494147?text=${encodedMessage}`, '_blank');

  // Reset form
  document.getElementById('contactForm').reset();
  alert('Message sent! Opening WhatsApp for confirmation...');
}
