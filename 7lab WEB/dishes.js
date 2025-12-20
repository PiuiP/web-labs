//массивы блюд
const dishes = [
  // Супы
  { keyword: "gazpacho", name: 'Суп "Красный, но не борщ"', price: 300, category: "soup", count: "350 г", image: "images/soups/gazpacho.jpg", kind: 'veg'},
  { keyword: "mushroom_soup", name: 'Суп с грибами "Леголайз"', price: 500, category: "soup", count: "228 г", image: "images/soups/mushroom_soup.jpg", kind: 'veg'},
  { keyword: "norwegian_soup", name: 'Суп "Соус от шефа"', price: 1000, category: "soup", count: "300 г", image: "images/soups/norwegian_soup.jpg", kind: 'meat'},
  { keyword: "chicken", name: 'Суп "Еще вчера бегала"', price: 250, category: "soup", count: "350 г", image: "images/soups/chicken.jpg", kind: 'meat'},
  { keyword: "ramen", name: 'Суп "Наруто-фаг"', price: 850, category: "soup", count: "400 г", image: "images/soups/ramen.jpg", kind: 'fish'},
  { keyword: "tomyum", name: 'Суп "Буль-буль"', price: 1200, category: "soup", count: "520 г", image: "images/soups/tomyum.jpg", kind: 'fish'},

  // Главные блюда
  { keyword: "chicken_cutlets", name: "Филиное Куре с Пюртофельным Каре", price: 250, category: "main", count: "320 г", image: "images/mainCourse/chickencutletsandmashedpotatoes.jpg", kind: 'meat'},
  { keyword: "fried_potatoes", name: 'Жареная картошка "Жаренная в масле картошка"', price: 500, category: "main", count: "3000 г", image: "images/mainCourse/friedpotatoeswithmushrooms1.jpg", kind: 'veg'},
  { keyword: "lasagna", name: 'Лазанья "Парле Франсе"', price: 750, category: "main", count: "350 г", image: "images/mainCourse/lasagna.jpg", kind: 'veg'},
  { keyword: "fishrice", name: 'Рис с буль-буль', price: 800, category: "main", count: "340 г", image: "images/mainCourse/fishrice.jpg", kind: 'fish'},
  { keyword: "pizza", name: 'Пицца "Итальяно"', price: 700, category: "main", count: "400 г", image: "images/mainCourse/pizza.jpg", kind: 'meat'},
  { keyword: "shrimppasta", name: 'Паста "Буль-буль"', price: 750, category: "main", count: "350 г", image: "images/mainCourse/shrimppasta.jpg", kind: 'fish'},

  // Салат
  { keyword: "caesar", name: "Любимец Клеопатры", price: 350, category: "salat", count: "320 г", image: "images/salats/caesar.jpg", kind: 'meat'},
  { keyword: "caprese", name: 'Капрезэ', price: 300, category: "salat", count: "300 г", image: "images/salats/caprese.jpg", kind: 'veg'},
  { keyword: "frenchfries1", name: 'Бульба с белым', price: 250, category: "salat", count: "350 г", image: "images/salats/frenchfries1.jpg", kind: 'veg'},
  { keyword: "frenchfries2", name: 'Бульба с красным', price: 250, category: "salat", count: "340 г", image: "images/salats/frenchfries2.jpg", kind: 'veg'},
  { keyword: "saladwithegg", name: 'Салатик с яичком', price: 200, category: "salat", count: "400 г", image: "images/salats/saladwithegg.jpg", kind: 'veg'},
  { keyword: "tunasalad", name: 'Салат "Буль-буль"', price: 750, category: "salat", count: "350 г", image: "images/salats/tunasalad.jpg", kind: 'fish'},

  // Дессерт
  { keyword: "baklava", name: "ПахЛавА", price: 250, category: "dessert", count: "320 г", image: "images/desserts/baklava.jpg", kind: 'average'},
  { keyword: "checheesecake", name: 'ЧииииизКейк', price: 500, category: "dessert", count: "300 г", image: "images/desserts/checheesecake.jpg", kind: 'small'},
  { keyword: "chocolatecake", name: 'Шоколадный торт', price: 550, category: "dessert", count: "350 г", image: "images/desserts/chocolatecake.jpg", kind: 'average'},
  { keyword: "chocolatecheesecake", name: 'Шоколадный ЧииииизКейк', price: 800, category: "dessert", count: "340 г", image: "images/desserts/chocolatecheesecake.jpg", kind: 'average'},
  { keyword: "donuts", name: 'Пончики Х 2', price: 600, category: "dessert", count: "400 г", image: "images/desserts/donuts.jpg", kind: 'big'},
  { keyword: "donuts2", name: 'Пончики Х 1', price: 350, category: "dessert", count: "200 г", image: "images/desserts/donuts2.jpg", kind: 'small'},

  // Напитки
  { keyword: "apple_juice", name: "Эппл Джус", price: 250, category: "drink", count: "300 г", image: "images/drinks/applejuice.jpg", kind: 'cold'},
  { keyword: "carrot_juice", name: "Кэррот Джус", price: 250, category: "drink", count: "300 г", image: "images/drinks/carrotjuice.jpg", kind: 'cold'},
  { keyword: "orange_juice", name: "Орэндж Джус", price: 250, category: "drink", count: "300 г", image: "images/drinks/orangejuice.jpg", kind: 'cold'},
  { keyword: "cappuccino", name: "Балерина Капучина", price: 250, category: "drink", count: "300 г", image: "images/drinks/cappuccino.jpg", kind: 'hot'},
  { keyword: "greentea", name: "Грин Тэа", price: 250, category: "drink", count: "300 г", image: "images/drinks/greentea.jpg", kind: 'hot'},
  { keyword: "tea", name: "Блэк Тэа", price: 250, category: "drink", count: "300 г", image: "images/drinks/tea.jpg", kind: 'hot'}
];

export { dishes };