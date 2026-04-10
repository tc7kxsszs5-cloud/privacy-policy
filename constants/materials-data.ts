import type { MaterialFinish } from '@/components/CarViewer/bridge'

export type MaterialPreset = {
  id: string
  name: string
  finish: MaterialFinish
  colorHex: string
  brand?: string
  sku?: string
}

export const MATERIAL_PRESETS: MaterialPreset[] = [

  // ─── ГЛЯНЕЦ — 3M 1080 / Avery SW900 ──────────────────────────────────────
  { id: 'g-black',           name: 'Чёрный',              finish: 'gloss', colorHex: '#0d0d0d',  brand: '3M',   sku: '1080-G12'  },
  { id: 'g-midnight-black',  name: 'Полночный чёрный',    finish: 'gloss', colorHex: '#141414',  brand: '3M',   sku: '1080-G196' },
  { id: 'g-white',           name: 'Белый',               finish: 'gloss', colorHex: '#f2f2f0',  brand: '3M',   sku: '1080-G10'  },
  { id: 'g-oxford-white',    name: 'Оксфорд белый',       finish: 'gloss', colorHex: '#eeede8',  brand: '3M',   sku: '1080-G217' },
  { id: 'g-red',             name: 'Красный',             finish: 'gloss', colorHex: '#c80018',  brand: '3M',   sku: '1080-G211' },
  { id: 'g-hotrod-red',      name: 'Хот-род красный',     finish: 'gloss', colorHex: '#b80018',  brand: '3M',   sku: '1080-G13'  },
  { id: 'g-racing-red',      name: 'Гоночный красный',    finish: 'gloss', colorHex: '#cc0018',  brand: '3M',   sku: '1080-G377' },
  { id: 'g-fiery-orange',    name: 'Огненный оранжевый',  finish: 'gloss', colorHex: '#ff4800',  brand: '3M',   sku: '1080-G363' },
  { id: 'g-bright-orange',   name: 'Яркий оранжевый',     finish: 'gloss', colorHex: '#ff5c00',  brand: '3M',   sku: '1080-G17'  },
  { id: 'g-burnt-orange',    name: 'Жжёный оранжевый',    finish: 'gloss', colorHex: '#c84800',  brand: '3M',   sku: '1080-G36'  },
  { id: 'g-yellow',          name: 'Жёлтый',              finish: 'gloss', colorHex: '#f5d800',  brand: '3M',   sku: '1080-G257' },
  { id: 'g-bright-yellow',   name: 'Ярко-жёлтый',         finish: 'gloss', colorHex: '#ffda00',  brand: '3M',   sku: '1080-G15'  },
  { id: 'g-lemon',           name: 'Лимонный',            finish: 'gloss', colorHex: '#f0e000',  brand: '3M',   sku: '1080-G375' },
  { id: 'g-pink',            name: 'Розовый',             finish: 'gloss', colorHex: '#d4006a',  brand: '3M',   sku: '1080-G25'  },
  { id: 'g-rosy-red',        name: 'Розово-красный',      finish: 'gloss', colorHex: '#cc2030',  brand: '3M',   sku: '1080-G201' },
  { id: 'g-plum',            name: 'Слива',               finish: 'gloss', colorHex: '#5a1848',  brand: '3M',   sku: '1080-G327' },
  { id: 'g-deep-purple',     name: 'Тёмный фиолетовый',   finish: 'gloss', colorHex: '#380848',  brand: '3M',   sku: '1080-G326' },
  { id: 'g-purple',          name: 'Фиолетовый',          finish: 'gloss', colorHex: '#5a1870',  brand: '3M',   sku: '1080-G338' },
  { id: 'g-plum-explosion',  name: 'Взрыв сливы',         finish: 'gloss', colorHex: '#5c1050',  brand: '3M',   sku: '1080-G213' },
  { id: 'g-black-cherry',    name: 'Чёрная вишня',        finish: 'gloss', colorHex: '#400818',  brand: '3M',   sku: '1080-G341' },
  { id: 'g-sky-blue',        name: 'Небесный синий',      finish: 'gloss', colorHex: '#1a78cc',  brand: '3M',   sku: '1080-G317' },
  { id: 'g-ocean-blue',      name: 'Океанский синий',     finish: 'gloss', colorHex: '#1558a8',  brand: 'Avery', sku: 'SW900-195' },
  { id: 'g-intense-blue',    name: 'Интенсивный синий',   finish: 'gloss', colorHex: '#0a2878',  brand: '3M',   sku: '1080-G120' },
  { id: 'g-riviera-blue',    name: 'Ривьера синий',       finish: 'gloss', colorHex: '#0a4a90',  brand: '3M',   sku: '1080-G335' },
  { id: 'g-cosmic-blue',     name: 'Космический синий',   finish: 'gloss', colorHex: '#102060',  brand: '3M',   sku: '1080-G311' },
  { id: 'g-deep-blue-met',   name: 'Тёмно-синий металлик',finish: 'gloss', colorHex: '#183478',  brand: '3M',   sku: '1080-G263' },
  { id: 'g-blue-metallic',   name: 'Синий металлик',      finish: 'gloss', colorHex: '#2860a8',  brand: '3M',   sku: '1080-G329' },
  { id: 'g-atomic-teal',     name: 'Атомный тил',         finish: 'gloss', colorHex: '#008878',  brand: '3M',   sku: '1080-G173' },
  { id: 'g-pine-green',      name: 'Сосновый зелёный',    finish: 'gloss', colorHex: '#204830',  brand: '3M',   sku: '1080-G380' },
  { id: 'g-dark-green',      name: 'Тёмно-зелёный',       finish: 'gloss', colorHex: '#1a4a1a',  brand: '3M',   sku: '1080-G30'  },
  { id: 'g-kelly-green',     name: 'Изумрудный',          finish: 'gloss', colorHex: '#006030',  brand: '3M',   sku: '1080-G230' },
  { id: 'g-atomic-green',    name: 'Атомный зелёный',     finish: 'gloss', colorHex: '#00c040',  brand: '3M',   sku: '1080-G240' },
  { id: 'g-battleship-grey', name: 'Линкор серый',        finish: 'gloss', colorHex: '#808888',  brand: '3M',   sku: '1080-G321' },
  { id: 'g-storm-grey',      name: 'Грозовой серый',      finish: 'gloss', colorHex: '#787878',  brand: '3M',   sku: '1080-G325' },
  { id: 'g-anthracite',      name: 'Антрацит',            finish: 'gloss', colorHex: '#2e2e2e',  brand: '3M',   sku: '1080-G55'  },
  { id: 'g-dark-slate-grey', name: 'Тёмный сланец',       finish: 'gloss', colorHex: '#404850',  brand: '3M',   sku: '1080-G220' },
  { id: 'g-gunmetal-met',    name: 'Оружейный металлик',  finish: 'gloss', colorHex: '#585858',  brand: '3M',   sku: '1080-G381' },
  { id: 'g-silver-met',      name: 'Серебро металлик',    finish: 'gloss', colorHex: '#c0c4c8',  brand: '3M',   sku: '1080-G137' },
  { id: 'g-gold-met',        name: 'Золото металлик',     finish: 'gloss', colorHex: '#b8972e',  brand: '3M',   sku: '1080-G21'  },
  { id: 'g-chestnut',        name: 'Каштановый',          finish: 'gloss', colorHex: '#6a3820',  brand: '3M',   sku: '1080-G163' },
  { id: 'g-red-metallic',    name: 'Красный металлик',    finish: 'gloss', colorHex: '#a81828',  brand: '3M',   sku: '1080-G340' },
  { id: 'g-lava-red',        name: 'Лавовый красный',     finish: 'gloss', colorHex: '#b81020',  brand: '3M',   sku: '1080-G346' },
  { id: 'g-dragonfire-red',  name: 'Огонь дракона',       finish: 'gloss', colorHex: '#cc1800',  brand: '3M',   sku: '1080-G26'  },

  // ─── МАТ — 3M 1080 / Avery SW900 ─────────────────────────────────────────
  { id: 'm-black',           name: 'Чёрный',              finish: 'matte', colorHex: '#1a1a1a',  brand: '3M',   sku: '1080-M12'  },
  { id: 'm-deep-black',      name: 'Глубокий чёрный',     finish: 'matte', colorHex: '#0f0f0f',  brand: '3M',   sku: '1080-M36'  },
  { id: 'm-white',           name: 'Белый',               finish: 'matte', colorHex: '#e8eaea',  brand: '3M',   sku: '1080-M10'  },
  { id: 'm-dark-grey',       name: 'Тёмно-серый',         finish: 'matte', colorHex: '#3a3a3a',  brand: '3M',   sku: '1080-M14'  },
  { id: 'm-grey',            name: 'Серый',               finish: 'matte', colorHex: '#606060',  brand: '3M',   sku: '1080-M53'  },
  { id: 'm-light-grey',      name: 'Светло-серый',        finish: 'matte', colorHex: '#b0b0b0',  brand: '3M',   sku: '1080-M190' },
  { id: 'm-dove-grey',       name: 'Голубиный серый',     finish: 'matte', colorHex: '#909090',  brand: '3M',   sku: '1080-M217' },
  { id: 'm-graphite-met',    name: 'Графит металлик',     finish: 'matte', colorHex: '#484848',  brand: '3M',   sku: '1080-M20'  },
  { id: 'm-aluminium-met',   name: 'Алюминий металлик',   finish: 'matte', colorHex: '#909090',  brand: '3M',   sku: '1080-M21'  },
  { id: 'm-charcoal-met',    name: 'Антрацит металлик',   finish: 'matte', colorHex: '#484040',  brand: '3M',   sku: '1080-M22'  },
  { id: 'm-silver-met',      name: 'Серебро металлик',    finish: 'matte', colorHex: '#a0a0a0',  brand: '3M',   sku: '1080-M32'  },
  { id: 'm-red',             name: 'Красный',             finish: 'matte', colorHex: '#a01020',  brand: '3M',   sku: '1080-M201' },
  { id: 'm-racing-red',      name: 'Гоночный красный',    finish: 'matte', colorHex: '#981018',  brand: '3M',   sku: '1080-M40'  },
  { id: 'm-yellow',          name: 'Жёлтый',              finish: 'matte', colorHex: '#d8c000',  brand: '3M',   sku: '1080-M257' },
  { id: 'm-blue',            name: 'Синий',               finish: 'matte', colorHex: '#1a3060',  brand: '3M',   sku: '1080-M203' },
  { id: 'm-midnight-blue',   name: 'Полночный синий',     finish: 'matte', colorHex: '#1a2040',  brand: '3M',   sku: '1080-M196' },
  { id: 'm-thunder-blue',    name: 'Грозовой синий',      finish: 'matte', colorHex: '#283050',  brand: '3M',   sku: '1080-M263' },
  { id: 'm-blue-met',        name: 'Синий металлик',      finish: 'matte', colorHex: '#304878',  brand: '3M',   sku: '1080-M29'  },
  { id: 'm-kelly-green',     name: 'Изумрудный',          finish: 'matte', colorHex: '#285030',  brand: '3M',   sku: '1080-M230' },
  { id: 'm-forest-green',    name: 'Лесной зелёный',      finish: 'matte', colorHex: '#2a4028',  brand: '3M',   sku: '1080-M27'  },
  { id: 'm-military-green',  name: 'Военный зелёный',     finish: 'matte', colorHex: '#505828',  brand: '3M',   sku: '1080-M28'  },
  { id: 'm-tactical-green',  name: 'Тактический зелёный', finish: 'matte', colorHex: '#404828',  brand: '3M',   sku: '1080-M25'  },
  { id: 'm-sand',            name: 'Песочный',            finish: 'matte', colorHex: '#c0a870',  brand: '3M',   sku: '1080-M261' },
  { id: 'm-brown-met',       name: 'Коричневый металлик', finish: 'matte', colorHex: '#6a4828',  brand: '3M',   sku: '1080-M13'  },
  { id: 'm-dark-brown-met',  name: 'Тёмный коричневый',   finish: 'matte', colorHex: '#503828',  brand: '3M',   sku: '1080-M24'  },

  // ─── САТИН — 3M 1080 / Avery SW900 ───────────────────────────────────────
  { id: 's-black',           name: 'Чёрный',              finish: 'satin', colorHex: '#1a1a1a',  brand: '3M',   sku: '1080-S12'  },
  { id: 's-deep-black',      name: 'Глубокий чёрный',     finish: 'satin', colorHex: '#111111',  brand: '3M',   sku: '1080-S53'  },
  { id: 's-ink-black',       name: 'Чернильный чёрный',   finish: 'satin', colorHex: '#181818',  brand: '3M',   sku: '1080-S120' },
  { id: 's-white',           name: 'Белый',               finish: 'satin', colorHex: '#f0f0f0',  brand: '3M',   sku: '1080-S10'  },
  { id: 's-vapor-silver',    name: 'Серебристый',         finish: 'satin', colorHex: '#d0d0d0',  brand: '3M',   sku: '1080-S217' },
  { id: 's-chrome-aluminium',name: 'Хром алюминий',       finish: 'satin', colorHex: '#d0d4d8',  brand: '3M',   sku: '1080-S100' },
  { id: 's-silver-met',      name: 'Серебро металлик',    finish: 'satin', colorHex: '#b0b4b8',  brand: '3M',   sku: '1080-S137' },
  { id: 's-dark-grey',       name: 'Тёмно-серый',         finish: 'satin', colorHex: '#404040',  brand: '3M',   sku: '1080-S14'  },
  { id: 's-charcoal-met',    name: 'Антрацит металлик',   finish: 'satin', colorHex: '#505050',  brand: '3M',   sku: '1080-S22'  },
  { id: 's-red',             name: 'Красный',             finish: 'satin', colorHex: '#a81020',  brand: '3M',   sku: '1080-S201' },
  { id: 's-fiery-orange',    name: 'Огненный оранжевый',  finish: 'satin', colorHex: '#e04000',  brand: '3M',   sku: '1080-S363' },
  { id: 's-gold-met',        name: 'Золото металлик',     finish: 'satin', colorHex: '#b89040',  brand: '3M',   sku: '1080-S251' },
  { id: 's-cashmere',        name: 'Кашемир',             finish: 'satin', colorHex: '#c8b898',  brand: '3M',   sku: '1080-S257' },
  { id: 's-midnight-blue',   name: 'Полночный синий',     finish: 'satin', colorHex: '#1a2448',  brand: '3M',   sku: '1080-S196' },
  { id: 's-blue',            name: 'Синий',               finish: 'satin', colorHex: '#1a3870',  brand: '3M',   sku: '1080-S329' },
  { id: 's-purple',          name: 'Фиолетовый',          finish: 'satin', colorHex: '#501860',  brand: '3M',   sku: '1080-S338' },
  { id: 's-military-green',  name: 'Военный зелёный',     finish: 'satin', colorHex: '#484a28',  brand: '3M',   sku: '1080-S25'  },
  { id: 's-dark-green',      name: 'Тёмно-зелёный',       finish: 'satin', colorHex: '#203020',  brand: '3M',   sku: '1080-S26'  },
  // Avery SW900 Satin Metallic
  { id: 's-slate-met',       name: 'Серый металлик',      finish: 'satin', colorHex: '#808080',  brand: 'Avery', sku: 'SW900-782' },
  { id: 's-copper-met',      name: 'Медный металлик',     finish: 'satin', colorHex: '#a87458',  brand: 'Avery', sku: 'SW900-741' },
  { id: 's-champagne-met',   name: 'Шампань металлик',    finish: 'satin', colorHex: '#c4a962',  brand: 'Avery', sku: 'SW900-788' },
  { id: 's-choc-met',        name: 'Шоколад металлик',    finish: 'satin', colorHex: '#6b5544',  brand: 'Avery', sku: 'SW900-766' },
  { id: 's-dark-blue-met',   name: 'Тёмно-синий металлик',finish: 'satin', colorHex: '#404766',  brand: 'Avery', sku: 'SW900-685' },
  { id: 's-blue-met',        name: 'Синий металлик',      finish: 'satin', colorHex: '#0060a0',  brand: 'Avery', sku: 'SW900-684' },

  // ─── ПЕРЛАМУТР (Pearl) — 3M / Avery ──────────────────────────────────────
  { id: 'p-white',           name: 'Белый',               finish: 'pearl', colorHex: '#f2f0ef',  brand: 'Avery', sku: 'SW900-101' },
  { id: 'p-cream',           name: 'Сливочный',           finish: 'pearl', colorHex: '#f0e8d0',  brand: 'Avery', sku: 'SW900-102' },
  { id: 'p-silver',          name: 'Серебро',             finish: 'pearl', colorHex: '#d0d0d8',  brand: '3M',    sku: '1080-SP273' },
  { id: 'p-champagne',       name: 'Шампань',             finish: 'pearl', colorHex: '#d4c090',  brand: 'Avery', sku: 'SW900-191' },
  { id: 'p-gold',            name: 'Золотой',             finish: 'pearl', colorHex: '#c8a840',  brand: 'Avery', sku: 'SW900-712' },
  { id: 'p-rose-gold',       name: 'Розовое золото',      finish: 'pearl', colorHex: '#c8908a',  brand: 'Avery', sku: 'SW900-305' },
  { id: 'p-frozen-pink',     name: 'Морозный розовый',    finish: 'pearl', colorHex: '#e8b0c8',  brand: '3M',    sku: '1080-SP242' },
  { id: 'p-lilac',           name: 'Сиреневый',           finish: 'pearl', colorHex: '#c8a8e0',  brand: 'Avery', sku: 'SW900-497' },
  { id: 'p-sky',             name: 'Небесный',            finish: 'pearl', colorHex: '#a8d0f0',  brand: '3M',    sku: '1080-SP230' },
  { id: 'p-frozen-blue',     name: 'Ледяной синий',       finish: 'pearl', colorHex: '#8ab0e0',  brand: '3M',    sku: '1080-GP103' },
  { id: 'p-firemist-silver', name: 'Файрмист серебро',    finish: 'pearl', colorHex: '#c4c8cc',  brand: '3M',    sku: '1080-GP137' },
  { id: 'p-firemist-gold',   name: 'Файрмист золото',     finish: 'pearl', colorHex: '#c8a040',  brand: '3M',    sku: '1080-GP27'  },
  { id: 'p-mint',            name: 'Мятный',              finish: 'pearl', colorHex: '#a0e0c8',  brand: 'Avery', sku: 'SW900-442' },
  { id: 'p-green',           name: 'Зелёный',             finish: 'pearl', colorHex: '#88c0a0',  brand: 'Avery', sku: 'SW900-434' },
  { id: 'p-bronze',          name: 'Бронза',              finish: 'pearl', colorHex: '#a87040',  brand: 'Avery', sku: 'SW900-723' },
  { id: 'p-rose-titanium',   name: 'Розовый титан',       finish: 'pearl', colorHex: '#c09090',  brand: '3M',    sku: '1080-G251'  },
  { id: 'p-black',           name: 'Чёрный',              finish: 'pearl', colorHex: '#282828',  brand: 'Avery', sku: 'SW900-189' },

  // ─── КАРБОН — 3M / Avery ──────────────────────────────────────────────────
  { id: 'c-black',           name: 'Чёрный',              finish: 'carbon', colorHex: '#1c1c1c', brand: '3M',   sku: '1080-CFS10' },
  { id: 'c-dark-grey',       name: 'Тёмно-серый',         finish: 'carbon', colorHex: '#303030', brand: '3M',   sku: '1080-CFS12' },
  { id: 'c-grey',            name: 'Серый',               finish: 'carbon', colorHex: '#484848', brand: 'Avery', sku: 'SW900-CFM' },
  { id: 'c-red',             name: 'Красный',             finish: 'carbon', colorHex: '#801010', brand: '3M',   sku: '1080-CFS201'},
  { id: 'c-silver',          name: 'Серебряный',          finish: 'carbon', colorHex: '#909090', brand: 'Avery', sku: 'SW900-CFS' },
  { id: 'c-gold',            name: 'Золотой',             finish: 'carbon', colorHex: '#a08030', brand: 'Avery', sku: 'SW900-CFG' },

  // ─── ХРОМ — Avery / 3M ────────────────────────────────────────────────────
  { id: 'ch-silver',         name: 'Хром серебро',        finish: 'chrome', colorHex: '#d8d8d8', brand: 'Avery', sku: 'SW900-839' },
  { id: 'ch-black',          name: 'Хром чёрный',         finish: 'chrome', colorHex: '#222222', brand: 'Avery', sku: 'SW900-840' },
  { id: 'ch-gold',           name: 'Хром золото',         finish: 'chrome', colorHex: '#c8a800', brand: 'Avery', sku: 'SW900-841' },
  { id: 'ch-rose-gold',      name: 'Хром розовое золото', finish: 'chrome', colorHex: '#c89080', brand: 'Avery', sku: 'SW900-843' },
  { id: 'ch-blue',           name: 'Хром синий',          finish: 'chrome', colorHex: '#1840a0', brand: 'Avery', sku: 'SW900-846' },
  { id: 'ch-red',            name: 'Хром красный',        finish: 'chrome', colorHex: '#a00010', brand: 'Avery', sku: 'SW900-845' },
]

export const FINISH_LABELS: Record<MaterialFinish, string> = {
  gloss: 'Глянец', matte: 'Мат', satin: 'Сатин', pearl: 'Перламутр', carbon: 'Карбон', chrome: 'Хром'
}

export const GLASS_MESHES = [
  { meshName: 'glass_windshield', label: 'Лобовое' },
  { meshName: 'glass_rear',       label: 'Заднее' },
  { meshName: 'glass_side_fl',    label: 'Перед лево' },
  { meshName: 'glass_side_fr',    label: 'Перед право' },
  { meshName: 'glass_side_rl',    label: 'Зад лево' },
  { meshName: 'glass_side_rr',    label: 'Зад право' },
]
