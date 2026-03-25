import { publicProcedure } from '../../trpc'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const carsBrands = publicProcedure
  .query(async () => {
    const { data, error } = await supabase
      .from('cars')
      .select('make, model, thumbnail_url')
      .order('make')
      .limit(10000)
    if (error) throw new Error(error.message)

    const map: Record<string, { count: number; thumbnail_url?: string | null }> = {}
    for (const c of data ?? []) {
      if (!map[c.make]) map[c.make] = { count: 0, thumbnail_url: c.thumbnail_url }
      map[c.make].count++
      if (!map[c.make].thumbnail_url && c.thumbnail_url) {
        map[c.make].thumbnail_url = c.thumbnail_url
      }
    }
    return Object.entries(map).map(([name, v]) => ({
      name,
      count: v.count,
      thumbnail_url: v.thumbnail_url ?? null,
    }))
  })
