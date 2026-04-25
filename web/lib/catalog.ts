export type Finish = 'gloss' | 'matte' | 'satin' | 'pearl' | 'carbon' | 'chrome'

export type Material = {
  id: string
  name: string
  finish: Finish
  colorHex: string
  brand?: string
  sku?: string
}

export const FINISH_LABELS: Record<Finish, string> = {
  gloss: 'Глянец',
  matte: 'Матовый',
  satin: 'Сатин',
  pearl: 'Перламутр',
  carbon: 'Карбон',
  chrome: 'Хром',
}

export const FINISHES: Finish[] = ['gloss', 'matte', 'satin', 'pearl', 'carbon', 'chrome']

export const MATERIALS: Material[] = [
  // ГЛЯНЕЦ
  { id: 'g-black', name: 'Чёрный', finish: 'gloss', colorHex: '#0d0d0d', brand: '3M', sku: '1080-G12' },
  { id: 'g-midnight-black', name: 'Полночный чёрный', finish: 'gloss', colorHex: '#141414', brand: '3M', sku: '1080-G196' },
  { id: 'g-white', name: 'Белый', finish: 'gloss', colorHex: '#f2f2f0', brand: '3M', sku: '1080-G10' },
  { id: 'g-oxford-white', name: 'Оксфорд белый', finish: 'gloss', colorHex: '#eeede8', brand: '3M', sku: '1080-G217' },
  { id: 'g-red', name: 'Красный', finish: 'gloss', colorHex: '#c80018', brand: '3M', sku: '1080-G211' },
  { id: 'g-hotrod-red', name: 'Хот-род красный', finish: 'gloss', colorHex: '#b80018', brand: '3M', sku: '1080-G13' },
  { id: 'g-racing-red', name: 'Гоночный красный', finish: 'gloss', colorHex: '#cc0018', brand: '3M', sku: '1080-G377' },
  { id: 'g-fiery-orange', name: 'Огненный оранжевый', finish: 'gloss', colorHex: '#ff4800', brand: '3M', sku: '1080-G363' },
  { id: 'g-bright-orange', name: 'Яркий оранжевый', finish: 'gloss', colorHex: '#ff5c00', brand: '3M', sku: '1080-G17' },
  { id: 'g-burnt-orange', name: 'Жжёный оранжевый', finish: 'gloss', colorHex: '#c84800', brand: '3M', sku: '1080-G36' },
  { id: 'g-yellow', name: 'Жёлтый', finish: 'gloss', colorHex: '#f5d800', brand: '3M', sku: '1080-G257' },
  { id: 'g-bright-yellow', name: 'Ярко-жёлтый', finish: 'gloss', colorHex: '#ffda00', brand: '3M', sku: '1080-G15' },
  { id: 'g-lemon', name: 'Лимонный', finish: 'gloss', colorHex: '#f0e000', brand: '3M', sku: '1080-G375' },
  { id: 'g-pink', name: 'Розовый', finish: 'gloss', colorHex: '#d4006a', brand: '3M', sku: '1080-G25' },
  { id: 'g-plum', name: 'Слива', finish: 'gloss', colorHex: '#5a1848', brand: '3M', sku: '1080-G327' },
  { id: 'g-deep-purple', name: 'Тёмный фиолетовый', finish: 'gloss', colorHex: '#380848', brand: '3M', sku: '1080-G326' },
  { id: 'g-purple', name: 'Фиолетовый', finish: 'gloss', colorHex: '#5a1870', brand: '3M', sku: '1080-G338' },
  { id: 'g-sky-blue', name: 'Небесный синий', finish: 'gloss', colorHex: '#1a78cc', brand: '3M', sku: '1080-G317' },
  { id: 'g-ocean-blue', name: 'Океанский синий', finish: 'gloss', colorHex: '#1558a8', brand: 'Avery', sku: 'SW900-195' },
  { id: 'g-intense-blue', name: 'Интенсивный синий', finish: 'gloss', colorHex: '#0a2878', brand: '3M', sku: '1080-G120' },
  { id: 'g-cosmic-blue', name: 'Космический синий', finish: 'gloss', colorHex: '#102060', brand: '3M', sku: '1080-G311' },
  { id: 'g-blue-metallic', name: 'Синий металлик', finish: 'gloss', colorHex: '#2860a8', brand: '3M', sku: '1080-G329' },
  { id: 'g-atomic-teal', name: 'Атомный тил', finish: 'gloss', colorHex: '#008878', brand: '3M', sku: '1080-G173' },
  { id: 'g-pine-green', name: 'Сосновый зелёный', finish: 'gloss', colorHex: '#204830', brand: '3M', sku: '1080-G380' },
  { id: 'g-dark-green', name: 'Тёмно-зелёный', finish: 'gloss', colorHex: '#1a4a1a', brand: '3M', sku: '1080-G30' },
  { id: 'g-atomic-green', name: 'Атомный зелёный', finish: 'gloss', colorHex: '#00c040', brand: '3M', sku: '1080-G240' },
  { id: 'g-battleship-grey', name: 'Линкор серый', finish: 'gloss', colorHex: '#808888', brand: '3M', sku: '1080-G321' },
  { id: 'g-storm-grey', name: 'Грозовой серый', finish: 'gloss', colorHex: '#787878', brand: '3M', sku: '1080-G325' },
  { id: 'g-anthracite', name: 'Антрацит', finish: 'gloss', colorHex: '#2e2e2e', brand: '3M', sku: '1080-G55' },
  { id: 'g-silver-met', name: 'Серебро металлик', finish: 'gloss', colorHex: '#c0c4c8', brand: '3M', sku: '1080-G137' },
  { id: 'g-gold-met', name: 'Золото металлик', finish: 'gloss', colorHex: '#b8972e', brand: '3M', sku: '1080-G21' },
  { id: 'g-red-metallic', name: 'Красный металлик', finish: 'gloss', colorHex: '#a81828', brand: '3M', sku: '1080-G340' },
  // МАТ
  { id: 'm-black', name: 'Чёрный', finish: 'matte', colorHex: '#1a1a1a', brand: '3M', sku: '1080-M12' },
  { id: 'm-deep-black', name: 'Глубокий чёрный', finish: 'matte', colorHex: '#0f0f0f', brand: '3M', sku: '1080-M36' },
  { id: 'm-white', name: 'Белый', finish: 'matte', colorHex: '#e8eaea', brand: '3M', sku: '1080-M10' },
  { id: 'm-dark-grey', name: 'Тёмно-серый', finish: 'matte', colorHex: '#3a3a3a', brand: '3M', sku: '1080-M14' },
  { id: 'm-grey', name: 'Серый', finish: 'matte', colorHex: '#606060', brand: '3M', sku: '1080-M53' },
  { id: 'm-light-grey', name: 'Светло-серый', finish: 'matte', colorHex: '#b0b0b0', brand: '3M', sku: '1080-M190' },
  { id: 'm-graphite-met', name: 'Графит металлик', finish: 'matte', colorHex: '#484848', brand: '3M', sku: '1080-M20' },
  { id: 'm-silver-met', name: 'Серебро металлик', finish: 'matte', colorHex: '#a0a0a0', brand: '3M', sku: '1080-M32' },
  { id: 'm-red', name: 'Красный', finish: 'matte', colorHex: '#a01020', brand: '3M', sku: '1080-M201' },
  { id: 'm-racing-red', name: 'Гоночный красный', finish: 'matte', colorHex: '#981018', brand: '3M', sku: '1080-M40' },
  { id: 'm-yellow', name: 'Жёлтый', finish: 'matte', colorHex: '#d8c000', brand: '3M', sku: '1080-M257' },
  { id: 'm-blue', name: 'Синий', finish: 'matte', colorHex: '#1a3060', brand: '3M', sku: '1080-M203' },
  { id: 'm-midnight-blue', name: 'Полночный синий', finish: 'matte', colorHex: '#1a2040', brand: '3M', sku: '1080-M196' },
  { id: 'm-blue-met', name: 'Синий металлик', finish: 'matte', colorHex: '#304878', brand: '3M', sku: '1080-M29' },
  { id: 'm-kelly-green', name: 'Изумрудный', finish: 'matte', colorHex: '#285030', brand: '3M', sku: '1080-M230' },
  { id: 'm-forest-green', name: 'Лесной зелёный', finish: 'matte', colorHex: '#2a4028', brand: '3M', sku: '1080-M27' },
  { id: 'm-military-green', name: 'Военный зелёный', finish: 'matte', colorHex: '#505828', brand: '3M', sku: '1080-M28' },
  { id: 'm-sand', name: 'Песочный', finish: 'matte', colorHex: '#c0a870', brand: '3M', sku: '1080-M261' },
  { id: 'm-brown-met', name: 'Коричневый металлик', finish: 'matte', colorHex: '#6a4828', brand: '3M', sku: '1080-M13' },
  // САТИН
  { id: 's-black', name: 'Чёрный', finish: 'satin', colorHex: '#1a1a1a', brand: '3M', sku: '1080-S12' },
  { id: 's-white', name: 'Белый', finish: 'satin', colorHex: '#f0f0f0', brand: '3M', sku: '1080-S10' },
  { id: 's-vapor-silver', name: 'Серебристый', finish: 'satin', colorHex: '#d0d0d0', brand: '3M', sku: '1080-S217' },
  { id: 's-dark-grey', name: 'Тёмно-серый', finish: 'satin', colorHex: '#404040', brand: '3M', sku: '1080-S14' },
  { id: 's-red', name: 'Красный', finish: 'satin', colorHex: '#a81020', brand: '3M', sku: '1080-S201' },
  { id: 's-gold-met', name: 'Золото металлик', finish: 'satin', colorHex: '#b89040', brand: '3M', sku: '1080-S251' },
  { id: 's-midnight-blue', name: 'Полночный синий', finish: 'satin', colorHex: '#1a2448', brand: '3M', sku: '1080-S196' },
  { id: 's-blue', name: 'Синий', finish: 'satin', colorHex: '#1a3870', brand: '3M', sku: '1080-S329' },
  { id: 's-purple', name: 'Фиолетовый', finish: 'satin', colorHex: '#501860', brand: '3M', sku: '1080-S338' },
  { id: 's-military-green', name: 'Военный зелёный', finish: 'satin', colorHex: '#484a28', brand: '3M', sku: '1080-S25' },
  { id: 's-copper-met', name: 'Медный металлик', finish: 'satin', colorHex: '#a87458', brand: 'Avery', sku: 'SW900-741' },
  { id: 's-champagne-met', name: 'Шампань металлик', finish: 'satin', colorHex: '#c4a962', brand: 'Avery', sku: 'SW900-788' },
  // ПЕРЛАМУТР
  { id: 'p-white', name: 'Белый', finish: 'pearl', colorHex: '#f2f0ef', brand: 'Avery', sku: 'SW900-101' },
  { id: 'p-cream', name: 'Сливочный', finish: 'pearl', colorHex: '#f0e8d0', brand: 'Avery', sku: 'SW900-102' },
  { id: 'p-silver', name: 'Серебро', finish: 'pearl', colorHex: '#d0d0d8', brand: '3M', sku: '1080-SP273' },
  { id: 'p-champagne', name: 'Шампань', finish: 'pearl', colorHex: '#d4c090', brand: 'Avery', sku: 'SW900-191' },
  { id: 'p-gold', name: 'Золотой', finish: 'pearl', colorHex: '#c8a840', brand: 'Avery', sku: 'SW900-712' },
  { id: 'p-rose-gold', name: 'Розовое золото', finish: 'pearl', colorHex: '#c8908a', brand: 'Avery', sku: 'SW900-305' },
  { id: 'p-frozen-pink', name: 'Морозный розовый', finish: 'pearl', colorHex: '#e8b0c8', brand: '3M', sku: '1080-SP242' },
  { id: 'p-lilac', name: 'Сиреневый', finish: 'pearl', colorHex: '#c8a8e0', brand: 'Avery', sku: 'SW900-497' },
  { id: 'p-sky', name: 'Небесный', finish: 'pearl', colorHex: '#a8d0f0', brand: '3M', sku: '1080-SP230' },
  { id: 'p-mint', name: 'Мятный', finish: 'pearl', colorHex: '#a0e0c8', brand: 'Avery', sku: 'SW900-442' },
  { id: 'p-bronze', name: 'Бронза', finish: 'pearl', colorHex: '#a87040', brand: 'Avery', sku: 'SW900-723' },
  // КАРБОН
  { id: 'c-black', name: 'Чёрный', finish: 'carbon', colorHex: '#1c1c1c', brand: '3M', sku: '1080-CFS10' },
  { id: 'c-dark-grey', name: 'Тёмно-серый', finish: 'carbon', colorHex: '#303030', brand: '3M', sku: '1080-CFS12' },
  { id: 'c-grey', name: 'Серый', finish: 'carbon', colorHex: '#484848', brand: 'Avery', sku: 'SW900-CFM' },
  { id: 'c-red', name: 'Красный', finish: 'carbon', colorHex: '#801010', brand: '3M', sku: '1080-CFS201' },
  { id: 'c-silver', name: 'Серебряный', finish: 'carbon', colorHex: '#909090', brand: 'Avery', sku: 'SW900-CFS' },
  { id: 'c-gold', name: 'Золотой', finish: 'carbon', colorHex: '#a08030', brand: 'Avery', sku: 'SW900-CFG' },
  // ХРОМ
  { id: 'ch-silver', name: 'Хром серебро', finish: 'chrome', colorHex: '#d8d8d8', brand: 'Avery', sku: 'SW900-839' },
  { id: 'ch-black', name: 'Хром чёрный', finish: 'chrome', colorHex: '#222222', brand: 'Avery', sku: 'SW900-840' },
  { id: 'ch-gold', name: 'Хром золото', finish: 'chrome', colorHex: '#c8a800', brand: 'Avery', sku: 'SW900-841' },
  { id: 'ch-rose-gold', name: 'Хром розовое золото', finish: 'chrome', colorHex: '#c89080', brand: 'Avery', sku: 'SW900-843' },
  { id: 'ch-blue', name: 'Хром синий', finish: 'chrome', colorHex: '#1840a0', brand: 'Avery', sku: 'SW900-846' },
  { id: 'ch-red', name: 'Хром красный', finish: 'chrome', colorHex: '#a00010', brand: 'Avery', sku: 'SW900-845' },
]
