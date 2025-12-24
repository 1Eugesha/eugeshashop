const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#0d0d12');

// --- DATA ---
const faqData = [
    {
        id: 'general',
        title: 'Общие вопросы',
        icon: '💡',
        questions: [
            { q: "Как пополнить баланс?", a: "Вы можете пополнить баланс через раздел 'Профиль', выбрав удобный метод оплаты (Карта, CryptoBot, SBP)." },
            { q: "Могу ли я сделать возврат?", a: "Возврат средств возможен только в случае неработоспособности товара. Обратитесь в поддержку для решения вопроса." }
        ]
    },
    {
        id: 'apex',
        title: 'Apex Legends',
        icon: '🔫',
        questions: Array(11).fill({ q: "Как активировать монеты?", a: "Инструкция по активации монет Apex Legends..." }).map((item, i) => ({ q: `Вопрос ${i + 1} по Apex`, a: item.a }))
    },
    {
        id: 'brawl',
        title: 'Brawl Stars',
        icon: '⭐',
        questions: [
            { q: "Как получить гемы?", a: "Гемы приходят по тегу игрока (Player Tag)." },
            { q: "Это безопасно?", a: "Да, мы используем официальные методы пополнения." },
            { q: "Как узнать свой тег?", a: "Нажмите на иконку профиля в игре." }
        ]
    },
    {
        id: 'clash',
        title: 'Clash of Clans',
        icon: '⚔️',
        questions: [
            { q: "Куда вводить Gold Pass?", a: "Gold Pass активируется через Supercell ID." },
            { q: "Срок зачисления?", a: "Обычно 5-10 минут." },
            { q: "Есть ли гарантия?", a: "Да, пожизненная гарантия на все товары." }
        ]
    }
];

// --- ELEMENTS ---
const viewCategories = document.getElementById('view-categories');
const viewQuestions = document.getElementById('view-questions');
const categoriesListEl = document.getElementById('categoriesList');
const questionsListEl = document.getElementById('questionsList');
const searchInput = document.getElementById('searchInput');
const backBtn = document.getElementById('backBtn');
const categoryTitleEl = document.getElementById('categoryTitle');

// --- LOGIC ---

// 1. Render Categories
function renderCategories(filter = '') {
    categoriesListEl.innerHTML = '';

    faqData.forEach(cat => {
        if (filter && !cat.title.toLowerCase().includes(filter.toLowerCase())) return;

        const el = document.createElement('div');
        el.className = 'faq-item';
        el.onclick = () => openCategory(cat.id);

        el.innerHTML = `
            <div class="faq-icon-wrapper">
                <div class="faq-icon">${cat.icon}</div>
                <div class="faq-info">
                    <div class="faq-title">${cat.title}</div>
                    <div class="faq-count">${cat.questions.length} ответов</div>
                </div>
            </div>
            <div class="faq-arrow">❯</div>
        `;
        categoriesListEl.appendChild(el);
    });
}

// 2. Open Category (SPA Switch)
function openCategory(id) {
    const category = faqData.find(c => c.id === id);
    if (!category) return;

    // Set Title
    categoryTitleEl.textContent = category.title;

    // Render Questions
    questionsListEl.innerHTML = '';
    category.questions.forEach(item => {
        const qEl = document.createElement('div');
        qEl.className = 'accordion-item';
        qEl.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>${item.q}</span>
                <span class="accordion-icon">⌄</span>
            </div>
            <div class="accordion-content">
                <p>${item.a}</p>
            </div>
        `;
        questionsListEl.appendChild(qEl);
    });

    // Switch View
    viewCategories.classList.remove('active');
    viewQuestions.classList.add('active');

    // Haptic
    tg.HapticFeedback.selectionChanged();
}

// 3. Toggle Accordion
window.toggleAccordion = function (header) {
    const item = header.parentElement;
    const isOpen = item.classList.contains('open');

    // Close others (optional, typical accordion behavior)
    // document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

    if (isOpen) {
        item.classList.remove('open');
    } else {
        item.classList.add('open');
        tg.HapticFeedback.impactOccurred('light');
    }
};

// 4. Back Navigation
backBtn.addEventListener('click', () => {
    viewQuestions.classList.remove('active');
    viewCategories.classList.add('active');
    tg.HapticFeedback.selectionChanged();
});

// 5. Search
searchInput.addEventListener('input', (e) => {
    renderCategories(e.target.value);
});

// Init
renderCategories();
