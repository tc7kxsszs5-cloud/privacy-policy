import { z } from 'zod'
import { publicProcedure } from '../../trpc'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const carsGet = publicProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ input }) => {
    const { data: car, error } = await supabase
      .from('cars').select('*').eq('id', input.id).single()
    if (error) throw new Error(error.message)

    const { data: parts } = await supabase
      .from('car_parts').select('*').eq('car_id', input.id)

    return { ...car, parts: parts ?? [] }
  })
