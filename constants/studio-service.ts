import { supabase } from './supabase'

export type StudioProfile = {
  id: string
  user_id: string
  name: string
  description: string
  address: string
  phone: string
  telegram: string
  whatsapp: string
  logo_url: string
  created_at: string
}

export type PriceItem = {
  id: string
  studio_id: string
  item_name: string
  price_from: number
  price_to?: number
  unit: string
  order_index: number
}

export type StudioProfileWithPriceList = StudioProfile & { price_list: PriceItem[] }

export async function getStudioProfile(): Promise<StudioProfileWithPriceList | null> {
  const { data, error } = await supabase
    .from('studio_profiles')
    .select('*, price_list(*)')
    .order('order_index', { referencedTable: 'price_list' })
    .limit(1)
    .single()
  if (error) return null
  return data as StudioProfileWithPriceList
}

export async function upsertStudioProfile(userId: string, profile: Partial<StudioProfile>) {
  const { data, error } = await supabase
    .from('studio_profiles')
    .upsert({ user_id: userId, ...profile })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updatePriceList(studioId: string, items: Omit<PriceItem, 'id' | 'studio_id'>[]) {
  await supabase.from('price_list').delete().eq('studio_id', studioId)
  const { data, error } = await supabase
    .from('price_list')
    .insert(items.map(item => ({ ...item, studio_id: studioId })))
    .select()
  if (error) throw new Error(error.message)
  return data
}
