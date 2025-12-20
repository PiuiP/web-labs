// orders.js
const API_KEY = 'f67e61cb-1981-4ed5-9545-8962853e8763';
const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
const ORDERS_API = `${API_URL}/labs/api/orders?api_key=${API_KEY}`;
const DISHES_API = `${API_URL}/labs/api/dishes?api_key=${API_KEY}`;

let allOrders = [];
let allDishes = [];
let dishesMap = {}; // Карта для быстрого поиска блюд по id

// Форматирование даты
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Получение названия блюда по id
function getDishName(dishId) {
  if (!dishId) return '';
  const dish = dishesMap[dishId];
  return dish ? dish.name : `Блюдо #${dishId}`;
}

// Форматирование времени доставки
function formatDeliveryTime(order) {
  if (order.delivery_type === 'now') {
    return '<span class="delivery-time now">Как можно скорее</span>';
  }
  
  if (order.delivery_type === 'by_time' && order.delivery_time) {
    const time = order.delivery_time.slice(0, 5); // Берем только HH:MM
    return `<span class="delivery-time">${time}</span>`;
  }
  
  return '<span class="delivery-time">Не указано</span>';
}

// Получение состава заказа
function getOrderItems(order) {
  const items = [];
  if (order.soup_id) items.push(getDishName(order.soup_id));
  if (order.main_course_id) items.push(getDishName(order.main_course_id));
  if (order.salad_id) items.push(getDishName(order.salad_id));
  if (order.dessert_id) items.push(getDishName(order.dessert_id));
  if (order.drink_id) items.push(getDishName(order.drink_id));
  return items.length > 0 ? items.join(', ') : 'Блюда не выбраны';
}

// Расчет стоимости заказа
function calculateOrderTotal(order) {
  let total = 0;
  if (order.soup_id && dishesMap[order.soup_id]) total += dishesMap[order.soup_id].price;
  if (order.main_course_id && dishesMap[order.main_course_id]) total += dishesMap[order.main_course_id].price;
  if (order.salad_id && dishesMap[order.salad_id]) total += dishesMap[order.salad_id].price;
  if (order.dessert_id && dishesMap[order.dessert_id]) total += dishesMap[order.dessert_id].price;
  if (order.drink_id && dishesMap[order.drink_id]) total += dishesMap[order.drink_id].price;
  return total;
}

// Загрузка всех блюд
async function loadDishes() {
  try {
    const response = await fetch(DISHES_API);
    if (!response.ok) throw new Error('Ошибка загрузки блюд');
    allDishes = await response.json();
    
    // Создаем карту для быстрого поиска
    allDishes.forEach(dish => {
      dishesMap[dish.id] = dish;
    });
    
    return true;
  } catch (error) {
    console.error('Ошибка загрузки блюд:', error);
    showNotification('Ошибка загрузки данных о блюдах', 'error');
    return false;
  }
}

// Загрузка заказов
async function loadOrders() {
  try {
    const response = await fetch(ORDERS_API);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Ошибка авторизации. Проверьте API ключ.');
      }
      throw new Error('Ошибка загрузки заказов');
    }
    
    allOrders = await response.json();
    
    // Сортируем по дате создания (новые сначала)
    allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return true;
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error);
    showNotification(error.message, 'error');
    return false;
  }
}

// Отображение списка заказов
function renderOrders() {
  const container = document.getElementById('orders-list');
  
  if (!allOrders || allOrders.length === 0) {
    container.innerHTML = `
      <div class="no-orders-message">
        <p>У вас пока нет заказов.</p>
        <p><a href="build-lunch.html">Собрать ланч</a> и оформить первый заказ!</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Дата заказа</th>
          <th>Состав заказа</th>
          <th>Стоимость</th>
          <th>Время доставки</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  allOrders.forEach((order, index) => {
    const items = getOrderItems(order);
    const total = calculateOrderTotal(order);
    const deliveryTime = formatDeliveryTime(order);
    
    html += `
      <tr data-order-id="${order.id}">
        <td class="order-number">${index + 1}</td>
        <td>${formatDate(order.created_at)}</td>
        <td class="order-items" title="${items}">${items}</td>
        <td class="order-price">${total} ₽</td>
        <td>${deliveryTime}</td>
        <td>
          <div class="order-actions">
            <button class="action-btn view" title="Просмотр" data-order-id="${order.id}"></button>
            <button class="action-btn edit" title="Редактировать" data-order-id="${order.id}"></button>
            <button class="action-btn delete" title="Удалить" data-order-id="${order.id}"></button>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
  
  // Добавляем обработчики событий для кнопок
  setupEventListeners();
}

// Отображение деталей заказа в модальном окне
function showOrderDetails(orderId) {
  const order = allOrders.find(o => o.id == orderId);
  if (!order) {
    showNotification('Заказ не найден', 'error');
    return;
  }
  
  const items = [];
  let total = 0;
  
  // Добавляем блюда в список
  if (order.soup_id && dishesMap[order.soup_id]) {
    const dish = dishesMap[order.soup_id];
    items.push({ name: dish.name, price: dish.price });
    total += dish.price;
  }
  
  if (order.main_course_id && dishesMap[order.main_course_id]) {
    const dish = dishesMap[order.main_course_id];
    items.push({ name: dish.name, price: dish.price });
    total += dish.price;
  }
  
  if (order.salad_id && dishesMap[order.salad_id]) {
    const dish = dishesMap[order.salad_id];
    items.push({ name: dish.name, price: dish.price });
    total += dish.price;
  }
  
  if (order.dessert_id && dishesMap[order.dessert_id]) {
    const dish = dishesMap[order.dessert_id];
    items.push({ name: dish.name, price: dish.price });
    total += dish.price;
  }
  
  if (order.drink_id && dishesMap[order.drink_id]) {
    const dish = dishesMap[order.drink_id];
    items.push({ name: dish.name, price: dish.price });
    total += dish.price;
  }
  
  // Форматируем время доставки
  let deliveryTime = 'Как можно скорее (с 7:00 до 23:00)';
  if (order.delivery_type === 'by_time' && order.delivery_time) {
    const time = order.delivery_time.slice(0, 5);
    deliveryTime = `К ${time}`;
  }
  
  // Создаем HTML для отображения
  const detailsHtml = `
    <div class="order-detail">
      <h4>Информация о заказе</h4>
      <p><strong>Номер заказа:</strong> ${order.id}</p>
      <p><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</p>
      <p><strong>Статус:</strong> ${order.status || 'Оформлен'}</p>
    </div>
    
    <div class="order-detail">
      <h4>Состав заказа</h4>
      <div class="detail-items">
        ${items.map(item => `
          <div class="detail-item">
            <span class="detail-item-name">${item.name}</span>
            <span class="detail-item-price">${item.price} ₽</span>
          </div>
        `).join('')}
        <div class="detail-total">
          <span>Итого:</span>
          <span>${total} ₽</span>
        </div>
      </div>
    </div>
    
    <div class="order-detail">
      <h4>Информация о доставке</h4>
      <p><strong>Имя:</strong> ${order.full_name}</p>
      <p><strong>Телефон:</strong> ${order.phone}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Адрес:</strong> ${order.delivery_address}</p>
      <p><strong>Время доставки:</strong> <span class="detail-time">${deliveryTime}</span></p>
      ${order.comment ? `<p><strong>Комментарий:</strong> ${order.comment}</p>` : ''}
    </div>
  `;
  
  document.getElementById('view-order-details').innerHTML = detailsHtml;
  
  // Показываем модальное окно
  const modal = document.getElementById('view-order-modal');
  modal.style.display = 'flex';
}

// Заполнение формы редактирования
function populateEditForm(orderId) {
  const order = allOrders.find(o => o.id == orderId);
  if (!order) {
    showNotification('Заказ не найден', 'error');
    return;
  }
  
  // Заполняем поля формы
  document.getElementById('edit-full_name').value = order.full_name;
  document.getElementById('edit-email').value = order.email;
  document.getElementById('edit-phone').value = order.phone;
  document.getElementById('edit-delivery_address').value = order.delivery_address;
  document.getElementById('edit-comment').value = order.comment || '';
  document.getElementById('edit-order-id').value = order.id;
  
  // Устанавливаем тип доставки
  if (order.delivery_type === 'now') {
    document.getElementById('edit-now').checked = true;
    document.getElementById('edit-delivery_time').disabled = true;
    document.getElementById('edit-delivery_time').value = '';
  } else {
    document.getElementById('edit-by_time').checked = true;
    document.getElementById('edit-delivery_time').disabled = false;
    document.getElementById('edit-delivery_time').value = order.delivery_time || '';
  }
  
  // Показываем модальное окно
  const modal = document.getElementById('edit-order-modal');
  modal.style.display = 'flex';
}

// Обновление заказа
async function updateOrder(orderId, formData) {
  try {
    const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка обновления заказа');
    }
    
    const updatedOrder = await response.json();
    
    // Обновляем заказ в списке
    const index = allOrders.findIndex(o => o.id == orderId);
    if (index !== -1) {
      allOrders[index] = { ...allOrders[index], ...updatedOrder };
    }
    
    showNotification('Заказ успешно обновлен', 'success');
    renderOrders();
    
    return true;
  } catch (error) {
    console.error('Ошибка обновления заказа:', error);
    showNotification(error.message, 'error');
    return false;
  }
}

// Удаление заказа
async function deleteOrder(orderId) {
  try {
    const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка удаления заказа');
    }
    
    // Удаляем заказ из списка
    allOrders = allOrders.filter(o => o.id != orderId);
    
    showNotification('Заказ успешно удален', 'success');
    renderOrders();
    
    return true;
  } catch (error) {
    console.error('Ошибка удаления заказа:', error);
    showNotification(error.message, 'error');
    return false;
  }
}

// Показать уведомление
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const messageEl = document.getElementById('notification-message');
  
  messageEl.textContent = message;
  
  // Меняем цвет уведомления в зависимости от типа
  const notificationBox = notification.querySelector('.notification');
  if (notificationBox) {
    if (type === 'error') {
      notificationBox.style.backgroundColor = '#ffebee';
      notificationBox.style.borderLeft = '4px solid #f44336';
    } else if (type === 'success') {
      notificationBox.style.backgroundColor = '#e8f5e9';
      notificationBox.style.borderLeft = '4px solid #4caf50';
    } else {
      notificationBox.style.backgroundColor = '#e3f2fd';
      notificationBox.style.borderLeft = '4px solid #2196f3';
    }
  }
  
  notification.style.display = 'flex';
  
  // Автоматическое скрытие через 5 секунд для успешных сообщений
  if (type === 'success') {
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Кнопки просмотра
  document.querySelectorAll('.action-btn.view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.dataset.orderId;
      showOrderDetails(orderId);
    });
  });
  
  // Кнопки редактирования
  document.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.dataset.orderId;
      populateEditForm(orderId);
    });
  });
  
  // Кнопки удаления
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.dataset.orderId;
      document.getElementById('delete-order-id').value = orderId;
      document.getElementById('delete-order-modal').style.display = 'flex';
    });
  });
  
  // Закрытие модальных окон
  document.querySelectorAll('.modal-close, .modal-cancel, .modal-ok').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // Обработка формы редактирования
  document.getElementById('edit-order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      full_name: document.getElementById('edit-full_name').value,
      email: document.getElementById('edit-email').value,
      phone: document.getElementById('edit-phone').value,
      delivery_address: document.getElementById('edit-delivery_address').value,
      delivery_type: document.querySelector('input[name="delivery_type"]:checked').value,
      comment: document.getElementById('edit-comment').value
    };
    
    // Если выбрано время доставки, добавляем его
    if (formData.delivery_type === 'by_time') {
      const deliveryTime = document.getElementById('edit-delivery_time').value;
      if (!deliveryTime) {
        showNotification('Укажите время доставки', 'error');
        return;
      }
      formData.delivery_time = deliveryTime;
    }
    
    const orderId = document.getElementById('edit-order-id').value;
    
    const success = await updateOrder(orderId, formData);
    if (success) {
      document.getElementById('edit-order-modal').style.display = 'none';
    }
  });
  
  // Обработка удаления заказа
  document.querySelector('.modal-delete').addEventListener('click', async () => {
    const orderId = document.getElementById('delete-order-id').value;
    const success = await deleteOrder(orderId);
    if (success) {
      document.getElementById('delete-order-modal').style.display = 'none';
    }
  });
  
  // Переключение состояния поля времени доставки
  document.getElementById('edit-now').addEventListener('change', () => {
    document.getElementById('edit-delivery_time').disabled = true;
    document.getElementById('edit-delivery_time').value = '';
  });
  
  document.getElementById('edit-by_time').addEventListener('change', () => {
    document.getElementById('edit-delivery_time').disabled = false;
  });
  
  // Закрытие уведомления
  document.getElementById('notification-ok').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
  });
  
  // Закрытие модальных окон при клике на overlay
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

// Основная функция инициализации
async function init() {
  try {
    // Показываем сообщение о загрузке
    document.getElementById('orders-list').innerHTML = `
      <div class="loading-message">
        <p>Загрузка данных...</p>
      </div>
    `;
    
    // Загружаем блюда и заказы параллельно
    const [dishesLoaded, ordersLoaded] = await Promise.all([
      loadDishes(),
      loadOrders()
    ]);
    
    if (dishesLoaded && ordersLoaded) {
      renderOrders();
    } else {
      document.getElementById('orders-list').innerHTML = `
        <div class="error-message">
          <p>Не удалось загрузить данные. Пожалуйста, попробуйте позже.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    document.getElementById('orders-list').innerHTML = `
      <div class="error-message">
        <p>Ошибка: ${error.message}</p>
      </div>
    `;
  }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);