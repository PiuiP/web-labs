import { dishes } from './dishes.js';

const categories = {
  soup: { id: "soups-grid", className: "soups", filters: ["fish", "meat", "veg"] },
  main: { id: "mains-grid", className: "mains", filters: ["fish", "meat", "veg"] },
  salat: { id: "salat-grid", className: "salat", filters: ["fish", "meat", "veg"] },
  dessert: { id: "dessert-grid", className: "dessert", filters: ["small", "average", "big"] },
  drink: { id: "drinks-grid", className: "drinks", filters: ["cold", "hot"] }
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

  // Добавляем обработчики выбора
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

  // Фиксированный порядок категорий
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

// Ограничение времени (кратные 5 минутам)
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

// Запуск
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  updateOrderDisplay();
  setupFilters();
  restrictMinutes();
});