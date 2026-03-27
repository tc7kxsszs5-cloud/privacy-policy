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

          // Flatten all rows: services without items get a single service-level row
          type Row = { key: string; label: string; price?: string; serviceId: string; isService?: boolean }
          const rows: Row[] = []
          services.forEach(service => {
            if (service.items.length === 0) {
              rows.push({ key: service.id, label: service.title, serviceId: service.id, isService: true })
            } else {
              service.items.forEach(item => {
                rows.push({
                  key: `${service.id}-${item.name}`,
                  label: item.name,
                  price: `от ${item.price_from.toLocaleString('ru-RU')} ${item.unit}`,
                  serviceId: service.id,
                })
              })
            }
          })

          return (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.catTitle}>{category}</Text>
              {rows.map((row, index) => (
                <TouchableOpacity
                  key={row.key}
                  style={[styles.row, index > 0 && styles.rowBorder]}
                  onPress={() => router.push(`/prices/${row.serviceId}`)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.itemName, row.isService && styles.itemNameService]}>{row.label}</Text>
                  <View style={styles.rowRight}>
                    {row.price
                      ? <Text style={styles.price}>{row.price}</Text>
                      : <Text style={styles.priceOnRequest}>Подробнее</Text>
                    }
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
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
  itemNameService: { color: '#fff', fontWeight: '600' },
  priceOnRequest: { color: '#C9A84C', fontSize: 13, fontWeight: '600', textAlign: 'right' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'right' },
  chevron: { color: '#C9A84C', fontSize: 18, fontWeight: '300', marginTop: -1 },
  cta: {
    backgroundColor: '#C9A84C', borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 8,
  },
  ctaText: { color: '#000', fontSize: 16, fontWeight: '800' },
})
