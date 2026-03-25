import { publicProcedure } from '../../trpc'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const carsBrands = publicProcedure
  .query(async () => {
    const { data, error } = await supabase.rpc('get_brands')
    if (error) throw new Error(error.message)
    return (data ?? []) as { name: string; count: number; thumbnail_url: string | null }[]
  })
