import { Asset } from 'expo-asset'
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
  { key: 'mercedes_c_class_2020',   make: 'Mercedes-Benz',  models: ['C-Class'] },
  { key: 'mercedes_eqe',            make: 'Mercedes-Benz',  models: ['EQE', 'EQE AMG', 'EQE SUV', 'EQE SUV AMG'] },
  { key: 'mercedes_gls',            make: 'Mercedes-Benz',  models: ['GLS', 'GLS AMG'] },
  { key: 'mercedes_maybach_gls600', make: 'Mercedes-Benz',  models: ['Maybach GLS'] },
  { key: 'mercedes_sl65_amg',       make: 'Mercedes-Benz',  models: ['SL-Класс', 'SL-Класс AMG', 'Maybach SL'] },
  { key: 'mercedes_v8_biturbo',     make: 'Mercedes-Benz',  models: ['CLS', 'CLS AMG'] },
  { key: 'mercedes_v_class',        make: 'Mercedes-Benz',  models: ['V-Класс', 'Vito'] },
  { key: 'porsche_911_carrera_4s',  make: 'Porsche',        models: ['911', '911 GT2', '911 GT3', '911 R', '911 S/T'] },
]

export async function resolveGlbUri(make: string, model: string): Promise<string | null> {
  const entry = MAPPING.find(
    m => m.make === make && m.models.includes(model)
  )
  if (!entry) return null

  const asset = Asset.fromModule(GLB_ASSETS[entry.key])
  await asset.downloadAsync()
  return asset.localUri ?? asset.uri ?? null
}
