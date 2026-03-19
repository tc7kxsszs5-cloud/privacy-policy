// Прайс-лист студии Флор (источник: car-stile.ru)
// Исключено: обучение

export type PriceCategory = {
  id: string
  title: string
  items: PriceListItem[]
}

export type PriceListItem = {
  item_name: string
  price_from: number
  price_to?: number
  unit: string
  note?: string
  order_index: number
}

export const PRICE_CATEGORIES: PriceCategory[] = [
  {
    id: 'ppf',
    title: 'Оклейка полиуретаном (PPF)',
    items: [
      { item_name: 'Автомобиль целиком', price_from: 180000, unit: 'руб.', order_index: 0 },
      { item_name: 'Передняя часть (капот, бампер, крылья, фары, зеркала)', price_from: 90000, unit: 'руб.', order_index: 1 },
      { item_name: 'Капот целиком', price_from: 17000, unit: 'руб.', order_index: 2 },
      { item_name: 'Бампер целиком', price_from: 17000, unit: 'руб.', order_index: 3 },
      { item_name: 'Передняя оптика (2 фары)', price_from: 6000, unit: 'руб.', order_index: 4 },
      { item_name: 'Под ручками дверей (4 ручки)', price_from: 4000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'tint',
    title: 'Тонировка стекол (LLumar ATR, задняя часть)',
    items: [
      { item_name: 'Средний класс (Focus, Golf, Solaris, Rio)', price_from: 9900, unit: 'руб.', order_index: 0 },
      { item_name: 'Бизнес (Passat, Mercedes A/C/E, Camry, BMW 5)', price_from: 11900, unit: 'руб.', order_index: 1 },
      { item_name: 'Кроссоверы (BMW X3, Audi Q5, Tucson)', price_from: 11900, unit: 'руб.', order_index: 2 },
      { item_name: 'Внедорожники и минивэны (Touareg, Land Cruiser, Cayenne)', price_from: 13900, unit: 'руб.', order_index: 3 },
      { item_name: 'Представительский (Mercedes S, BMW 7)', price_from: 13900, unit: 'руб.', order_index: 4 },
      { item_name: 'Микроавтобусы (Vito, Multivan)', price_from: 15900, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'tint_removal',
    title: 'Демонтаж плёнки',
    items: [
      { item_name: '1 боковое стекло', price_from: 1000, unit: 'руб.', order_index: 0 },
      { item_name: '1 лобовое стекло', price_from: 4000, unit: 'руб.', order_index: 1 },
      { item_name: '1 заднее стекло', price_from: 4000, unit: 'руб.', order_index: 2 },
      { item_name: 'Задняя часть автомобиля', price_from: 5000, unit: 'руб.', order_index: 3 },
    ],
  },
  {
    id: 'glass_protection_front',
    title: 'Защита лобовых стёкол плёнкой Never Scratch',
    items: [
      { item_name: 'Средний класс', price_from: 25000, unit: 'руб.', order_index: 0 },
      { item_name: 'Бизнес', price_from: 28000, unit: 'руб.', order_index: 1 },
      { item_name: 'Кроссоверы', price_from: 28000, unit: 'руб.', order_index: 2 },
      { item_name: 'Внедорожники и минивэны', price_from: 30000, unit: 'руб.', order_index: 3 },
      { item_name: 'Представительский', price_from: 30000, unit: 'руб.', order_index: 4 },
      { item_name: 'Микроавтобусы', price_from: 35000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'glass_protection_side',
    title: 'Защита боковых стёкол плёнкой SunTek 4M',
    items: [
      { item_name: 'Одно боковое стекло', price_from: 3000, unit: 'руб.', order_index: 0 },
      { item_name: 'Все стёкла (кроме лобового)', price_from: 20000, unit: 'руб.', order_index: 1 },
      { item_name: 'Одно заднее стекло', price_from: 6000, unit: 'руб.', order_index: 2 },
    ],
  },
  {
    id: 'polish_restore',
    title: 'Восстановительная полировка',
    items: [
      { item_name: 'Средний класс', price_from: 15000, unit: 'руб.', order_index: 0 },
      { item_name: 'Бизнес', price_from: 17000, unit: 'руб.', order_index: 1 },
      { item_name: 'Кроссоверы', price_from: 17000, unit: 'руб.', order_index: 2 },
      { item_name: 'Внедорожники и минивэны', price_from: 20000, unit: 'руб.', order_index: 3 },
      { item_name: 'Представительский', price_from: 20000, unit: 'руб.', order_index: 4 },
      { item_name: 'Микроавтобусы', price_from: 25000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'polish_soft',
    title: 'Мягкая полировка',
    items: [
      { item_name: 'Средний класс', price_from: 10000, unit: 'руб.', order_index: 0 },
      { item_name: 'Бизнес', price_from: 12000, unit: 'руб.', order_index: 1 },
      { item_name: 'Кроссоверы', price_from: 12000, unit: 'руб.', order_index: 2 },
      { item_name: 'Внедорожники и минивэны', price_from: 15000, unit: 'руб.', order_index: 3 },
      { item_name: 'Представительский', price_from: 15000, unit: 'руб.', order_index: 4 },
      { item_name: 'Микроавтобусы', price_from: 18000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'ceramic',
    title: 'Керамическое покрытие (защита до 3 лет)',
    items: [
      { item_name: 'Средний класс', price_from: 20000, unit: 'руб.', order_index: 0 },
      { item_name: 'Бизнес', price_from: 25000, unit: 'руб.', order_index: 1 },
      { item_name: 'Кроссоверы', price_from: 25000, unit: 'руб.', order_index: 2 },
      { item_name: 'Внедорожники и минивэны', price_from: 25000, unit: 'руб.', order_index: 3 },
      { item_name: 'Представительский', price_from: 25000, unit: 'руб.', order_index: 4 },
      { item_name: 'Микроавтобусы', price_from: 30000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'liquid_glass',
    title: 'Жидкое стекло (защита до 1 года)',
    items: [
      { item_name: 'Средний класс', price_from: 10000, unit: 'руб.', order_index: 0 },
      { item_name: 'Бизнес', price_from: 12000, unit: 'руб.', order_index: 1 },
      { item_name: 'Кроссоверы', price_from: 12000, unit: 'руб.', order_index: 2 },
      { item_name: 'Внедорожники и минивэны', price_from: 12000, unit: 'руб.', order_index: 3 },
      { item_name: 'Представительский', price_from: 12000, unit: 'руб.', order_index: 4 },
      { item_name: 'Микроавтобусы', price_from: 15000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'detailing',
    title: 'Химчистка салона',
    items: [
      { item_name: 'Средний класс', price_from: 15000, unit: 'руб.', order_index: 0 },
      { item_name: 'Бизнес', price_from: 17000, unit: 'руб.', order_index: 1 },
      { item_name: 'Кроссоверы', price_from: 17000, unit: 'руб.', order_index: 2 },
      { item_name: 'Внедорожники и минивэны', price_from: 20000, unit: 'руб.', order_index: 3 },
      { item_name: 'Представительский', price_from: 20000, unit: 'руб.', order_index: 4 },
      { item_name: 'Микроавтобусы', price_from: 25000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'interior_protection',
    title: 'Защита и консервация салона',
    items: [
      { item_name: 'Обработка кожи и винила защитным молочком', price_from: 5000, unit: 'руб.', order_index: 0 },
      { item_name: 'Обработка кожи и винила керамическим составом', price_from: 15000, unit: 'руб.', order_index: 1 },
    ],
  },
  {
    id: 'interior_repair',
    title: 'Ремонт салона',
    items: [
      { item_name: 'Прожог от сигареты (потолок, стойки, обшивки)', price_from: 2000, unit: 'руб.', order_index: 0 },
      { item_name: 'Порез до 10 см (кожа и винил)', price_from: 6000, unit: 'руб.', order_index: 1 },
      { item_name: 'Покраска руля', price_from: 6000, unit: 'руб.', order_index: 2 },
      { item_name: 'Покраска сидения', price_from: 5000, unit: 'руб.', order_index: 3 },
      { item_name: 'Покраска небольших элементов (ручка КПП, подлокотник)', price_from: 2500, unit: 'руб.', order_index: 4 },
      { item_name: 'Ремонт обшивки двери', price_from: 3000, unit: 'руб.', order_index: 5 },
    ],
  },
  {
    id: 'dent_repair',
    title: 'Ремонт вмятин без покраски',
    items: [
      { item_name: 'Вмятина до 5 см', price_from: 2000, unit: 'руб.', order_index: 0 },
      { item_name: 'Вмятина от 5 до 10 см', price_from: 4000, unit: 'руб.', order_index: 1 },
      { item_name: 'Вмятина от 10 до 20 см', price_from: 6000, unit: 'руб.', order_index: 2 },
      { item_name: 'Удаление вмятин от града (крыша, капот, багажник)', price_from: 15000, unit: 'руб.', order_index: 3 },
    ],
  },
  {
    id: 'glass_repair',
    title: 'Ремонт лобовых стёкол',
    items: [
      { item_name: 'Скол до 1 см', price_from: 2000, unit: 'руб.', order_index: 0 },
      { item_name: 'Скол от 1 до 2 см', price_from: 3000, unit: 'руб.', order_index: 1 },
      { item_name: 'Остановка трещины', price_from: 1000, unit: 'руб.', order_index: 2 },
      { item_name: 'Заливка трещины до 20 см', price_from: 3000, unit: 'руб.', order_index: 3 },
    ],
  },
  {
    id: 'moto',
    title: 'Детейлинг мотоцикла',
    items: [
      { item_name: 'Полировка мотоцикла полная', price_from: 20000, unit: 'руб.', order_index: 0 },
      { item_name: 'Оклейка полиуретаном', price_from: 40000, unit: 'руб.', order_index: 1 },
      { item_name: 'Оклейка винилом', price_from: 20000, unit: 'руб.', order_index: 2 },
      { item_name: 'Оклейка одной детали', price_from: 4000, unit: 'руб.', order_index: 3 },
      { item_name: 'Оклейка шлема', price_from: 4000, unit: 'руб.', order_index: 4 },
      { item_name: 'Полировка бака', price_from: 4000, unit: 'руб.', order_index: 5 },
      { item_name: 'Полировка двигателя', price_from: 10000, unit: 'руб.', order_index: 6 },
      { item_name: 'Полировка пластика', price_from: 10000, unit: 'руб.', order_index: 7 },
      { item_name: 'Полировка фары', price_from: 2000, unit: 'руб.', order_index: 8 },
      { item_name: 'Полировка выхлопной трубы', price_from: 5000, unit: 'руб.', order_index: 9 },
      { item_name: 'Полировка алюминиевых деталей', price_from: 5000, unit: 'руб.', order_index: 10 },
      { item_name: 'Полировка хрома', price_from: 5000, unit: 'руб.', order_index: 11 },
      { item_name: 'Полировка коллектора', price_from: 6000, unit: 'руб.', order_index: 12 },
      { item_name: 'Полировка вилки', price_from: 5000, unit: 'руб.', order_index: 13 },
      { item_name: 'Полировка ступицы', price_from: 3000, unit: 'руб.', order_index: 14 },
      { item_name: 'Полировка ветрового стекла', price_from: 4000, unit: 'руб.', order_index: 15 },
    ],
  },
]

// Плоский список для прайс-листа в приложении (топ услуг)
export const STUDIO_PRICE_LIST = [
  { item_name: 'Оклейка полиуретаном — передняя часть', price_from: 90000, unit: 'руб.', order_index: 0 },
  { item_name: 'Оклейка полиуретаном — автомобиль целиком', price_from: 180000, unit: 'руб.', order_index: 1 },
  { item_name: 'Тонировка стёкол — средний класс', price_from: 9900, unit: 'руб.', order_index: 2 },
  { item_name: 'Тонировка стёкол — кроссовер / бизнес', price_from: 11900, unit: 'руб.', order_index: 3 },
  { item_name: 'Тонировка стёкол — внедорожник / премиум', price_from: 13900, unit: 'руб.', order_index: 4 },
  { item_name: 'Мягкая полировка — средний класс', price_from: 10000, unit: 'руб.', order_index: 5 },
  { item_name: 'Восстановительная полировка — средний класс', price_from: 15000, unit: 'руб.', order_index: 6 },
  { item_name: 'Керамическое покрытие — средний класс', price_from: 20000, unit: 'руб.', order_index: 7 },
  { item_name: 'Химчистка салона — средний класс', price_from: 15000, unit: 'руб.', order_index: 8 },
  { item_name: 'Химчистка салона — внедорожник', price_from: 20000, unit: 'руб.', order_index: 9 },
  { item_name: 'Ремонт лобового стекла — скол', price_from: 2000, unit: 'руб.', order_index: 10 },
  { item_name: 'Ремонт вмятины без покраски', price_from: 2000, unit: 'руб.', order_index: 11 },
]
