/**
 * Заполняет thumbnail_url для машин через Wikipedia API
 * Хранит URL напрямую (без загрузки в Storage)
 *
 * Запуск: bun scripts/fetch-car-thumbnails.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DELAY_MS = 300

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function getWikipediaThumbnail(make: string, model: string): Promise<string | null> {
  // Пробуем несколько вариантов запроса
  const queries = [
    `${make} ${model}`,
    `${make} ${model} automobile`,
  ]

  for (const q of queries) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'DetailingTimeApp/1.0 (car catalog; contact@flor-detailing.ru)' }
      })
      const searchData = await searchRes.json() as any
      const hits = searchData?.query?.search ?? []

      for (const hit of hits) {
        const title = hit.title as string
        // Пропускаем слишком общие статьи
        if (title.toLowerCase().includes('list of') || title.toLowerCase().includes('history')) continue

        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=800&format=json&origin=*`
        const imgRes = await fetch(imgUrl, {
          headers: { 'User-Agent': 'DetailingTimeApp/1.0 (car catalog; contact@flor-detailing.ru)' }
        })
        const imgData = await imgRes.json() as any
        const pages = imgData?.query?.pages ?? {}
        const page = Object.values(pages)[0] as any
        const thumb = page?.thumbnail?.source as string | undefined
        if (thumb) return thumb
      }
    } catch (e) {
      // Тихо продолжаем
    }
  }
  return null
}

async function main() {
  const { data: cars, error } = await supabase
    .from('cars')
    .select('make, model')
    .is('thumbnail_url', null)

  if (error) { console.error('DB error:', error.message); process.exit(1) }
  if (!cars?.length) { console.log('Все машины уже имеют thumbnail_url'); return }

  const unique = new Map<string, { make: string; model: string }>()
  for (const c of cars) {
    const key = `${c.make}__${c.model}`
    if (!unique.has(key)) unique.set(key, c)
  }

  console.log(`Моделей без thumbnail: ${unique.size}\n`)
  let done = 0, skipped = 0

  for (const { make, model } of unique.values()) {
    process.stdout.write(`[${done + skipped + 1}/${unique.size}] ${make} ${model} ... `)

    const thumbUrl = await getWikipediaThumbnail(make, model)
    if (!thumbUrl) {
      console.log('не найдено')
      skipped++
      await new Promise(r => setTimeout(r, DELAY_MS))
      continue
    }

    const { error: upd } = await supabase
      .from('cars')
      .update({ thumbnail_url: thumbUrl })
      .eq('make', make)
      .eq('model', model)

    if (upd) {
      console.log('❌ DB:', upd.message)
      skipped++
    } else {
      console.log('✓')
      done++
    }

    await new Promise(r => setTimeout(r, DELAY_MS))
  }

  console.log(`\nГотово: ✓ ${done}  пропущено: ${skipped}`)
}

main()
