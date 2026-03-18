import type { MaterialFinish } from '@/components/CarViewer/bridge'

export type MaterialPreset = {
  id: string
  name: string
  finish: MaterialFinish
  colorHex: string
  brand?: string
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  // Gloss
  { id: 'gloss-black',   name: 'Чёрный глянец',   finish: 'gloss', colorHex: '#0a0a0a' },
  { id: 'gloss-white',   name: 'Белый глянец',     finish: 'gloss', colorHex: '#f5f5f5' },
  { id: 'gloss-red',     name: 'Красный глянец',   finish: 'gloss', colorHex: '#cc0000' },
  { id: 'gloss-blue',    name: 'Синий глянец',     finish: 'gloss', colorHex: '#1a3a8f' },
  { id: 'gloss-silver',  name: 'Серебро глянец',   finish: 'gloss', colorHex: '#c0c0c0' },
  { id: 'gloss-gold',    name: 'Золото глянец',    finish: 'gloss', colorHex: '#d4a017' },
  // Matte
  { id: 'matte-black',   name: 'Чёрный мат',       finish: 'matte', colorHex: '#1a1a1a' },
  { id: 'matte-white',   name: 'Белый мат',        finish: 'matte', colorHex: '#e8e8e8' },
  { id: 'matte-grey',    name: 'Серый мат',        finish: 'matte', colorHex: '#666666' },
  { id: 'matte-green',   name: 'Зелёный мат',      finish: 'matte', colorHex: '#2d5a27' },
  { id: 'matte-blue',    name: 'Синий мат',        finish: 'matte', colorHex: '#1e3a5f' },
  { id: 'matte-beige',   name: 'Бежевый мат',      finish: 'matte', colorHex: '#c9b99a' },
  // Satin
  { id: 'satin-black',   name: 'Чёрный сатин',     finish: 'satin', colorHex: '#111111' },
  { id: 'satin-silver',  name: 'Серебро сатин',    finish: 'satin', colorHex: '#a8a8a8' },
  { id: 'satin-white',   name: 'Белый сатин',      finish: 'satin', colorHex: '#eeeeee' },
  // Carbon
  { id: 'carbon-black',  name: 'Карбон чёрный',    finish: 'carbon', colorHex: '#1c1c1c' },
  { id: 'carbon-grey',   name: 'Карбон серый',     finish: 'carbon', colorHex: '#3a3a3a' },
  // Chrome
  { id: 'chrome-silver', name: 'Хром серебро',     finish: 'chrome', colorHex: '#d8d8d8' },
  { id: 'chrome-black',  name: 'Хром чёрный',      finish: 'chrome', colorHex: '#222222' },
  { id: 'chrome-gold',   name: 'Хром золото',      finish: 'chrome', colorHex: '#c8a800' },
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
