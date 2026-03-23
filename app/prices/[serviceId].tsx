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
