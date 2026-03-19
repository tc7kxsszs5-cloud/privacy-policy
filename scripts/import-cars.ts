/**
 * Import car database from CSV into Supabase
 * Usage: bun run scripts/import-cars.ts /path/to/base.csv
 *
 * Creates tables: makes, car_models, car_generations
 * Filters by POPULAR_MAKES list (BMW, Mercedes, Audi, etc.)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY! // нужен service_role key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Марки которые показываем в каталоге
const POPULAR_MAKES = [
  'BMW', 'MERCEDES', 'AUDI', 'TOYOTA', 'KIA',
  'HYUNDAI', 'VOLKSWAGEN', 'LEXUS', 'PORSCHE',
  'LAND_ROVER', 'VOLVO', 'SKODA', 'MAZDA', 'NISSAN',
]

type Row = {
  'mark-id': string
  'mark-name': string
  'mark-cyrillic-name': string
  'mark-popular': string
  'country': string
  'model-id': string
  'model-name': string
  'model-cyrillic-name': string
  'class': string
  'year-from': string
  'year-to': string
  'generation-id': string
  'generation-name': string
  'year-start': string
  'year-stop': string
  'is-restyle': string
  'configuration-id': string
  'doors-count': string
  'body-type': string
}

function parseCSV(filePath: string): Row[] {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())
  const headers = lines[0].split(',')

  return lines.slice(1).map(line => {
    // Handle quoted fields with commas inside
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes }
      else if (char === ',' && !inQuotes) { values.push(current); current = '' }
      else { current += char }
    }
    values.push(current)

    const row: any = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row as Row
  })
}

function unique<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  return arr.filter(item => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: bun run scripts/import-cars.ts /path/to/base.csv')
    process.exit(1)
  }

  console.log('Parsing CSV...')
  const rows = parseCSV(csvPath)
  console.log(`Total rows: ${rows.length}`)

  // Filter popular makes
  const filtered = rows.filter(r =>
    POPULAR_MAKES.some(m => r['mark-id'].toUpperCase().startsWith(m))
  )
  console.log(`Rows after filter: ${filtered.length}`)

  // Extract unique makes
  const makes = unique(filtered, r => r['mark-id']).map(r => ({
    id: r['mark-id'],
    name: r['mark-name'],
    cyrillic_name: r['mark-cyrillic-name'],
    country: r['country'],
    popular: r['mark-popular'] === 'true',
  }))
  console.log(`Makes: ${makes.length}`)

  // Extract unique models
  const models = unique(filtered, r => r['model-id']).map(r => ({
    id: r['model-id'],
    make_id: r['mark-id'],
    name: r['model-name'],
    cyrillic_name: r['model-cyrillic-name'],
    class: r['class'],
    year_from: r['year-from'] ? parseInt(r['year-from']) : null,
    year_to: r['year-to'] ? parseInt(r['year-to']) : null,
  }))
  console.log(`Models: ${models.length}`)

  // Extract unique generations
  const generations = unique(filtered, r => r['generation-id']).map(r => ({
    id: r['generation-id'],
    model_id: r['model-id'],
    name: r['generation-name'],
    year_start: r['year-start'] ? parseInt(r['year-start']) : null,
    year_stop: r['year-stop'] ? parseInt(r['year-stop']) : null,
    is_restyle: r['is-restyle'] === 'true',
    glb_url: null,
    thumbnail_url: null,
  }))
  console.log(`Generations: ${generations.length}`)

  // Insert makes
  console.log('\nInserting makes...')
  const { error: makesError } = await supabase
    .from('makes')
    .upsert(makes, { onConflict: 'id' })
  if (makesError) { console.error('Makes error:', makesError.message); process.exit(1) }
  console.log('✓ Makes inserted')

  // Insert models in batches
  console.log('Inserting models...')
  for (let i = 0; i < models.length; i += 100) {
    const batch = models.slice(i, i + 100)
    const { error } = await supabase.from('car_models').upsert(batch, { onConflict: 'id' })
    if (error) { console.error('Models error:', error.message); process.exit(1) }
    process.stdout.write(`\r  ${Math.min(i + 100, models.length)}/${models.length}`)
  }
  console.log('\n✓ Models inserted')

  // Insert generations in batches
  console.log('Inserting generations...')
  for (let i = 0; i < generations.length; i += 100) {
    const batch = generations.slice(i, i + 100)
    const { error } = await supabase.from('car_generations').upsert(batch, { onConflict: 'id' })
    if (error) { console.error('Generations error:', error.message); process.exit(1) }
    process.stdout.write(`\r  ${Math.min(i + 100, generations.length)}/${generations.length}`)
  }
  console.log('\n✓ Generations inserted')

  console.log('\n✅ Import complete!')
}

main().catch(console.error)
