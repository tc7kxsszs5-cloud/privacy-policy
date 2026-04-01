import { Asset } from 'expo-asset'
import { readAsStringAsync } from 'expo-file-system/legacy'
import { GLB_ASSETS, GlbKey } from './glb-assets'

// Exact model names from Supabase → GLB key
const MAPPING: Array<{ key: GlbKey; make: string; models: string[] }> = [
  { key: 'audi_rs5',               make: 'Audi',           models: ['RS 5'] },
  { key: 'bmw_1m',                 make: 'BMW',            models: ['1 серии'] },
  { key: 'bmw_m4_csl',             make: 'BMW',            models: ['M4'] },
  { key: 'bmw_m5_f90',             make: 'BMW',            models: ['M5'] },
  { key: 'bmw_x5_m',               make: 'BMW',            models: ['X5 M', 'X5'] },
  { key: 'bmw_x6_2020',            make: 'BMW',            models: ['X6', 'X6 M'] },
  { key: 'bmw_x7_m60i',            make: 'BMW',            models: ['X7'] },
  { key: 'bmw_x7',                 make: 'BMW',            models: ['XM'] },
  { key: 'cadillac_escalade',       make: 'Cadillac',       models: ['Escalade', 'Escalade ESV'] },
  { key: 'mercedes_amg_gt',         make: 'Mercedes-Benz',  models: ['AMG GT'] },
  { key: 'mercedes_c_class_2020',   make: 'Mercedes-Benz',  models: ['C-Class', 'C-Класс AMG'] },
  { key: 'mercedes_eqe',            make: 'Mercedes-Benz',  models: ['EQE', 'EQE AMG', 'EQE SUV', 'EQE SUV AMG'] },
  { key: 'mercedes_gls',            make: 'Mercedes-Benz',  models: ['GLS', 'GLS AMG'] },
  { key: 'mercedes_maybach_gls600', make: 'Mercedes-Benz',  models: ['Maybach GLS'] },
  { key: 'mercedes_sl65_amg',       make: 'Mercedes-Benz',  models: ['SL-Класс', 'SL-Класс AMG', 'Maybach SL'] },
  { key: 'mercedes_v8_biturbo',     make: 'Mercedes-Benz',  models: ['CLS', 'CLS AMG'] },
  { key: 'mercedes_v_class',        make: 'Mercedes-Benz',  models: ['V-Класс', 'Vito'] },
  { key: 'porsche_911_carrera_4s',  make: 'Porsche',        models: ['911', '911 GT2', '911 GT3', '911 R', '911 S/T'] },
  { key: 'ferrari_purosangue_2023', make: 'Ferrari',        models: ['Purosangue'] },
  { key: 'ferrari_laferrari',       make: 'Ferrari',        models: ['LaFerrari'] },
  { key: 'ferrari_599_gto',         make: 'Ferrari',        models: ['599 GTB Fiorano', '599 GTO'] },
  { key: 'ferrari_p45_pininfarina',          make: 'Ferrari',  models: ['P45 Pininfarina'] },
  { key: 'porsche_cayenne_turbo_coupe_2020', make: 'Porsche',       models: ['Cayenne Turbo Coupe', 'Cayenne Coupe', 'Cayenne Turbo'] },
  { key: 'rolls_royce_cullinan_2026',        make: 'Rolls-Royce',   models: ['Cullinan', 'Cullinan Black Badge'] },
  { key: 'rolls_royce_ghost',                make: 'Rolls-Royce',   models: ['Ghost', 'Ghost Series II'] },
  { key: 'rolls_royce_boattail',             make: 'Rolls-Royce',   models: ['Boat Tail'] },
  { key: 'porsche_cayenne_turbo_gt_2022',    make: 'Porsche',       models: ['Cayenne Turbo GT'] },
  { key: 'mercedes_g_class',                make: 'Mercedes-Benz', models: ['G-Класс', 'G-Класс AMG', 'G-Класс AMG 6x6', 'Maybach G 650 Landaulet'] },
]

export function getGlbKey(make: string, model: string): GlbKey | null {
  const entry = MAPPING.find(m => m.make === make && m.models.includes(model))
  return entry?.key ?? null
}

export async function loadGlbDataUri(key: GlbKey): Promise<string> {
  const asset = Asset.fromModule(GLB_ASSETS[key])
  await asset.downloadAsync()
  const base64 = await readAsStringAsync(asset.localUri!, { encoding: 'base64' })
  return `data:model/gltf-binary;base64,${base64}`
}
