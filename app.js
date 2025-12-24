/**
 * TELEGRAM MINI APP - DIGITAL STORE
 * Cart functionality & Telegram WebApp integration
 */

// ============================================
// TELEGRAM WEBAPP INITIALIZATION
// ============================================

const tg = window.Telegram.WebApp;

// Инициализация приложения
tg.ready();
tg.expand();

// Устанавливаем цвета темы
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0a0a0f');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');

// ============================================
// PRODUCTS DATA (Hardcoded для примера)
// ============================================

const products = [
    {
        id: 1,
        name: "GTA V Premium Edition",
        category: "games",
        price: 899,
        image: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
        badge: "ХИТ"
    },
    {
        id: 2,
        name: "Cyberpunk 2077",
        category: "games",
        price: 1299,
        image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
        badge: "NEW"
    },
    {
        id: 3,
        name: "Spotify Premium 1мес",
        category: "subscriptions",
        price: 199,
        image: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png",
        badge: null
    },
    {
        id: 4,
        name: "NordVPN 1 год",
        category: "software",
        price: 2490,
        image: "https://nordvpn.com/wp-content/uploads/blog-featured-nordvpn-app.png",
        badge: "-30%"
    },
    {
        id: 5,
        name: "Windows 11 Pro Key",
        category: "software",
        price: 1599,
        image: "https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/Hero-Surface-Pro-Windows-11?wid=1920",
        badge: null
    },
    {
        id: 6,
        name: "Xbox Game Pass 3мес",
        category: "subscriptions",
        price: 899,
        image: "https://compass-ssl.xbox.com/assets/0d/75/0d75b0c9-e71c-4a08-ad85-93f7c64df0c3.jpg",
        badge: "TOP"
    }
];

// ============================================
// CART STATE
// ============================================

let cart = [];

// ============================================
// DOM ELEMENTS
// ============================================

const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartInfo = document.getElementById('cartInfo');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const modalTotal = document.getElementById('modalTotal');
const closeModal = document.getElementById('closeModal');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
const categoryBtns = document.querySelectorAll('.category-btn');

// ============================================
// RENDER PRODUCTS
// ============================================

function renderProducts(category = 'all') {
    const filtered = category === 'all'
        ? products
        : products.filter(p => p.category === category);

    productsGrid.innerHTML = filtered.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/300x200/1a1a25/00f0ff?text=Product'">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price-row">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button class="add-btn" data-id="${product.id}" onclick="addToCart(${product.id})">
                        +
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const names = {
        'games': '🎮 Игры',
        'software': '💻 Софт',
        'subscriptions': '🔔 Подписки'
    };
    return names[category] || category;
}

function formatPrice(price) {
    return price.toLocaleString('ru-RU') + '₽';
}

// ============================================
// CART FUNCTIONS
// ============================================

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Проверяем, есть ли уже в корзине
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Анимация кнопки
    const btn = document.querySelector(`.add-btn[data-id="${productId}"]`);
    if (btn) {
        btn.classList.add('added');
        btn.innerHTML = '✓';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = '+';
        }, 1000);
    }

    // Обновляем UI
    updateCartUI();
    showToast(`${product.name} добавлен в корзину`);

    // Haptic feedback (вибрация)
    tg.HapticFeedback.impactOccurred('light');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    renderCartModal();
    tg.HapticFeedback.impactOccurred('medium');
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartUI() {
    const count = getCartCount();
    const total = getCartTotal();

    // Обновляем счетчик
    cartCount.textContent = count;

    // Анимация счетчика
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);

    // Обновляем MainButton Telegram
    if (count > 0) {
        tg.MainButton.setText(`Оформить заказ • ${formatPrice(total)}`);
        tg.MainButton.show();
        tg.MainButton.enable();
    } else {
        tg.MainButton.hide();
    }
}

// ============================================
// CART MODAL
// ============================================

function openCartModal() {
    renderCartModal();
    cartModal.classList.add('active');
    tg.HapticFeedback.impactOccurred('light');
}

function closeCartModal() {
    cartModal.classList.remove('active');
}

function renderCartModal() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div>Корзина пуста</div>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item-image" src="${item.image}" 
                     onerror="this.src='https://via.placeholder.com/50/1a1a25/00f0ff?text=?'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)} × ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `).join('');
    }

    modalTotal.textContent = formatPrice(getCartTotal());
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ============================================
// TELEGRAM MAIN BUTTON
// ============================================

tg.MainButton.setParams({
    text: 'Оформить заказ',
    color: '#00f0ff',
    text_color: '#000000'
});

tg.MainButton.onClick(function () {
    if (cart.length === 0) {
        showToast('Корзина пуста!');
        return;
    }

    // Формируем данные заказа
    const orderData = {
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: getCartTotal(),
        timestamp: Date.now()
    };

    // Отправляем данные боту
    tg.sendData(JSON.stringify(orderData));

    // Haptic feedback
    tg.HapticFeedback.notificationOccurred('success');
});

// ============================================
// EVENT LISTENERS
// ============================================

// Клик по иконке корзины
cartInfo.addEventListener('click', openCartModal);

// Закрытие модального окна
closeModal.addEventListener('click', closeCartModal);
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCartModal();
});

// Фильтрация по категориям
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts(btn.dataset.category);
        tg.HapticFeedback.selectionChanged();
    });
});

// Кнопка "Back" в Telegram
tg.BackButton.onClick(() => {
    if (cartModal.classList.contains('active')) {
        closeCartModal();
    } else {
        tg.close();
    }
});

// ============================================
// INITIALIZATION
// ============================================

// Рендерим товары при загрузке
renderProducts();

// Показываем Back Button если есть корзина
if (tg.BackButton) {
    // tg.BackButton.show(); // Раскомментируйте если нужно
}

console.log('🎮 EugeshaStore initialized');
console.log('👤 User:', tg.initDataUnsafe?.user?.first_name || 'Guest');
