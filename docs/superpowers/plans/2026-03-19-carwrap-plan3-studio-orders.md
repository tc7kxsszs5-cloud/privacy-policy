# CarWrap App — Plan 3: Studio Profile, Orders & Support

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить профиль студии "Флор" с прайс-листом, флоу заявок клиента (выбрал конфигурацию → отправил заявку → приехал в офис → оплатил), экраны истории заказов, дашборд студии и экран поддержки.

**Architecture:** Supabase хранит профиль студии, прайс-лист и заказы. Клиент отправляет конфигурацию 3D-редактора как заявку (`orders` table). Студия видит входящие заявки в дашборде. Оплата — только офлайн, в приложении кнопки оплаты нет. Суппорт — контактная информация + Telegram/WhatsApp ссылки.

**Tech Stack:** Expo SDK 55, expo-router v5, Supabase JS v2, tRPC + Hono, Zustand, @gorhom/bottom-sheet, react-native-reanimated

**Deadline:** Plan 3 полностью готов к 2026-03-24

---

## Project Location

`/Users/mac/dev/carwrap/`

---

## File Map

```
app/
  index.tsx                        # Home screen — лендинг с CTA кнопками
  studio/
    index.tsx                      # Studio public profile (видит клиент)
    dashboard.tsx                  # Studio incoming orders dashboard (роль: studio)
    setup.tsx                      # Studio onboarding — заполнить профиль
  orders/
    index.tsx                      # Client orders list — мои заявки
    [id].tsx                       # Order detail — детали заявки

  support.tsx                      # Support screen — контакты, FAQ

components/
  studio/
    StudioCard.tsx                 # Карточка студии (лого, имя, адрес, рейтинг)
    PriceList.tsx                  # Прайс-лист студии
    OrderCard.tsx                  # Карточка заявки (статус, авто, дата)

constants/
  orders-store.ts                  # Zustand store для заявок (оптимистичные обновления)

backend/
  routes/
    orders.ts                      # tRPC: orders.create, orders.list, orders.get, orders.updateStatus
    studio.ts                      # tRPC: studio.getProfile, studio.updateProfile, studio.updatePriceList
```

---

## Supabase Schema (выполнить вручную в Supabase Dashboard → SQL Editor)

```sql
-- Профиль студии
create table studio_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null default 'Флор',
  description text default 'Профессиональная оклейка автомобилей',
  address text default '',
  phone text default '',
  telegram text default '',
  whatsapp text default '',
  logo_url text default '',
  created_at timestamptz default now()
);

alter table studio_profiles enable row level security;
create policy "Studio can update own profile" on studio_profiles
  for all using (auth.uid() = user_id);
create policy "Anyone can view studio profiles" on studio_profiles
  for select using (true);

-- Прайс-лист
create table price_list (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studio_profiles(id) on delete cascade,
  item_name text not null,
  price_from int not null default 0,
  price_to int,
  unit text default 'руб.',
  order_index int default 0
);

alter table price_list enable row level security;
create policy "Studio can manage own price list" on price_list
  for all using (
    studio_id in (select id from studio_profiles where user_id = auth.uid())
  );
create policy "Anyone can view price list" on price_list
  for select using (true);

-- Заявки
create table orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade,
  studio_id uuid references studio_profiles(id),
  car_id text not null,
  car_name text default '',
  parts_config jsonb default '[]',
  windows_config jsonb default '[]',
  status text default 'pending' check (status in ('pending','reviewing','confirmed','done','cancelled')),
  client_notes text default '',
  studio_notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table orders enable row level security;
create policy "Client can create and view own orders" on orders
  for all using (auth.uid() = client_id);
create policy "Studio can view and update orders" on orders
  for all using (
    studio_id in (select id from studio_profiles where user_id = auth.uid())
  );
```

---

## Task 1: Backend — tRPC routes для студии и заявок

**Дедлайн:** 2026-03-19

**Files:**
- Create: `backend/routes/studio.ts`
- Create: `backend/routes/orders.ts`
- Modify: `backend/index.ts` (добавить роуты)

- [ ] **Step 1: Создать `backend/routes/studio.ts`**

```typescript
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { supabaseAdmin } from '../supabase'

export const studioRouter = router({
  getProfile: publicProcedure.query(async () => {
    const { data, error } = await supabaseAdmin
      .from('studio_profiles')
      .select('*, price_list(*)')
      .order('order_index', { referencedTable: 'price_list' })
      .limit(1)
      .single()
    if (error) throw new Error(error.message)
    return data
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      telegram: z.string().optional(),
      whatsapp: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabaseAdmin
        .from('studio_profiles')
        .upsert({ user_id: ctx.userId, ...input })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    }),

  updatePriceList: protectedProcedure
    .input(z.array(z.object({
      item_name: z.string(),
      price_from: z.number(),
      price_to: z.number().optional(),
      unit: z.string().default('руб.'),
      order_index: z.number(),
    })))
    .mutation(async ({ input, ctx }) => {
      const profile = await supabaseAdmin
        .from('studio_profiles')
        .select('id')
        .eq('user_id', ctx.userId)
        .single()
      if (profile.error) throw new Error('Studio profile not found')
      const studioId = profile.data.id

      await supabaseAdmin.from('price_list').delete().eq('studio_id', studioId)
      const { data, error } = await supabaseAdmin
        .from('price_list')
        .insert(input.map(item => ({ ...item, studio_id: studioId })))
        .select()
      if (error) throw new Error(error.message)
      return data
    }),
})
```

- [ ] **Step 2: Создать `backend/routes/orders.ts`**

```typescript
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { supabaseAdmin } from '../supabase'

const PartConfigSchema = z.array(z.object({
  part_id: z.string(),
  materialId: z.string(),
  colorHex: z.string(),
  finish: z.string(),
}))

const WindowConfigSchema = z.array(z.object({
  window_id: z.string(),
  tintPercent: z.number(),
}))

export const ordersRouter = router({
  create: protectedProcedure
    .input(z.object({
      car_id: z.string(),
      car_name: z.string().default(''),
      parts_config: PartConfigSchema.default([]),
      windows_config: WindowConfigSchema.default([]),
      client_notes: z.string().default(''),
    }))
    .mutation(async ({ input, ctx }) => {
      // Берём единственную студию (MVP — одна студия "Флор")
      const { data: studio } = await supabaseAdmin
        .from('studio_profiles')
        .select('id')
        .limit(1)
        .single()

      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert({
          client_id: ctx.userId,
          studio_id: studio?.id,
          ...input,
        })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    }),

  myOrders: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('client_id', ctx.userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', input.id)
        .or(`client_id.eq.${ctx.userId}`)
        .single()
      if (error) throw new Error(error.message)
      return data
    }),

  studioOrders: protectedProcedure.query(async ({ ctx }) => {
    const profile = await supabaseAdmin
      .from('studio_profiles')
      .select('id')
      .eq('user_id', ctx.userId)
      .single()
    if (profile.error) throw new Error('Not a studio account')

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('studio_id', profile.data.id)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['pending', 'reviewing', 'confirmed', 'done', 'cancelled']),
      studio_notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const profile = await supabaseAdmin
        .from('studio_profiles')
        .select('id')
        .eq('user_id', ctx.userId)
        .single()
      if (profile.error) throw new Error('Not a studio account')

      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ status: input.status, studio_notes: input.studio_notes, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('studio_id', profile.data.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    }),
})
```

- [ ] **Step 3: Подключить роуты в `backend/index.ts`**

Найти существующий `appRouter` и добавить:
```typescript
import { studioRouter } from './routes/studio'
import { ordersRouter } from './routes/orders'

export const appRouter = router({
  cars: carsRouter,       // уже есть
  studio: studioRouter,   // новый
  orders: ordersRouter,   // новый
})
```

- [ ] **Step 4: Commit**
```bash
cd /Users/mac/dev/carwrap
git add backend/routes/studio.ts backend/routes/orders.ts backend/index.ts
git commit -m "feat: add tRPC routes for studio profile and orders"
```

---

## Task 2: OrderCard + StatusBadge компоненты

**Дедлайн:** 2026-03-19

**Files:**
- Create: `components/studio/OrderCard.tsx`

- [ ] **Step 1: Создать `components/studio/OrderCard.tsx`**

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export type OrderStatus = 'pending' | 'reviewing' | 'confirmed' | 'done' | 'cancelled'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'Новая',
  reviewing: 'На рассмотрении',
  confirmed: 'Согласована',
  done:      'Выполнена',
  cancelled: 'Отменена',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:   '#f59e0b',
  reviewing: '#3b82f6',
  confirmed: '#10b981',
  done:      '#6b7280',
  cancelled: '#ef4444',
}

type Props = {
  order: {
    id: string
    car_name: string
    car_id: string
    status: OrderStatus
    created_at: string
    parts_config: any[]
    windows_config: any[]
  }
  onPress: () => void
}

export function OrderCard({ order, onPress }: Props) {
  const partsCount = order.parts_config?.length ?? 0
  const tintCount = (order.windows_config as any[])?.filter((w: any) => w.tintPercent > 0).length ?? 0
  const date = new Date(order.created_at).toLocaleDateString('ru-RU')

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.carName}>{order.car_name || `Авто #${order.car_id.slice(0, 8)}`}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[order.status] + '22' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[order.status] }]}>
            {STATUS_LABEL[order.status]}
          </Text>
        </View>
      </View>
      <View style={styles.meta}>
        {partsCount > 0 && <Text style={styles.metaText}>{partsCount} элементов обклеено</Text>}
        {tintCount > 0 && <Text style={styles.metaText}>{tintCount} стёкол тонировано</Text>}
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  carName: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  meta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: { color: '#888', fontSize: 13 },
  date: { color: '#555', fontSize: 12, marginLeft: 'auto' },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add components/studio/OrderCard.tsx
git commit -m "feat: add OrderCard component with status badge"
```

---

## Task 3: PriceList компонент

**Дедлайн:** 2026-03-19

**Files:**
- Create: `components/studio/PriceList.tsx`

- [ ] **Step 1: Создать `components/studio/PriceList.tsx`**

```typescript
import { View, Text, StyleSheet } from 'react-native'

type PriceItem = {
  id: string
  item_name: string
  price_from: number
  price_to?: number
  unit: string
}

type Props = {
  items: PriceItem[]
}

export function PriceList({ items }: Props) {
  if (!items || items.length === 0) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Прайс-лист</Text>
      {items.map((item, i) => (
        <View key={item.id} style={[styles.row, i < items.length - 1 && styles.rowBorder]}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <Text style={styles.price}>
            от {item.price_from.toLocaleString('ru-RU')}
            {item.price_to ? ` — ${item.price_to.toLocaleString('ru-RU')}` : ''} {item.unit}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  itemName: { color: '#ccc', fontSize: 14, flex: 1 },
  price: { color: '#e63946', fontSize: 14, fontWeight: '600' },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add components/studio/PriceList.tsx
git commit -m "feat: add PriceList component"
```

---

## Task 4: Studio public profile screen

**Дедлайн:** 2026-03-20

**Files:**
- Create: `app/studio/index.tsx`

- [ ] **Step 1: Создать `app/studio/index.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { trpc } from '@/constants/trpc'
import { PriceList } from '@/components/studio/PriceList'

export default function StudioProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trpc.studio.getProfile.query()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e63946" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>

        {/* Studio hero */}
        <View style={styles.hero}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoLetter}>Ф</Text>
          </View>
          <Text style={styles.studioName}>{profile?.name ?? 'Флор'}</Text>
          <Text style={styles.studioDesc}>{profile?.description ?? 'Профессиональная оклейка автомобилей'}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoBlock}>
          {profile?.address ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Адрес</Text>
              <Text style={styles.infoValue}>{profile.address}</Text>
            </View>
          ) : null}
          {profile?.phone ? (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${profile.phone}`)}>
              <Text style={styles.infoLabel}>📞 Телефон</Text>
              <Text style={[styles.infoValue, styles.link]}>{profile.phone}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Contact buttons */}
        <View style={styles.contacts}>
          {profile?.telegram ? (
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL(`https://t.me/${profile.telegram.replace('@', '')}`)}
            >
              <Text style={styles.contactBtnText}>Telegram</Text>
            </TouchableOpacity>
          ) : null}
          {profile?.whatsapp ? (
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL(`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`)}
            >
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Price list */}
        {profile?.price_list?.length > 0 && (
          <View style={styles.section}>
            <PriceList items={profile.price_list} />
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/catalog')}>
          <Text style={styles.ctaBtnText}>Создать конфигурацию</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#888', fontSize: 16 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logoPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e63946', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoLetter: { color: '#fff', fontSize: 36, fontWeight: '800' },
  studioName: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  studioDesc: { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  infoBlock: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, flex: 1, textAlign: 'right' },
  link: { color: '#e63946' },
  contacts: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#333', alignItems: 'center',
  },
  contactBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  section: { marginBottom: 24 },
  ctaBtn: {
    backgroundColor: '#e63946', padding: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/studio/index.tsx
git commit -m "feat: add studio public profile screen with price list and contacts"
```

---

## Task 5: Send order from editor

**Дедлайн:** 2026-03-20

**Files:**
- Modify: `app/editor/[carId].tsx`

В редакторе заменить кнопку "Сохранить" на "Отправить заявку".

- [ ] **Step 1: Обновить `handleSave` в `app/editor/[carId].tsx`**

Найти функцию `handleSave` и заменить на:

```typescript
const handleSendOrder = useCallback(async () => {
  if (!user) return Alert.alert('Войдите чтобы отправить заявку')

  const partsArray = Object.entries(partsConfig).map(([part_id, v]) => ({ part_id, ...v }))
  const windowsArray = Object.entries(windowsConfig).map(([window_id, v]) => ({ window_id, ...v }))

  if (partsArray.length === 0 && windowsArray.length === 0) {
    return Alert.alert('Выберите хотя бы один элемент', 'Нажмите на деталь машины чтобы изменить цвет')
  }

  try {
    await trpc.orders.create.mutate({
      car_id: carId,
      car_name: (route.params as any)?.carName ?? '',
      parts_config: partsArray,
      windows_config: windowsArray,
    })
    Alert.alert(
      'Заявка отправлена! ✓',
      'Мы получили вашу конфигурацию. Приезжайте в студию Флор для согласования и оплаты.',
      [{ text: 'Мои заявки', onPress: () => router.push('/orders') }, { text: 'OK' }]
    )
  } catch (e: any) {
    Alert.alert('Ошибка', e.message)
  }
}, [user, carId, partsConfig, windowsConfig, router])
```

Заменить кнопку в JSX:
```typescript
// Было: onPress={handleSave}  Текст: Сохранить
// Стало:
<TouchableOpacity style={styles.btnPrimary} onPress={handleSendOrder}>
  <Text style={styles.btnPrimaryText}>Отправить заявку</Text>
</TouchableOpacity>
```

Добавить импорт trpc вверху файла:
```typescript
import { trpc } from '@/constants/trpc'
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/editor/
git commit -m "feat: replace save with send-order in editor screen"
```

---

## Task 6: Client orders list screen

**Дедлайн:** 2026-03-21

**Files:**
- Create: `app/orders/index.tsx`

- [ ] **Step 1: Создать `app/orders/index.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { trpc } from '@/constants/trpc'
import { OrderCard } from '@/components/studio/OrderCard'
import { useAuth } from '@/constants/AuthContext'

export default function OrdersScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    trpc.orders.myOrders.query()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Войдите чтобы видеть свои заявки</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Мои заявки</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#e63946" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Заявок пока нет</Text>
          <Text style={styles.emptySubtext}>Создайте конфигурацию в каталоге</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/catalog')}>
            <Text style={styles.ctaBtnText}>Перейти в каталог</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => router.push(`/orders/${item.id}`)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backText: { color: '#888', fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  ctaBtn: { backgroundColor: '#e63946', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  loginBtn: { backgroundColor: '#1a1a1a', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  loginBtnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 20 },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/orders/index.tsx
git commit -m "feat: add client orders list screen"
```

---

## Task 7: Order detail screen

**Дедлайн:** 2026-03-21

**Files:**
- Create: `app/orders/[id].tsx`

- [ ] **Step 1: Создать `app/orders/[id].tsx`**

```typescript
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { trpc } from '@/constants/trpc'
import type { OrderStatus } from '@/components/studio/OrderCard'

const STATUS_STEPS: OrderStatus[] = ['pending', 'reviewing', 'confirmed', 'done']
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'Новая',
  reviewing: 'На рассмотрении',
  confirmed: 'Согласована',
  done:      'Выполнена',
  cancelled: 'Отменена',
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trpc.orders.get.query({ id })
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#e63946" /></View>
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Заявка не найдена</Text>
      </View>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(order.status as OrderStatus)
  const date = new Date(order.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Мои заявки</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Заявка</Text>
        <Text style={styles.subtitle}>{order.car_name || `Авто #${order.car_id.slice(0, 8)}`}</Text>
        <Text style={styles.date}>{date}</Text>

        {/* Status tracker */}
        {order.status !== 'cancelled' && (
          <View style={styles.tracker}>
            {STATUS_STEPS.map((step, i) => (
              <View key={step} style={styles.trackerStep}>
                <View style={[
                  styles.trackerDot,
                  i <= currentStep && styles.trackerDotActive,
                ]}>
                  {i < currentStep && <Text style={styles.trackerCheck}>✓</Text>}
                </View>
                {i < STATUS_STEPS.length - 1 && (
                  <View style={[styles.trackerLine, i < currentStep && styles.trackerLineActive]} />
                )}
                <Text style={[styles.trackerLabel, i <= currentStep && styles.trackerLabelActive]}>
                  {STATUS_LABEL[step]}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Config summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Конфигурация</Text>
          {order.parts_config?.length > 0 && (
            <Text style={styles.configText}>• {order.parts_config.length} элементов оклеено</Text>
          )}
          {order.windows_config?.filter((w: any) => w.tintPercent > 0).length > 0 && (
            <Text style={styles.configText}>
              • {order.windows_config.filter((w: any) => w.tintPercent > 0).length} стёкол тонировано
            </Text>
          )}
        </View>

        {/* Studio notes */}
        {order.studio_notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Комментарий студии</Text>
            <Text style={styles.notesText}>{order.studio_notes}</Text>
          </View>
        ) : null}

        {/* CTA — приехать в офис */}
        {order.status === 'confirmed' && (
          <View style={styles.officeBlock}>
            <Text style={styles.officeTitle}>Заявка согласована!</Text>
            <Text style={styles.officeText}>
              Приезжайте в студию Флор для финального согласования и оплаты.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  errorText: { color: '#888', fontSize: 16 },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#ccc', fontSize: 18, marginBottom: 4 },
  date: { color: '#555', fontSize: 13, marginBottom: 32 },
  tracker: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  trackerStep: { alignItems: 'center', flex: 1, position: 'relative' },
  trackerDot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: '#333',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  trackerDotActive: { borderColor: '#e63946', backgroundColor: '#e63946' },
  trackerCheck: { color: '#fff', fontSize: 12, fontWeight: '800' },
  trackerLine: {
    position: 'absolute', top: 13, left: '50%', right: '-50%',
    height: 2, backgroundColor: '#333',
  },
  trackerLineActive: { backgroundColor: '#e63946' },
  trackerLabel: { color: '#555', fontSize: 10, textAlign: 'center' },
  trackerLabelActive: { color: '#e63946' },
  section: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16,
  },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  configText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  notesText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  officeBlock: {
    backgroundColor: '#10b98122', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#10b981',
  },
  officeTitle: { color: '#10b981', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  officeText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/orders/[id].tsx
git commit -m "feat: add order detail screen with status tracker"
```

---

## Task 8: Studio dashboard (роль: studio)

**Дедлайн:** 2026-03-22

**Files:**
- Create: `app/studio/dashboard.tsx`

- [ ] **Step 1: Создать `app/studio/dashboard.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { trpc } from '@/constants/trpc'
import { OrderCard } from '@/components/studio/OrderCard'
import { useAuth } from '@/constants/AuthContext'
import type { OrderStatus } from '@/components/studio/OrderCard'

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   'reviewing',
  reviewing: 'confirmed',
  confirmed: 'done',
}

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending:   'Взять в работу',
  reviewing: 'Согласовать',
  confirmed: 'Выполнено',
}

export default function StudioDashboard() {
  const router = useRouter()
  const { user, role } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || role !== 'studio') return
    trpc.orders.studioOrders.query()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, role])

  async function updateStatus(orderId: string, status: OrderStatus) {
    try {
      const updated = await trpc.orders.updateStatus.mutate({ id: orderId, status })
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (e: any) {
      Alert.alert('Ошибка', e.message)
    }
  }

  if (!user || role !== 'studio') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Доступ только для студий</Text>
      </View>
    )
  }

  const pending = orders.filter(o => o.status === 'pending')
  const active = orders.filter(o => ['reviewing', 'confirmed'].includes(o.status))
  const done = orders.filter(o => ['done', 'cancelled'].includes(o.status))

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Заявки</Text>
        <TouchableOpacity onPress={() => router.push('/studio/setup')}>
          <Text style={styles.setupText}>Настройки</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#e63946" /></View>
      ) : (
        <FlatList
          data={[...pending, ...active, ...done]}
          keyExtractor={o => o.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyText}>Заявок пока нет</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View>
              <OrderCard order={item} onPress={() => {}} />
              {NEXT_STATUS[item.status as OrderStatus] && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => updateStatus(item.id, NEXT_STATUS[item.status as OrderStatus]!)}
                >
                  <Text style={styles.actionBtnText}>
                    {NEXT_STATUS_LABEL[item.status as OrderStatus]}
                  </Text>
                </TouchableOpacity>
              )}
              {item.status !== 'cancelled' && item.status !== 'done' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => updateStatus(item.id, 'cancelled')}
                >
                  <Text style={styles.cancelBtnText}>Отменить</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  errorText: { color: '#888', fontSize: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  setupText: { color: '#e63946', fontSize: 14 },
  list: { padding: 20, paddingBottom: 48 },
  emptyBlock: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  actionBtn: {
    backgroundColor: '#e63946', padding: 12, borderRadius: 10,
    alignItems: 'center', marginTop: -4, marginBottom: 8,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelBtn: { padding: 8, alignItems: 'center', marginBottom: 16 },
  cancelBtnText: { color: '#555', fontSize: 13 },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/studio/dashboard.tsx
git commit -m "feat: add studio orders dashboard with status management"
```

---

## Task 9: Support screen

**Дедлайн:** 2026-03-23

**Files:**
- Create: `app/support.tsx`

- [ ] **Step 1: Создать `app/support.tsx`**

```typescript
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

const FAQ = [
  {
    q: 'Как сделать заявку?',
    a: 'Выберите автомобиль в каталоге, откройте 3D-редактор, нажмите на детали и выберите материал. Когда конфигурация готова — нажмите "Отправить заявку".',
  },
  {
    q: 'Нужно ли оплачивать сразу?',
    a: 'Нет. В приложении оплата не предусмотрена. После отправки заявки приезжайте в студию, согласуйте детали и оплатите на месте.',
  },
  {
    q: 'Сколько времени занимает оклейка?',
    a: 'Зависит от объёма работ. Полная оклейка — от 3 до 7 рабочих дней. Отдельные элементы — от 1 дня.',
  },
  {
    q: 'Можно ли изменить заявку после отправки?',
    a: 'Да, позвоните нам или напишите в Telegram. Мы внесём изменения до начала работ.',
  },
]

export default function SupportScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Поддержка</Text>
        <Text style={styles.subtitle}>Студия Флор</Text>

        {/* Contact buttons */}
        <View style={styles.contacts}>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: '#229ED9' }]}
            onPress={() => Linking.openURL('https://t.me/flor_studio')}
          >
            <Text style={styles.contactBtnText}>Telegram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: '#25D366' }]}
            onPress={() => Linking.openURL('https://wa.me/79000000000')}
          >
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: '#333' }]}
            onPress={() => Linking.openURL('tel:+79000000000')}
          >
            <Text style={styles.contactBtnText}>Позвонить</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={styles.faqTitle}>Частые вопросы</Text>
        {FAQ.map((item, i) => (
          <View key={i} style={styles.faqItem}>
            <Text style={styles.faqQ}>{item.q}</Text>
            <Text style={styles.faqA}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#e63946', fontSize: 16, marginBottom: 32 },
  contacts: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  contactBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  contactBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  faqTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  faqItem: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 12,
  },
  faqQ: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  faqA: { color: '#888', fontSize: 14, lineHeight: 22 },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/support.tsx
git commit -m "feat: add support screen with FAQ and contact buttons"
```

---

## Task 10: Home screen — красивый лендинг

**Дедлайн:** 2026-03-23

**Files:**
- Modify/Create: `app/index.tsx`

- [ ] **Step 1: Создать/обновить `app/index.tsx`**

```typescript
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/constants/AuthContext'
import { LinearGradient } from 'expo-linear-gradient'

const FEATURES = [
  { icon: '🚗', title: '3D Конфигуратор', desc: 'Крути модель, выбирай цвет на каждую деталь' },
  { icon: '🎨', title: '20+ материалов', desc: 'Глянец, мат, сатин, карбон, хром' },
  { icon: '🪟', title: 'Тонировка стёкол', desc: 'Настраивай каждое стекло отдельно' },
  { icon: '📋', title: 'Заявка онлайн', desc: 'Отправь конфигурацию — приедь и оплати' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, role } = useAuth()

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header nav */}
        <View style={styles.nav}>
          <Text style={styles.logo}>Флор</Text>
          <View style={styles.navRight}>
            {role === 'studio' && (
              <TouchableOpacity onPress={() => router.push('/studio/dashboard')}>
                <Text style={styles.navLink}>Дашборд</Text>
              </TouchableOpacity>
            )}
            {user ? (
              <TouchableOpacity onPress={() => router.push('/orders')}>
                <Text style={styles.navLink}>Заявки</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.navLink}>Войти</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTag}>Студия оклейки авто</Text>
          <Text style={styles.heroTitle}>Создай{'\n'}свой{'\n'}стиль</Text>
          <Text style={styles.heroDesc}>
            Выбери автомобиль, настрой цвет в 3D и отправь заявку.{'\n'}Оплата — в студии.
          </Text>
          <TouchableOpacity style={styles.heroCta} onPress={() => router.push('/catalog')}>
            <Text style={styles.heroCtaText}>Попробовать бесплатно →</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Studio CTA */}
        <TouchableOpacity style={styles.studioCta} onPress={() => router.push('/studio')}>
          <View>
            <Text style={styles.studioCtaLabel}>О студии</Text>
            <Text style={styles.studioCtaTitle}>Флор</Text>
            <Text style={styles.studioCtaDesc}>Прайс-лист, адрес, контакты →</Text>
          </View>
          <Text style={styles.studioCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* Support link */}
        <TouchableOpacity style={styles.supportLink} onPress={() => router.push('/support')}>
          <Text style={styles.supportLinkText}>Служба поддержки</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 48 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
  logo: { color: '#e63946', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  navRight: { flexDirection: 'row', gap: 20 },
  navLink: { color: '#888', fontSize: 15 },
  hero: { marginBottom: 48 },
  heroTag: { color: '#e63946', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 64, fontWeight: '900', lineHeight: 68, marginBottom: 20 },
  heroDesc: { color: '#888', fontSize: 16, lineHeight: 26, marginBottom: 32 },
  heroCta: {
    backgroundColor: '#e63946', paddingHorizontal: 32, paddingVertical: 18,
    borderRadius: 16, alignSelf: 'flex-start',
  },
  heroCtaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  featureCard: {
    width: '47%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  featureIcon: { fontSize: 28, marginBottom: 10 },
  featureTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  featureDesc: { color: '#888', fontSize: 13, lineHeight: 20 },
  studioCta: {
    backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#2a2a2a',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  studioCtaLabel: { color: '#e63946', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  studioCtaTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  studioCtaDesc: { color: '#888', fontSize: 14 },
  studioCtaArrow: { color: '#e63946', fontSize: 28 },
  supportLink: { alignItems: 'center', paddingVertical: 16 },
  supportLinkText: { color: '#555', fontSize: 14 },
})
```

- [ ] **Step 2: Установить expo-linear-gradient**
```bash
cd /Users/mac/dev/carwrap
bunx expo install expo-linear-gradient
```

- [ ] **Step 3: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/index.tsx
git commit -m "feat: add home screen with hero, features and studio CTA"
```

---

## Task 11: Studio setup screen (заполнить профиль)

**Дедлайн:** 2026-03-24

**Files:**
- Create: `app/studio/setup.tsx`

- [ ] **Step 1: Создать `app/studio/setup.tsx`**

```typescript
import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { trpc } from '@/constants/trpc'

export default function StudioSetupScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: 'Флор',
    description: '',
    address: '',
    phone: '',
    telegram: '',
    whatsapp: '',
  })

  useEffect(() => {
    trpc.studio.getProfile.query()
      .then(profile => {
        if (profile) setForm(f => ({ ...f, ...profile }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await trpc.studio.updateProfile.mutate(form)
      Alert.alert('Сохранено!', '', [{ text: 'OK', onPress: () => router.back() }])
    } catch (e: any) {
      Alert.alert('Ошибка', e.message)
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof typeof form, label: string, placeholder: string) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
        placeholder={placeholder}
        placeholderTextColor="#555"
      />
    </View>
  )

  if (loading) return <View style={styles.center}><ActivityIndicator color="#e63946" /></View>

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Настройки студии</Text>

        {field('name', 'Название', 'Флор')}
        {field('description', 'Описание', 'Профессиональная оклейка автомобилей')}
        {field('address', 'Адрес', 'ул. Примерная, 1')}
        {field('phone', 'Телефон', '+7 (900) 000-00-00')}
        {field('telegram', 'Telegram', '@flor_studio')}
        {field('whatsapp', 'WhatsApp', '+79000000000')}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Сохраняем...' : 'Сохранить'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 28 },
  field: { marginBottom: 20 },
  label: { color: '#888', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2a2a',
  },
  saveBtn: {
    backgroundColor: '#e63946', padding: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/studio/setup.tsx
git commit -m "feat: add studio setup screen for profile editing"
```

---

## Task 12: Navigation wiring — добавить все новые экраны в роутер

**Дедлайн:** 2026-03-24

**Files:**
- Modify: `app/_layout.tsx` (если есть Stack, добавить экраны)
- Modify: `app/(tabs)/_layout.tsx` или аналогичный таб-бар (если есть)

- [ ] **Step 1: Проверить текущий layout**

```bash
cat /Users/mac/dev/carwrap/app/_layout.tsx
```

- [ ] **Step 2: Убедиться что все маршруты присутствуют**

В `Stack` должны быть:
```typescript
<Stack.Screen name="studio/index" options={{ headerShown: false }} />
<Stack.Screen name="studio/dashboard" options={{ headerShown: false }} />
<Stack.Screen name="studio/setup" options={{ headerShown: false }} />
<Stack.Screen name="orders/index" options={{ headerShown: false }} />
<Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
<Stack.Screen name="support" options={{ headerShown: false }} />
```

- [ ] **Step 3: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/_layout.tsx
git commit -m "feat: register studio, orders, support routes in layout"
```

---

## Plan 3 Complete ✅

**Дедлайн:** 2026-03-24

**Что работает после Plan 3:**
- Главный экран с красивым лендингом, навигацией и CTA
- Профиль студии "Флор" — описание, адрес, контакты, прайс-лист
- Клиент создаёт конфигурацию в 3D-редакторе → отправляет заявку
- Клиент видит список своих заявок и трекер статуса
- Студия видит все входящие заявки, меняет статус (Новая → На рассмотрении → Согласована → Выполнена)
- Экран поддержки с FAQ, Telegram, WhatsApp, телефоном
- Студия редактирует свой профиль через Setup экран
- Оплата — только офлайн, в студии

**Next:** Plan 4 — Push notifications, реальные GLB модели (Cloudflare R2), PPF risk zones
