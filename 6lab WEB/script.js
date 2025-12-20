import { dishes } from './dishes.js';

const categories = {
  soup: { id: "soups-grid", className: "soups", orderTitle: "Суп", filters: ["fish", "meat", "veg"] },
  main: { id: "mains-grid", className: "mains", orderTitle: "Главное блюдо", filters: ["fish", "meat", "veg"] },
  salat: { id: "salat-grid", className: "salat", orderTitle: "Салат/Стартер", filters: ["fish", "meat", "veg"] },
  dessert: { id: "dessert-grid", className: "dessert", orderTitle: "Десерт", filters: ["small", "medium", "large"] },
  drink: { id: "drinks-grid", className: "drinks", orderTitle: "Напиток", filters: ["cold", "hot"] }
};

let selectedDishes = { soup: null, main: null, salat: null, dessert: null, drink: null };
let activeFilters = { soup: null, main: null, salat: null, dessert: null, drink: null };

// Группировка и фильтрация блюд
function getFilteredDishes(category) {
  const all = dishes.filter(d => d.category === category);
  all.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  const filter = activeFilters[category];
  return filter ? all.filter(d => d.kind === filter) : all;
}

// Рендер блюд одной категории
function renderCategory(category) {
  const container = document.getElementById(categories[category].id);
  if (!container) return;

  container.innerHTML = '';
  const dishesToRender = getFilteredDishes(category);

  dishesToRender.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.dataset.dish = dish.keyword;
    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <p class="dish-price">${dish.price} ₽</p>
      <p class="dish-name">${dish.name}</p>
      <p class="dish-weight">${dish.count}</p>
      <button class="add-button">Добавить</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('click', () => {
      const keyword = card.dataset.dish;
      const dish = dishes.find(d => d.keyword === keyword);
      if (dish) {
        selectedDishes[dish.category] = dish;
        updateOrderDisplay();
      }
    });
  });
}

// Рендер всех категорий
function renderAll() {
  Object.keys(categories).forEach(renderCategory);
}

// Обновление формы заказа
function updateOrderDisplay() {
  const container = document.getElementById('selectedOrder');
  const hasSelection = Object.values(selectedDishes).some(d => d);

  if (!hasSelection) {
    container.innerHTML = '<p class="empty-order">Выберите блюда из меню выше</p>';
    return;
  }

  let html = '';
  let total = 0;
  const order = ['soup', 'main', 'salat', 'dessert', 'drink'];
  order.forEach(cat => {
    const dish = selectedDishes[cat];
    html += `<h4>${categories[cat].orderTitle}</h4>`;
    if (dish) {
      html += `<p>${dish.name}<br><span class="dish-details">${dish.count} • ${dish.price} ₽</span></p>`;
      total += dish.price;
    } else {
      const msg = cat === 'drink' ? 'Напиток не выбран' : 'Блюдо не выбрано';
      html += `<p><em>${msg}</em></p>`;
    }
  });
  html += `<div class="order-total">Итого: ${total} ₽</div>`;
  container.innerHTML = html;
}

// Настройка фильтров
function setupFilters() {
  Object.values(categories).forEach(config => {
    const section = document.querySelector(`.${config.className}`);
    if (!section) return;

    const buttons = section.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.kind;
        const category = Object.keys(categories).find(k => categories[k].className === config.className);

        if (activeFilters[category] === kind) {
          activeFilters[category] = null;
          btn.classList.remove('active');
        } else {
          activeFilters[category] = kind;
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
        renderCategory(category);
      });
    });
  });
}

// Ограничение времени
function restrictMinutes() {
  const timeInput = document.getElementById('delivery_time');
  if (!timeInput) return;

  timeInput.step = 300;
  timeInput.addEventListener('change', function () {
    if (!this.value) return;
    const [h, m] = this.value.split(':').map(Number);
    const rounded = Math.round(m / 5) * 5;
    const newM = rounded === 60 ? 0 : rounded;
    const newH = rounded === 60 ? h + 1 : h;
    this.value = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  });
}

// Уведомления
function showNotification(message, iconType) {
  const iconMap = {
    nothing: 'main.png',
    drink: 'drink.png',
    main_or_salad: 'main.png',
    soup_or_main: 'main.png',
    main: 'main.png'
  };
  const imgSrc = `images/icons/${iconMap[iconType]}`;

  const old = document.querySelector('.notification-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'notification-overlay';
  overlay.innerHTML = `
    <div class="notification">
      <img src="${imgSrc}" alt="">
      <p>${message}</p>
      <button class="notification-ok">Окей</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.notification-ok').addEventListener('click', () => {
    overlay.remove();
  });
}

// ВАЛИДАЦИЯ СТРОГО ПО ТЗ И В ПРАВИЛЬНОМ ПОРЯДКЕ
function setupFormValidation() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const { soup, main, salat, dessert, drink } = selectedDishes;
    const hasSoup = !!soup;
    const hasMain = !!main;
    const hasSalad = !!salat;
    const hasDrink = !!drink;
    const hasDessert = !!dessert;
    const anySelected = hasSoup || hasMain || hasSalad || hasDrink || hasDessert;

    // 1. Ничего не выбрано
    if (!anySelected) {
      showNotification('Ничего не выбрано. Выберите блюда для заказа', 'nothing');
      return;
    }

    // 2. Выбран суп, но нет ни главного блюда, ни салата → приоритет!
    if (hasSoup && !hasMain && !hasSalad) {
      showNotification('Выберите главное блюдо/салат/стартер', 'main_or_salad');
      return;
    }

    // 3. Выбран салат, но нет супа и главного блюда
    if (hasSalad && !hasSoup && !hasMain) {
      showNotification('Выберите суп или главное блюдо', 'soup_or_main');
      return;
    }

    // 4. Выбран только напиток и/или десерт (ничего из основного)
    if (!hasSoup && !hasMain && !hasSalad && (hasDrink || hasDessert)) {
      showNotification('Выберите главное блюдо', 'main');
      return;
    }

    // 5. Есть хотя бы одно из основных (суп/горячее/салат), но нет напитка
    const hasEssential = hasSoup || hasMain || hasSalad;
    if (hasEssential && !hasDrink) {
      showNotification('Выберите напиток', 'drink');
      return;
    }

    // Если ни одно условие не сработало — набор корректен
    alert('Заказ принят!');
    // form.submit(); // раскомментировать при подключении бэкенда
  });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  updateOrderDisplay();
  setupFilters();
  restrictMinutes();
  setupFormValidation();
});