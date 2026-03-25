# Prices Screen — Service Detail Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the prices screen so every service row is tappable and opens a detail screen with the full service description and price list.

**Architecture:** `app/prices.tsx` moves to `app/prices/index.tsx` (expo-router requires a folder when adding `[serviceId].tsx` sibling). The index screen switches from `PRICE_CATEGORIES` (old, no descriptions) to `SERVICES` from `services-data.ts` (rich descriptions). Each row gets a gold `›` chevron and navigates to `app/prices/[serviceId].tsx` which shows the service title, description block, and full item list.

**Tech Stack:** Expo Router v5, React Native StyleSheet, `SERVICES` from `constants/services-data.ts`

---

### Task 1: Move prices.tsx → prices/index.tsx and switch to SERVICES data

**Files:**
- Create: `app/prices/index.tsx` (replaces `app/prices.tsx`)
- Delete: `app/prices.tsx`

- [ ] **Step 1: Create `app/prices/` folder by creating `app/prices/index.tsx`**

Full content — migrates from `PRICE_CATEGORIES` to `SERVICES`, groups by category, each row tappable with `›` chevron:

```tsx
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SERVICES, SERVICE_CATEGORIES } from '@/constants/services-data'

export default function PricesScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Прайс-лист</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.note}>Цены указаны от. Точная стоимость — после осмотра в студии.</Text>

        {SERVICE_CATEGORIES.map(category => {
          const services = SERVICES.filter(s => s.category === category)
          if (services.length === 0) return null
          return (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.catTitle}>{category}</Text>
              {services.map((service, si) =>
                service.items.map((item, ii) => {
                  const isFirst = si === 0 && ii === 0
                  return (
                    <TouchableOpacity
                      key={`${service.id}-${ii}`}
                      style={[styles.row, !isFirst && styles.rowBorder]}
                      onPress={() => router.push(`/prices/${service.id}`)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View style={styles.rowRight}>
                        <Text style={styles.price}>
                          от {item.price_from.toLocaleString('ru-RU')} {item.unit}
                        </Text>
                        <Text style={styles.chevron}>›</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })
              )}
            </View>
          )
        })}

        <TouchableOpacity style={styles.cta} onPress={() => router.push('/catalog')}>
          <Text style={styles.ctaText}>Настроить авто в 3D</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  back: { color: '#C9A84C', fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 48 },
  note: { color: '#555', fontSize: 13, marginBottom: 24, lineHeight: 20 },
  categoryBlock: {
    backgroundColor: '#141414', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
    marginBottom: 16, overflow: 'hidden',
  },
  catTitle: {
    color: '#C9A84C', fontSize: 13, fontWeight: '700',
    letterSpacing: 0.5, padding: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.08)',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.08)' },
  itemName: { color: '#ccc', fontSize: 13, flex: 1, marginRight: 8, lineHeight: 18 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'right' },
  chevron: { color: '#C9A84C', fontSize: 18, fontWeight: '300', marginTop: -1 },
  cta: {
    backgroundColor: '#C9A84C', borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 8,
  },
  ctaText: { color: '#000', fontSize: 16, fontWeight: '800' },
})
```

- [ ] **Step 2: Delete the old `app/prices.tsx`**

```bash
rm /Users/mac/dev/carwrap/app/prices.tsx
```

- [ ] **Step 3: Verify metro resolves the new path**

Run `bunx expo start` briefly and navigate to `/prices` — should render without "module not found" error.

- [ ] **Step 4: Commit**

```bash
git add app/prices/index.tsx
git rm app/prices.tsx
git commit -m "feat: migrate prices screen to services-data with tappable rows"
```

---

### Task 2: Create detail screen `app/prices/[serviceId].tsx`

**Files:**
- Create: `app/prices/[serviceId].tsx`

- [ ] **Step 1: Create `app/prices/[serviceId].tsx`**

Full content:

```tsx
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SERVICES } from '@/constants/services-data'

export default function ServiceDetailScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>()
  const router = useRouter()
  const service = SERVICES.find(s => s.id === serviceId)

  if (!service) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Услуга</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Услуга не найдена</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{service.category}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Service title */}
        <Text style={styles.serviceTitle}>{service.title}</Text>

        {/* Description block */}
        <View style={styles.descBlock}>
          <Text style={styles.descText}>{service.description}</Text>
        </View>

        {/* Price list */}
        <View style={styles.priceSection}>
          <Text style={styles.priceSectionLabel}>СТОИМОСТЬ</Text>
          {service.items.map((item, i) => (
            <View key={i} style={[styles.priceRow, i < service.items.length - 1 && styles.priceRowBorder]}>
              <Text style={styles.priceName}>{item.name}</Text>
              <Text style={styles.priceValue}>
                от {item.price_from.toLocaleString('ru-RU')} {item.unit}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/support')}>
          <Text style={styles.ctaText}>Записаться</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>Точная стоимость определяется после осмотра автомобиля в студии.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  back: { color: '#C9A84C', fontSize: 16 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 56 },

  serviceTitle: {
    color: '#fff', fontSize: 22, fontWeight: '800',
    lineHeight: 30, marginBottom: 20,
  },

  descBlock: {
    borderLeftWidth: 3, borderLeftColor: '#C9A84C',
    paddingLeft: 16, marginBottom: 32,
    backgroundColor: 'rgba(201,168,76,0.05)',
    borderRadius: 4, paddingVertical: 14, paddingRight: 14,
  },
  descText: {
    color: '#ccc', fontSize: 15, lineHeight: 24,
  },

  priceSection: {
    backgroundColor: '#141414', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
    overflow: 'hidden', marginBottom: 24,
  },
  priceSectionLabel: {
    color: '#C9A84C', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, padding: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.08)',
  },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  priceRowBorder: { borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.08)' },
  priceName: { color: '#ccc', fontSize: 13, flex: 1, marginRight: 12, lineHeight: 18 },
  priceValue: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'right' },

  cta: {
    backgroundColor: '#C9A84C', borderRadius: 16,
    padding: 18, alignItems: 'center', marginBottom: 16,
  },
  ctaText: { color: '#000', fontSize: 16, fontWeight: '800' },

  footnote: { color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: '#555', fontSize: 16 },
})
```

- [ ] **Step 2: Verify navigation works**

Start Metro (`bunx expo start`), navigate: Главная → Прайс-лист → тап на любую строку → должен открыться детальный экран с описанием и ценами → кнопка "← Назад" возвращает в прайс-лист.

- [ ] **Step 3: Commit**

```bash
git add app/prices/[serviceId].tsx
git commit -m "feat: add service detail screen with description and price list"
```
