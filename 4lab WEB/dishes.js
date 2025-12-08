//массивы блюд
const dishes = [
  // Супы
  { keyword: "gazpacho", name: 'Суп "Красный, но не борщ"', price: 300, category: "soup", count: "350 г", image: "images/soups/gazpacho.jpg" },
  { keyword: "mushroom_soup", name: 'Суп с грибами "Леголайз"', price: 500, category: "soup", count: "228 г", image: "images/soups/mushroom_soup.jpg" },
  { keyword: "norwegian_soup", name: 'Суп "Соус от шефа"', price: 1000, category: "soup", count: "300 г", image: "images/soups/norwegian_soup.jpg" },

  // Главные блюда
  { keyword: "chicken_cutlets", name: "Филиное Куре с Пюртофельным Каре", price: 250, category: "main", count: "320 г", image: "images/mainCourse/chickencutletsandmashedpotatoes.jpg" },
  { keyword: "fried_potatoes", name: 'Жареная картошка "Жаренная в масле картошка"', price: 500, category: "main", count: "3000 г", image: "images/mainCourse/friedpotatoeswithmushrooms1.jpg" },
  { keyword: "lasagna", name: 'Лазанья "Парле Франсе"', price: 750, category: "main", count: "350 г", image: "images/mainCourse/lasagna.jpg" },

  // Напитки
  { keyword: "apple_juice", name: "Эппл Джус", price: 250, category: "drink", count: "300 г", image: "images/drinks/applejuice.jpg" },
  { keyword: "carrot_juice", name: "Кэррот Джус", price: 250, category: "drink", count: "300 г", image: "images/drinks/carrotjuice.jpg" },
  { keyword: "orange_juice", name: "Орэндж Джус", price: 250, category: "drink", count: "300 г", image: "images/drinks/orangejuice.jpg" }
];

export { dishes };