import { z } from 'zod'
import { publicProcedure } from '../../trpc'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const carsList = publicProcedure
  .input(z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    yearFrom: z.number().optional(),
    yearTo: z.number().optional(),
  }).optional())
  .query(async ({ input }) => {
    let query = supabase.from('cars').select('*').order('make').order('model').limit(10000)
    if (input?.make) query = query.eq('make', input.make)
    if (input?.model) query = query.eq('model', input.model)
    if (input?.yearFrom) query = query.gte('year_from', input.yearFrom)
    if (input?.yearTo) query = query.lte('year_to', input.yearTo)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
  })
