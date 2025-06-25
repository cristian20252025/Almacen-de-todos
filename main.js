const API = 'https://fakestoreapi.com/products';
let products = [], cart = {};

const $ = id => document.getElementById(id);

function fetchProducts() {
  return fetch(API).then(res => res.json());
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart')) || {};
  updateCartUI();
}

function updateCartUI() {
  const itemsContainer = $('cart-items');
  itemsContainer.innerHTML = '';
  let total = 0, count = 0;

  for (let id in cart) {
    const p = cart[id];
    total += p.price * p.qty;
    count += p.qty;

    const li = document.createElement('li');
    li.innerHTML = `${p.title} x${p.qty} - $${(p.price * p.qty).toFixed(2)} 
      <button onclick="removeFromCart(${id})">🗑️</button>`;
    itemsContainer.appendChild(li);
  }

  $('cart-total').textContent = total.toFixed(2);
  $('cart-count').textContent = count;
}

function addToCart(id) {
  const p = products.find(p => p.id === id);
  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = { ...p, qty: 1 };
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  updateCartUI();
}

function renderProducts(list) {
  const container = $('product-list');
  container.innerHTML = '';
  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p>$${p.price}</p>
      <p><small>${p.category}</small></p>
      <button onclick="addToCart(${p.id})">🛒 Agregar</button>
    `;
    container.appendChild(div);
  });
}

function setupFilters() {
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    $('filter-category').appendChild(opt);
  });

  $('search').addEventListener('input', applyFilters);
  $('filter-category').addEventListener('change', applyFilters);
  $('sort').addEventListener('change', applyFilters);
}

function applyFilters() {
  let list = [...products];
  const search = $('search').value.toLowerCase();
  const cat = $('filter-category').value;
  const sort = $('sort').value;

  if (search) {
    list = list.filter(p =>
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  }

  if (cat) {
    list = list.filter(p => p.category === cat);
  }

  if (sort) {
    const [field, dir] = sort.split('-');
    list.sort((a, b) => dir === 'asc' ? a[field] - b[field] : b[field] - a[field]);
  }

  renderProducts(list);
}

function setupCartToggle() {
  $('cart-btn').addEventListener('click', () => {
    $('cart').classList.toggle('hidden');
  });

  $('close-cart').addEventListener('click', () => {
    $('cart').classList.add('hidden');
  });
}

async function init() {
  setupCartToggle();
  loadCart();
  products = await fetchProducts();
  renderProducts(products);
  setupFilters();
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

init();

