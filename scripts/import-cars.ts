/**
 * Import car database from carsBase JSON into Supabase
 * Usage: bun run scripts/import-cars.ts /path/to/cars.json
 *
 * Source: https://github.com/blanzh/carsBase.git
 * Creates/populates tables: makes, car_models
 *
 * Requires env vars:
 *   EXPO_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY  (service_role key from Supabase Dashboard → Settings → API)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Only import popular marks (as flagged in carsBase)
const POPULAR_ONLY = true

// Only models up to date (active or recent)
const MIN_YEAR_TO = 2018

type CarsBaseMark = {
  id: string
  name: string
  cyrillic_name: string
  numeric_id: number
  year_from: number
  year_to: number
  popular: number
  country: string
  updated_at: string
  models: CarsBaseModel[]
}

type CarsBaseModel = {
  id: string
  mark_id: string
  name: string
  cyrillic_name: string
  year_from: number
  year_to: number
  class: string
  updated_at: string
}

async function main() {
  const jsonPath = process.argv[2]
  if (!jsonPath) {
    console.error('Usage: bun run scripts/import-cars.ts /path/to/cars.json')
    process.exit(1)
  }

  console.log('Reading JSON...')
  const raw = JSON.parse(readFileSync(jsonPath, 'utf-8')) as CarsBaseMark[]
  console.log(`Total marks: ${raw.length}`)

  // Filter marks
  const marks = raw.filter(m => !POPULAR_ONLY || m.popular === 1)
  console.log(`Marks after filter (popular only): ${marks.length}`)

  // Prepare makes rows
  const makesRows = marks.map(m => ({
    id: m.id,
    name: m.name,
    cyrillic_name: m.cyrillic_name,
    country: m.country,
    popular: m.popular === 1,
    logo_url: '',
  }))

  // Prepare models rows (filter recent models only)
  const modelsRows = marks.flatMap(m =>
    m.models
      .filter(mo => !mo.year_to || mo.year_to >= MIN_YEAR_TO)
      .map(mo => ({
        id: mo.id,
        make_id: m.id,
        name: mo.name,
        cyrillic_name: mo.cyrillic_name,
        class: mo.class,
        year_from: mo.year_from ?? null,
        year_to: mo.year_to ?? null,
      }))
  )

  console.log(`Models after filter (year_to >= ${MIN_YEAR_TO}): ${modelsRows.length}`)

  // Insert makes
  console.log('\nInserting makes...')
  const { error: makesError } = await supabase
    .from('makes')
    .upsert(makesRows, { onConflict: 'id' })
  if (makesError) {
    console.error('Makes error:', makesError.message)
    process.exit(1)
  }
  console.log(`✓ ${makesRows.length} makes inserted`)

  // Insert models in batches of 200
  console.log('Inserting models...')
  const BATCH = 200
  for (let i = 0; i < modelsRows.length; i += BATCH) {
    const batch = modelsRows.slice(i, i + BATCH)
    const { error } = await supabase.from('car_models').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error('Models error:', error.message)
      process.exit(1)
    }
    process.stdout.write(`\r  ${Math.min(i + BATCH, modelsRows.length)}/${modelsRows.length}`)
  }
  console.log('\n✓ Models inserted')

  console.log('\n✅ Import complete!')
  console.log(`  Makes: ${makesRows.length}`)
  console.log(`  Models: ${modelsRows.length}`)
  console.log('\nNext: run schema-cars.sql in Supabase Dashboard → SQL Editor first if tables are missing')
}

main().catch(console.error)
