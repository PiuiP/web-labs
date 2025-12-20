// build-lunch.js — основной скрипт для страницы "Собрать ланч"

const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
const API_KEY = 'f67e61cb-1981-4ed5-9545-8962853e8763';

const categories = {
  soup: { id: "soups-grid", className: "soups", orderTitle: "Суп", filters: ["fish", "meat", "veg"] },
  main: { id: "mains-grid", className: "mains", orderTitle: "Главное блюдо", filters: ["fish", "meat", "veg"] },
  salat: { id: "salat-grid", className: "salat", orderTitle: "Салат/Стартер", filters: ["fish", "meat", "veg"] },
  dessert: { id: "dessert-grid", className: "dessert", orderTitle: "Десерт", filters: ["small", "medium", "large"] },
  drink: { id: "drinks-grid", className: "drinks", orderTitle: "Напиток", filters: ["cold", "hot"] }
};

// Маппинг: API category → наша категория
const categoryMapping = {
  'soup': 'soup',
  'main-course': 'main',
  'salad': 'salat',
  'dessert': 'dessert',
  'drink': 'drink'
};

// Обратное маппирование для kind
const kindMapping = {
  'fish': 'рыбный',
  'meat': 'мясной', 
  'veg': 'вегетарианский',
  'small': 'маленькая порция',
  'medium': 'средняя порция',
  'large': 'большая порция',
  'cold': 'холодный',
  'hot': 'горячий'
};

let selectedDishes = { soup: null, main: null, salat: null, dessert: null, drink: null };
let activeFilters = { soup: null, main: null, salat: null, dessert: null, drink: null };
let dishes = [];

// ==== РАБОТА С localStorage ====
function saveOrderToStorage() {
  const ids = {};
  for (const [cat, dish] of Object.entries(selectedDishes)) {
    if (dish) ids[cat] = dish.keyword;
  }
  localStorage.setItem('lunchOrder', JSON.stringify(ids));
  updateCheckoutPanel();
  updateOrderDisplay();
}

function loadOrderFromStorage() {
  const saved = localStorage.getItem('lunchOrder');
  if (!saved) return;

  try {
    const ids = JSON.parse(saved);
    // Будет заполнено после загрузки блюд
    for (const [cat, keyword] of Object.entries(ids)) {
      const dish = dishes.find(d => d.keyword === keyword);
      if (dish) selectedDishes[cat] = dish;
    }
  } catch (e) {
    console.error('Ошибка загрузки заказа:', e);
  }
}

// ==== ЗАГРУЗКА БЛЮД ====
async function loadDishes() {
  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    dishes = await response.json();
    
    // Добавляем свойство kind на основе данных из API
    dishes.forEach(dish => {
      if (!dish.kind && dish.type) {
        dish.kind = dish.type;
      }
    });

    renderAll();
    loadOrderFromStorage(); // восстанавливаем выбор
    updateOrderDisplay();
    setupFilters();
    updateCheckoutPanel();
  } catch (error) {
    console.error('Не удалось загрузить блюда:', error);
    document.querySelector('main').insertAdjacentHTML('afterbegin', `
      <div style="text-align:center;color:red;padding:20px;background:#ffe6e6;margin:20px;border-radius:8px;">
        <h3>Ошибка загрузки меню</h3>
        <p>Проверьте подключение к интернету.</p>
      </div>
    `);
  }
}

// ==== РЕНДЕР ====
function getFilteredDishes(category) {
  const apiCat = Object.keys(categoryMapping).find(k => categoryMapping[k] === category);
  const all = dishes.filter(d => d.category === apiCat);
  all.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  const filter = activeFilters[category];
  
  if (filter) {
    return all.filter(d => d.kind === filter);
  }
  return all;
}

function renderCategory(category) {
  const container = document.getElementById(categories[category].id);
  if (!container) return;

  container.innerHTML = '';
  const list = getFilteredDishes(category);
  if (list.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;">Нет блюд</p>';
    return;
  }

  list.forEach(dish => {
    const isSelected = selectedDishes[category]?.keyword === dish.keyword;
    const card = document.createElement('div');
    card.className = 'dish-card' + (isSelected ? ' selected' : '');
    card.dataset.dish = dish.keyword;
    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}" onerror="this.src='images/placeholder.jpg'">
      <p class="dish-price">${dish.price} ₽</p>
      <p class="dish-name">${dish.name}</p>
      <p class="dish-weight">${dish.count}</p>
      <button class="add-button">${isSelected ? 'Выбрано' : 'Добавить'}</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('click', () => {
      const keyword = card.dataset.dish;
      const dish = dishes.find(d => d.keyword === keyword);
      if (!dish) return;

      const yourCat = categoryMapping[dish.category];
      
      // Если уже выбрано это блюдо, снимаем выбор
      if (selectedDishes[yourCat]?.keyword === keyword) {
        selectedDishes[yourCat] = null;
      } else {
        selectedDishes[yourCat] = dish;
      }
      
      saveOrderToStorage();
      renderCategory(yourCat); // обновляем только эту категорию
    });
  });
}

function renderAll() {
  Object.keys(categories).forEach(renderCategory);
}

// ==== ВАЛИДАЦИЯ КОМБО ====
function isValidCombo(selected) {
  const hasSoup = !!selected.soup;
  const hasMain = !!selected.main;
  const hasSalad = !!selected.salat;
  const hasDrink = !!selected.drink;

  return (
    (hasSoup && hasMain && hasSalad && hasDrink) ||
    (hasSoup && hasMain && hasDrink) ||
    (hasSoup && hasSalad && hasDrink) ||
    (hasMain && hasSalad && hasDrink) ||
    (hasMain && hasDrink)
  );
}

// ==== ПАНЕЛЬ ОФОРМЛЕНИЯ ====
function updateCheckoutPanel() {
  const panel = document.getElementById('checkout-panel');
  if (!panel) return;

  const total = Object.values(selectedDishes).filter(Boolean).reduce((sum, d) => sum + d.price, 0);
  const isValid = isValidCombo(selectedDishes);
  const hasAny = Object.values(selectedDishes).some(Boolean);

  if (!hasAny) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';
  panel.querySelector('.total-amount').textContent = total;
  const link = panel.querySelector('.checkout-link');
  if (isValid) {
    link.classList.remove('disabled');
    link.href = 'checkout.html';
  } else {
    link.classList.add('disabled');
    link.href = '#';
  }
}

// ==== ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ЗАКАЗА ====
function updateOrderDisplay() {
  // Можно использовать для любых дополнительных обновлений
  const total = Object.values(selectedDishes).filter(Boolean).reduce((sum, d) => sum + d.price, 0);
  console.log('Текущая сумма заказа:', total);
}

// ==== ФИЛЬТРАЦИЯ ====
function setupFilters() {
  Object.values(categories).forEach(config => {
    const section = document.querySelector(`.${config.className}`);
    if (!section) return;
    const buttons = section.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.kind;
        const cat = Object.keys(categories).find(k => categories[k].className === config.className);
        
        // Если уже активен этот фильтр, снимаем его
        if (activeFilters[cat] === kind) {
          activeFilters[cat] = null;
          btn.classList.remove('active');
        } else {
          // Иначе включаем фильтр
          activeFilters[cat] = kind;
          // Снимаем активный класс со всех кнопок в этой секции
          buttons.forEach(b => b.classList.remove('active'));
          // Добавляем активный класс к нажатой кнопке
          btn.classList.add('active');
        }
        renderCategory(cat);
      });
    });
  });
}

// ==== СТАРТ ====
document.addEventListener('DOMContentLoaded', () => {
  // Добавляем панель оформления (sticky)
  const main = document.querySelector('main');
  if (main) {
    const panel = document.createElement('div');
    panel.id = 'checkout-panel';
    panel.innerHTML = `
      <div class="checkout-sticky">
        <span>К оплате: <strong class="total-amount">0</strong> ₽</span>
        <a href="#" class="checkout-link disabled">Перейти к оформлению</a>
      </div>
    `;
    main.appendChild(panel);
  }

  loadDishes();
});