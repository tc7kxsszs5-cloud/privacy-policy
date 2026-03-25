import type { MaterialFinish } from '@/components/CarViewer/bridge'

export type MaterialPreset = {
  id: string
  name: string
  finish: MaterialFinish
  colorHex: string
  brand?: string
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  // ─── Глянец ───────────────────────────────────────────────────
  { id: 'g-black',         name: 'Чёрный',           finish: 'gloss', colorHex: '#0d0e11' },
  { id: 'g-white',         name: 'Белый',             finish: 'gloss', colorHex: '#e6e9ee' },
  { id: 'g-red',           name: 'Красный',           finish: 'gloss', colorHex: '#b0000d' },
  { id: 'g-light-red',     name: 'Ярко-красный',      finish: 'gloss', colorHex: '#ff3020' },
  { id: 'g-orange',        name: 'Оранжевый',         finish: 'gloss', colorHex: '#fc6c00' },
  { id: 'g-light-orange',  name: 'Светло-оранжевый',  finish: 'gloss', colorHex: '#ff9630' },
  { id: 'g-red-orange',    name: 'Красно-оранжевый',  finish: 'gloss', colorHex: '#ff4200' },
  { id: 'g-red-salmon',    name: 'Лососевый',         finish: 'gloss', colorHex: '#fc5f40' },
  { id: 'g-yellow',        name: 'Жёлтый',            finish: 'gloss', colorHex: '#fec500' },
  { id: 'g-golden-yellow', name: 'Золотисто-жёлтый',  finish: 'gloss', colorHex: '#ffa800' },
  { id: 'g-brimstone',     name: 'Лимонно-жёлтый',   finish: 'gloss', colorHex: '#f2e210' },
  { id: 'g-cream',         name: 'Кремовый',          finish: 'gloss', colorHex: '#ebd494' },
  { id: 'g-pink',          name: 'Розовый',           finish: 'gloss', colorHex: '#c22b6b' },
  { id: 'g-soft-pink',     name: 'Нежно-розовый',     finish: 'gloss', colorHex: '#ed84b6' },
  { id: 'g-lilac',         name: 'Сиреневый',         finish: 'gloss', colorHex: '#e38be4' },
  { id: 'g-violet',        name: 'Фиолетовый',        finish: 'gloss', colorHex: '#5d2c68' },
  { id: 'g-blue',          name: 'Синий',             finish: 'gloss', colorHex: '#003a79' },
  { id: 'g-cobalt-blue',   name: 'Кобальт',           finish: 'gloss', colorHex: '#12226c' },
  { id: 'g-brilliant-blue',name: 'Ярко-синий',        finish: 'gloss', colorHex: '#1930ab' },
  { id: 'g-sky-blue',      name: 'Небесно-синий',     finish: 'gloss', colorHex: '#006ef5' },
  { id: 'g-light-blue',    name: 'Голубой',           finish: 'gloss', colorHex: '#0089c3' },
  { id: 'g-icy-blue',      name: 'Ледяной голубой',   finish: 'gloss', colorHex: '#a9bbff' },
  { id: 'g-ocean-grey',    name: 'Серо-синий',        finish: 'gloss', colorHex: '#598cc1' },
  { id: 'g-gentian-blue',  name: 'Горечавка',         finish: 'gloss', colorHex: '#004684' },
  { id: 'g-turquoise',     name: 'Бирюзовый',         finish: 'gloss', colorHex: '#009b97' },
  { id: 'g-turq-blue',     name: 'Тёмная бирюза',     finish: 'gloss', colorHex: '#00818c' },
  { id: 'g-mint',          name: 'Мятный',            finish: 'gloss', colorHex: '#5fcdb7' },
  { id: 'g-green',         name: 'Зелёный',           finish: 'gloss', colorHex: '#00784b' },
  { id: 'g-light-green',   name: 'Светло-зелёный',    finish: 'gloss', colorHex: '#00873c' },
  { id: 'g-yellow-green',  name: 'Жёлто-зелёный',     finish: 'gloss', colorHex: '#289901' },
  { id: 'g-neon-green',    name: 'Неон зелёный',      finish: 'gloss', colorHex: '#92f9b7' },
  { id: 'g-moss',          name: 'Болотный',          finish: 'gloss', colorHex: '#88a782' },
  { id: 'g-olive',         name: 'Оливковый',         finish: 'gloss', colorHex: '#45420e' },
  { id: 'g-bronze-green',  name: 'Бронзово-зелёный',  finish: 'gloss', colorHex: '#374609' },
  { id: 'g-silver',        name: 'Серебро',           finish: 'gloss', colorHex: '#c0c0c0' },
  { id: 'g-silver-grey',   name: 'Серебристо-серый',  finish: 'gloss', colorHex: '#686a6d' },
  { id: 'g-light-grey',    name: 'Светло-серый',      finish: 'gloss', colorHex: '#bfc2c0' },
  { id: 'g-grey',          name: 'Серый',             finish: 'gloss', colorHex: '#898989' },
  { id: 'g-dark-grey',     name: 'Тёмно-серый',       finish: 'gloss', colorHex: '#4b4c4c' },
  { id: 'g-gold',          name: 'Золотой',           finish: 'gloss', colorHex: '#756232' },
  { id: 'g-light-stone',   name: 'Светлый камень',    finish: 'gloss', colorHex: '#b68f45' },
  { id: 'g-beige',         name: 'Бежевый',           finish: 'gloss', colorHex: '#cec09f' },
  { id: 'g-brown',         name: 'Коричневый',        finish: 'gloss', colorHex: '#391818' },
  // Флуоресцентные
  { id: 'g-fl-yellow',     name: 'Флуо жёлтый',       finish: 'gloss', colorHex: '#defa04' },
  { id: 'g-fl-red',        name: 'Флуо красный',      finish: 'gloss', colorHex: '#f70f09' },
  { id: 'g-fl-pink',       name: 'Флуо розовый',      finish: 'gloss', colorHex: '#f60e88' },
  { id: 'g-fl-green',      name: 'Флуо зелёный',      finish: 'gloss', colorHex: '#3ad000' },

  // ─── Мат ──────────────────────────────────────────────────────
  { id: 'm-black',         name: 'Чёрный',            finish: 'matte', colorHex: '#1a1a1a' },
  { id: 'm-white',         name: 'Белый',             finish: 'matte', colorHex: '#eef1ff' },
  { id: 'm-grey',          name: 'Серый',             finish: 'matte', colorHex: '#666666' },
  { id: 'm-dark-grey',     name: 'Тёмно-серый',       finish: 'matte', colorHex: '#3a3a3a' },
  { id: 'm-blue',          name: 'Синий',             finish: 'matte', colorHex: '#1e3a5f' },
  { id: 'm-green',         name: 'Зелёный',           finish: 'matte', colorHex: '#2d5a27' },
  { id: 'm-red',           name: 'Красный',           finish: 'matte', colorHex: '#9b2020' },
  { id: 'm-olive',         name: 'Оливковый',         finish: 'matte', colorHex: '#4a4a1e' },
  { id: 'm-beige',         name: 'Бежевый',           finish: 'matte', colorHex: '#c9b99a' },
  { id: 'm-brown',         name: 'Коричневый',        finish: 'matte', colorHex: '#5e3a2a' },
  { id: 'm-sand',          name: 'Песочный',          finish: 'matte', colorHex: '#b5a28f' },
  { id: 'm-gold',          name: 'Золотой',           finish: 'matte', colorHex: '#b89030' },

  // ─── Сатин ────────────────────────────────────────────────────
  { id: 's-black',         name: 'Чёрный',            finish: 'satin', colorHex: '#111111' },
  { id: 's-white',         name: 'Белый',             finish: 'satin', colorHex: '#eeeeee' },
  { id: 's-silver',        name: 'Серебро',           finish: 'satin', colorHex: '#ced0d1', brand: '3M' },
  { id: 's-gold',          name: 'Золото',            finish: 'satin', colorHex: '#b89871', brand: '3M' },
  { id: 's-grey',          name: 'Серый',             finish: 'satin', colorHex: '#a8a8a8' },
  { id: 's-blue',          name: 'Синий',             finish: 'satin', colorHex: '#1a3a6e' },
  { id: 's-red',           name: 'Красный',           finish: 'satin', colorHex: '#aa1a1a' },
  // Металлик (сатин-металлик)
  { id: 's-slate-met',     name: 'Серый металлик',    finish: 'satin', colorHex: '#808080', brand: '3M' },
  { id: 's-charcoal-met',  name: 'Антрацит металлик', finish: 'satin', colorHex: '#6d6762', brand: '3M' },
  { id: 's-darkblue-met',  name: 'Тёмно-синий металлик', finish: 'satin', colorHex: '#404766', brand: '3M' },
  { id: 's-blue-met',      name: 'Синий металлик',    finish: 'satin', colorHex: '#0088b0', brand: '3M' },
  { id: 's-copper-met',    name: 'Медный металлик',   finish: 'satin', colorHex: '#a87458', brand: '3M' },
  { id: 's-gold-met',      name: 'Золотой металлик',  finish: 'satin', colorHex: '#c19770', brand: '3M' },
  { id: 's-champagne-met', name: 'Шампань металлик',  finish: 'satin', colorHex: '#c4a962', brand: '3M' },
  { id: 's-choc-met',      name: 'Шоколад металлик',  finish: 'satin', colorHex: '#6b5544', brand: '3M' },

  // ─── Карбон ───────────────────────────────────────────────────
  { id: 'c-black',         name: 'Карбон чёрный',     finish: 'carbon', colorHex: '#1c1c1c' },
  { id: 'c-grey',          name: 'Карбон серый',      finish: 'carbon', colorHex: '#3a3a3a' },

  // ─── Хром ─────────────────────────────────────────────────────
  { id: 'ch-silver',       name: 'Хром серебро',      finish: 'chrome', colorHex: '#d8d8d8' },
  { id: 'ch-black',        name: 'Хром чёрный',       finish: 'chrome', colorHex: '#222222' },
  { id: 'ch-gold',         name: 'Хром золото',       finish: 'chrome', colorHex: '#c8a800' },
]

export const FINISH_LABELS: Record<MaterialFinish, string> = {
  gloss: 'Глянец', matte: 'Мат', satin: 'Сатин', carbon: 'Карбон', chrome: 'Хром'
}

export const GLASS_MESHES = [
  { meshName: 'glass_windshield', label: 'Лобовое' },
  { meshName: 'glass_rear',       label: 'Заднее' },
  { meshName: 'glass_side_fl',    label: 'Перед лево' },
  { meshName: 'glass_side_fr',    label: 'Перед право' },
  { meshName: 'glass_side_rl',    label: 'Зад лево' },
  { meshName: 'glass_side_rr',    label: 'Зад право' },
]
