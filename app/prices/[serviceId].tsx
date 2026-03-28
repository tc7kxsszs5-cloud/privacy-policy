import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
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
      {/* Back button over hero */}
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        {service.image ? (
          <ImageBackground source={service.image} style={styles.hero} resizeMode="cover">
            <View style={styles.heroOverlay}>
              <Text style={styles.heroCategory}>{service.category}</Text>
              <Text style={styles.heroTitle}>{service.title}</Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroCategory}>{service.category}</Text>
            <Text style={styles.heroTitle}>{service.title}</Text>
          </View>
        )}

        {/* Description block */}
        <View style={styles.descBlock}>
          <Text style={styles.descText}>{service.description}</Text>
        </View>

        {/* Price list */}
        {service.items.length > 0 && (
          <View style={styles.priceSection}>
            <Text style={styles.priceSectionLabel}>СТОИМОСТЬ</Text>
            {service.items.map((item, i) => (
              <View key={item.name} style={[styles.priceRow, i < service.items.length - 1 && styles.priceRowBorder]}>
                <Text style={styles.priceName}>{item.name}</Text>
                <Text style={styles.priceValue}>
                  от {item.price_from.toLocaleString('ru-RU')} {item.unit}
                </Text>
              </View>
            ))}
          </View>
        )}

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

  backRow: {
    position: 'absolute', top: 56, left: 0, right: 0, zIndex: 10,
    paddingHorizontal: 20, paddingVertical: 4,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  back: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },

  scroll: { paddingBottom: 56 },

  hero: { width: '100%', height: 240 },
  heroOverlay: {
    flex: 1, justifyContent: 'flex-end',
    paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroPlaceholder: {
    height: 200, justifyContent: 'flex-end',
    paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)',
  },
  heroCategory: {
    color: '#C9A84C', fontSize: 12, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 30,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },

  descBlock: {
    borderLeftWidth: 3, borderLeftColor: '#C9A84C',
    paddingLeft: 16, marginHorizontal: 20, marginTop: 24, marginBottom: 32,
    backgroundColor: 'rgba(201,168,76,0.05)',
    borderRadius: 4, paddingVertical: 14, paddingRight: 14,
  },
  descText: { color: '#ccc', fontSize: 15, lineHeight: 24 },

  priceSection: {
    backgroundColor: '#141414', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
    overflow: 'hidden', marginHorizontal: 20, marginBottom: 24,
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
    padding: 18, alignItems: 'center', marginHorizontal: 20, marginBottom: 16,
  },
  ctaText: { color: '#000', fontSize: 16, fontWeight: '800' },

  footnote: { color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: '#555', fontSize: 16 },
})
