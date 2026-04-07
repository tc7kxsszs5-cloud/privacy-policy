import { supabase } from './supabase'

export type OrderStatus = 'pending' | 'reviewing' | 'confirmed' | 'done' | 'cancelled'

export type Order = {
  id: string
  client_id: string
  studio_id: string | null
  car_id: string
  car_name: string
  parts_config: PartConfig[]
  windows_config: WindowConfig[]
  status: OrderStatus
  client_notes: string
  studio_notes: string
  created_at: string
  updated_at: string
}

export type PartConfig = {
  part_id: string
  materialId: string
  colorHex: string
  finish: string
}

export type WindowConfig = {
  window_id: string
  tintPercent: number
}

export async function createOrder(order: {
  client_id: string
  car_id: string
  car_name: string
  parts_config: PartConfig[]
  windows_config: WindowConfig[]
  client_notes?: string
  studio_id?: string | null
}): Promise<Order> {
  let studioId = order.studio_id ?? null

  // Если студия не выбрана — берём первую (fallback)
  if (!studioId) {
    const { data: studio } = await supabase
      .from('studio_profiles')
      .select('id')
      .limit(1)
      .single()
    studioId = studio?.id ?? null
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, studio_id: studioId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Order
}

export async function getMyOrders(clientId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as Order[]
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Order
}

export async function getStudioOrders(studioId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('studio_id', studioId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as Order[]
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  studioNotes?: string
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, studio_notes: studioNotes, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Order
}
