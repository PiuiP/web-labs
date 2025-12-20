// УБРАЛИ: import { dishes } from './dishes.js';

const categories = {
  soup: { id: "soups-grid", className: "soups", orderTitle: "Суп", filters: ["fish", "meat", "veg"] },
  main: { id: "mains-grid", className: "mains", orderTitle: "Главное блюдо", filters: ["fish", "meat", "veg"] },
  salat: { id: "salat-grid", className: "salat", orderTitle: "Салат/Стартер", filters: ["fish", "meat", "veg"] },
  dessert: { id: "dessert-grid", className: "dessert", orderTitle: "Десерт", filters: ["small", "medium", "big"] },
  drink: { id: "drinks-grid", className: "drinks", orderTitle: "Напиток", filters: ["cold", "hot"] }
};

// Маппинг категорий API -> ваших категорий
const categoryMapping = {
  'soup': 'soup',          // API: soup -> ваш: soup
  'main-course': 'main',    // API: main-course -> ваш: main
  'salad': 'salat',         // API: salad -> ваш: salat
  'dessert': 'dessert',     // API: dessert -> ваш: dessert
  'drink': 'drink'          // API: drink -> ваш: drink
};

let selectedDishes = { soup: null, main: null, salat: null, dessert: null, drink: null };
let activeFilters = { soup: null, main: null, salat: null, dessert: null, drink: null };
let dishes = []; // Будет заполнен из API

// Группировка и фильтрация блюд
function getFilteredDishes(category) {
  // Используем обратное маппирование для поиска нужных блюд
  const apiCategory = Object.keys(categoryMapping).find(key => categoryMapping[key] === category);
  console.log(`Filtering ${category} (API category: ${apiCategory}):`, dishes.filter(d => d.category === apiCategory));
  
  const all = dishes.filter(d => d.category === apiCategory);
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
  console.log(`Rendering ${category}:`, dishesToRender.length, 'dishes');

  if (dishesToRender.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;">Блюда этой категории временно отсутствуют</p>';
    return;
  }

  dishesToRender.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.dataset.dish = dish.keyword;
    
    // Исправляем путь к изображению
    let imageUrl = dish.image;
    if (!imageUrl) {
      imageUrl = 'images/placeholder.jpg';
    }
    // Убираем проверку на расширение, так как в API уже полные URL
    
    card.innerHTML = `
      <img src="${imageUrl}" alt="${dish.name}" onerror="this.onerror=null; this.src='images/placeholder.jpg'">
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
        // Используем маппинг для преобразования категории API в вашу категорию
        const yourCategory = categoryMapping[dish.category];
        selectedDishes[yourCategory] = dish;
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

// Валидация по ТЗ
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

    if (!anySelected) {
      showNotification('Ничего не выбрано. Выберите блюда для заказа', 'nothing');
      return;
    }

    if (hasSoup && !hasMain && !hasSalad) {
      showNotification('Выберите главное блюдо/салат/стартер', 'main_or_salad');
      return;
    }

    if (hasSalad && !hasSoup && !hasMain) {
      showNotification('Выберите суп или главное блюдо', 'soup_or_main');
      return;
    }

    if (!hasSoup && !hasMain && !hasSalad && (hasDrink || hasDessert)) {
      showNotification('Выберите главное блюдо', 'main');
      return;
    }

    const hasEssential = hasSoup || hasMain || hasSalad;
    if (hasEssential && !hasDrink) {
      showNotification('Выберите напиток', 'drink');
      return;
    }

    alert('Заказ принят!');
    // form.submit();
  });
}

//загрузка блюд с API
async function loadDishes() {
  try {
    const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    dishes = await response.json();
    
    console.log('Loaded dishes from API:', dishes);

    //инициализируем всё остальное
    renderAll();
    updateOrderDisplay();
    setupFilters();
    restrictMinutes();
    setupFormValidation();
  } catch (error) {
    console.error('Не удалось загрузить блюда:', error);
    // Показываем сообщение об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'text-align:center;color:red;padding:20px;background:#ffe6e6;margin:20px;border-radius:8px;';
    errorDiv.innerHTML = '<h3>Ошибка загрузки меню</h3><p>Проверьте подключение к интернету и попробуйте обновить страницу.</p>';
    document.querySelector('main').insertBefore(errorDiv, document.querySelector('main').firstChild);
  }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
  loadDishes(); // Загружаем данные с API
});