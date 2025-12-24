const tg = window.Telegram.WebApp;

// Init Telegram WebApp
tg.expand();
tg.MainButton.hide(); // We use our own custom floating button

// Mock Data
const products = [
    { id: 1, name: "Spotify Premium", price: 199, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1024px-Spotify_logo_without_text.svg.png", category: "subs" },
    { id: 2, name: "NordVPN 1 Year", price: 490, image: "https://s1.mnmcdn.com/evolution/nordvpn-logo.jpg", category: "vpn" },
    { id: 3, name: "Telegram Premium", price: 299, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/2048px-Telegram_logo.svg.png", category: "subs" },
    { id: 4, name: "GTA V Key", price: 1490, image: "https://upload.wikimedia.org/wikipedia/ru/c/c7/Grand_Theft_Auto_V_poster.jpg", category: "games" },
    { id: 5, name: "ChatGPT Plus", price: 2500, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png", category: "software" },
    { id: 6, name: "Adobe Creative Cloud", price: 990, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Adobe_Creative_Cloud_2020_logo.svg/1200px-Adobe_Creative_Cloud_2020_logo.svg.png", category: "software" },
];

let cart = {};

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const catButtons = document.querySelectorAll('.cat-btn');
const bottomPanel = document.getElementById('mainButton'); // Custom sticky footer
const totalPriceEl = document.getElementById('totalPrice');
const totalItemsEl = document.getElementById('totalItems');
const checkoutBtn = document.getElementById('checkoutBtn');

// Render Products
function renderProducts(filter = 'all') {
    productsGrid.innerHTML = '';

    const filtered = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    filtered.forEach((product, index) => {
        const el = document.createElement('div');
        el.className = 'card';
        el.style.animationDelay = `${index * 50}ms`; // Stagger animation

        el.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${product.image}" alt="${product.name}" class="card-img" loading="lazy">
            </div>
            <div class="card-content">
                <h3 class="card-title">${product.name}</h3>
                <div class="card-price">${product.price} ₽</div>
                <button class="add-btn" onclick="addToCart(${product.id}, this)">
                    <span>В корзину</span>
                </button>
            </div>
        `;
        productsGrid.appendChild(el);
    });
}

// Add to Cart Logic
window.addToCart = function (id, btn) {
    // Animation
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 100);

    // Haptic Feedback
    tg.HapticFeedback.impactOccurred('medium');

    // Logic
    if (cart[id]) {
        cart[id]++;
    } else {
        cart[id] = 1;
    }

    // Visual Feedback
    btn.classList.add('added');
    btn.innerHTML = `<span>✓ Добавлено</span>`;
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `<span>В корзину</span>`;
    }, 1500);

    updateCartUI();
};

// Update Cart UI
function updateCartUI() {
    let total = 0;
    let count = 0;

    for (const [id, qty] of Object.entries(cart)) {
        const product = products.find(p => p.id == id);
        if (product) {
            total += product.price * qty;
            count += qty;
        }
    }

    if (count > 0) {
        bottomPanel.classList.add('visible');
        totalPriceEl.textContent = `${total} ₽`;
        totalItemsEl.textContent = `${count} товаров`;
    } else {
        bottomPanel.classList.remove('visible');
    }
}

// Checkout
checkoutBtn.addEventListener('click', () => {
    tg.HapticFeedback.notificationOccurred('success');

    const items = Object.entries(cart).map(([id, qty]) => {
        const product = products.find(p => p.id == id);
        return { ...product, quantity: qty };
    });

    tg.sendData(JSON.stringify({ items, total_amount: totalPriceEl.innerText })); // Send data back to bot
    // Normally you would close the webapp here or show a success screen
});

// Category Filter
catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Active state
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Haptic
        tg.HapticFeedback.selectionChanged();

        // Render
        renderProducts(btn.dataset.cat);
    });
});

// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const allCards = document.querySelectorAll('.card');

    allCards.forEach(card => {
        const title = card.querySelector('.card-title').innerText.toLowerCase();
        if (title.includes(term)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Initial Render
renderProducts();

// Set header color
tg.setHeaderColor('#0d0d12');
