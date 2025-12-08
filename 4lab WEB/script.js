import { dishes } from './dishes.js';

const categories = {
  soup: { id: "soups-grid", orderTitle: "Суп", className: "soups" },
  main: { id: "mains-grid", orderTitle: "Главное блюдо", className: "mains" },
  drink: { id: "drinks-grid", orderTitle: "Напиток", className: "drinks" }
};

let selectedDishes = { soup: null, main: null, drink: null };

function renderDishes() {
  const grouped = { soup: [], main: [], drink: [] };
  dishes.forEach(dish => {
    if (grouped[dish.category]) grouped[dish.category].push(dish);
  });

  // Сортировка по алфавиту (по полю `name`)
  for (const cat in grouped) {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  // Отрисовка
  for (const cat in grouped) {
    const container = document.getElementById(categories[cat].id);
    if (!container) continue;
    container.innerHTML = '';
    grouped[cat].forEach(dish => {
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
  }

  // Делегирование кликов
  document.querySelectorAll('.dish-card').forEach(card => {
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

function updateOrderDisplay() {
  const container = document.getElementById('selectedOrder');
  const hasSelection = Object.values(selectedDishes).some(d => d);

  if (!hasSelection) {
    container.innerHTML = '<p class="empty-order">Выберите блюда из меню выше</p>';
    return;
  }

  let html = '';
  let total = 0;
  
  // Отображаем выбранные блюда
  for (const cat in selectedDishes) {
    const dish = selectedDishes[cat];
    if (dish) {
      html += `<h4>${categories[cat].orderTitle}</h4>`;
      html += `<p>${dish.name}<br><span class="dish-details">${dish.count} • ${dish.price} ₽</span></p>`;
      total += dish.price;
    }
  }

  // Добавляем пустые категории
  for (const cat in selectedDishes) {
    const dish = selectedDishes[cat];
    if (!dish) {
      html += `<h4>${categories[cat].orderTitle}</h4>`;
      const msg = cat === 'drink' ? 'Напиток не выбран' : 'Блюдо не выбрано';
      html += `<p><em>${msg}</em></p>`;
    }
  }

  html += `<div class="order-total">Итого: ${total} ₽</div>`;
  container.innerHTML = html;
}

// Функция для ограничения минут (кратные 5)
function restrictMinutes() {
  const timeInput = document.getElementById('delivery_time');
  if (!timeInput) return;

  timeInput.addEventListener('change', function() {
    const time = this.value;
    if (!time) return;

    const [hours, minutes] = time.split(':').map(Number);
    const roundedMinutes = Math.round(minutes / 5) * 5;
    const newMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
    const newHours = roundedMinutes === 60 ? hours + 1 : hours;

    this.value = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  });

  // Также можно добавить step="300" в HTML, но это не всегда работает в браузерах
  timeInput.step = 300; // 5 минут в секундах
}

document.addEventListener('DOMContentLoaded', () => {
  renderDishes();
  updateOrderDisplay();
  restrictMinutes(); // Инициализируем ограничение минут
});