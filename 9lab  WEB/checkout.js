// checkout.js

const API_KEY = 'f67e61cb-1981-4ed5-9545-8962853e8763';
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
const ORDER_URL = `${API_URL}/orders?api_key=${API_KEY}`;
const DISHES_URL = `${API_URL}/dishes?api_key=${API_KEY}`;

const categories = {
  soup: "Суп",
  main: "Главное блюдо",
  salat: "Салат/Стартер",
  dessert: "Десерт",
  drink: "Напиток"
};

const categoryClasses = {
  soup: "soups",
  main: "mains",
  salat: "salat",
  dessert: "dessert",
  drink: "drinks"
};

let selectedDishes = { soup: null, main: null, salat: null, dessert: null, drink: null };
let allDishes = [];

// Загрузка данных
async function init() {
  try {
    // 1. Загружаем все блюда
    const dishRes = await fetch(DISHES_URL);
    if (!dishRes.ok) throw new Error('Не удалось загрузить блюда');
    allDishes = await dishRes.json();
    
    // 2. Восстанавливаем заказ из localStorage
    const saved = localStorage.getItem('lunchOrder');
    if (saved) {
      const ids = JSON.parse(saved);
      for (const [cat, keyword] of Object.entries(ids)) {
        const dish = allDishes.find(d => d.keyword === keyword);
        if (dish) selectedDishes[cat] = dish;
      }
    }

    renderOrderDishes();
    renderOrderSummary();
    setupForm();
  } catch (err) {
    document.getElementById('order-dishes').innerHTML = `<p style="color:red;">Ошибка: ${err.message}</p>`;
  }
}

// Отображение списка блюд в виде карточек
function renderOrderDishes() {
  const container = document.getElementById('order-dishes');
  const hasAny = Object.values(selectedDishes).some(Boolean);

  if (!hasAny) {
    container.innerHTML = `
      <div class="empty-checkout-message" style="grid-column: 1 / -1;">
        <p>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу 
          <a href="build-lunch.html">Собрать ланч</a>.
        </p>
      </div>
    `;
    return;
  }

  let html = '';
  
  // Группируем блюда по категориям для красивого отображения
  for (const [cat, dish] of Object.entries(selectedDishes)) {
    if (dish) {
      const categoryClass = categoryClasses[cat];
      html += `
        <div class="dish-card selected ${categoryClass}-item">
          <img src="${dish.image}" alt="${dish.name}" onerror="this.src='images/placeholder.jpg'">
          <p class="dish-price">${dish.price} ₽</p>
          <p class="dish-name">${dish.name}</p>
          <p class="dish-weight">${dish.count}</p>
          <button class="remove-button" data-category="${cat}">Удалить</button>
        </div>
      `;
    }
  }
  
  container.innerHTML = html;

  // Обработчики удаления
  container.querySelectorAll('.remove-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Предотвращаем всплытие
      const cat = btn.dataset.category;
      removeDishFromOrder(cat);
    });
  });
}

// Удаление блюда из заказа
function removeDishFromOrder(category) {
  selectedDishes[category] = null;
  const ids = JSON.parse(localStorage.getItem('lunchOrder') || '{}');
  delete ids[category];
  localStorage.setItem('lunchOrder', JSON.stringify(ids));
  renderOrderDishes();
  renderOrderSummary();
}

// Отображение сводки в форме
function renderOrderSummary() {
  const container = document.getElementById('checkout-summary');
  let html = '<h3>Ваш заказ</h3>';
  let total = 0;

  const order = ['soup', 'main', 'salat', 'dessert', 'drink'];
  order.forEach(cat => {
    const dish = selectedDishes[cat];
    html += `<h4>${categories[cat]}</h4>`;
    if (dish) {
      html += `<p>${dish.name}<br><span class="dish-details">${dish.count} • ${dish.price} ₽</span></p>`;
      total += dish.price;
    } else {
      if (cat === 'drink') {
        html += `<p><em>Напиток не выбран</em></p>`;
      } else if (cat === 'dessert') {
        html += `<p><em>Десерт не выбран</em></p>`;
      } else {
        html += `<p><em>Блюдо не выбрано</em></p>`;
      }
    }
  });
  html += `<div class="order-total">Итого: ${total} ₽</div>`;
  container.innerHTML = html;
}

// Валидация комбо (копия из build-lunch)
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

// Отправка заказа
async function submitOrder(formData) {
  const payload = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    delivery_address: formData.get('delivery_address'),
    subscribe: formData.get('subscribe') ? 1 : 0,
    delivery_type: formData.get('delivery_type'),
    delivery_time: formData.get('delivery_time') || null,
    comment: formData.get('comment') || ''
  };

  // Добавляем ID блюд по ключевым словам
  if (selectedDishes.soup) payload.soup_id = selectedDishes.soup.id;
  if (selectedDishes.main) payload.main_course_id = selectedDishes.main.id;
  if (selectedDishes.salat) payload.salad_id = selectedDishes.salat.id;
  if (selectedDishes.dessert) payload.dessert_id = selectedDishes.dessert.id;
  if (selectedDishes.drink) payload.drink_id = selectedDishes.drink.id;

  try {
    const res = await fetch(ORDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Ошибка сервера');
    }

    alert('Заказ успешно оформлен!');
    localStorage.removeItem('lunchOrder');
    window.location.href = 'build-lunch.html';
  } catch (err) {
    alert(`Ошибка оформления заказа: ${err.message}`);
  }
}

// Настройка формы
function setupForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Валидация при отправке
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Проверка состава заказа
    if (!isValidCombo(selectedDishes)) {
      alert('Состав заказа не соответствует ни одному из доступных комбо. Пожалуйста, проверьте выбранные блюда.');
      return;
    }
    
    // Проверка наличия напитка (обязателен всегда)
    if (!selectedDishes.drink) {
      alert('Необходимо выбрать напиток для оформления заказа.');
      return;
    }
    
    // Проверка времени доставки
    const deliveryType = document.querySelector('input[name="delivery_type"]:checked').value;
    const deliveryTime = document.getElementById('delivery_time').value;
    
    if (deliveryType === 'by_time' && !deliveryTime) {
      alert('Пожалуйста, укажите время доставки.');
      return;
    }
    
    if (deliveryType === 'by_time') {
      const now = new Date();
      const selectedTime = new Date();
      const [hours, minutes] = deliveryTime.split(':');
      selectedTime.setHours(hours, minutes, 0, 0);
      
      if (selectedTime < now) {
        alert('Выбранное время доставки уже прошло. Пожалуйста, выберите другое время.');
        return;
      }
    }
    
    submitOrder(new FormData(form));
  });

  // Скрытие времени при "сейчас"
  const nowRadio = document.getElementById('now');
  const timeInput = document.getElementById('delivery_time');
  if (nowRadio && timeInput) {
    nowRadio.addEventListener('change', () => { 
      timeInput.disabled = true;
      timeInput.value = '';
    });
    document.getElementById('by_time').addEventListener('change', () => { 
      timeInput.disabled = false;
    });
    timeInput.disabled = true;
    
    // Ограничение минут (кратные 5)
    timeInput.addEventListener('change', function() {
      if (!this.value) return;
      const [h, m] = this.value.split(':').map(Number);
      const rounded = Math.round(m / 5) * 5;
      const newM = rounded === 60 ? 0 : rounded;
      const newH = rounded === 60 ? h + 1 : h;
      this.value = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    });
  }
}

// Старт
document.addEventListener('DOMContentLoaded', init);