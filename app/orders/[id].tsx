import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getOrder } from '@/constants/orders-service'
import type { Order, OrderStatus } from '@/constants/orders-service'

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
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
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

  const currentStep = STATUS_STEPS.indexOf(order.status)
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Конфигурация</Text>
          {order.parts_config?.length > 0 && (
            <Text style={styles.configText}>• {order.parts_config.length} элементов оклеено</Text>
          )}
          {order.windows_config?.filter(w => w.tintPercent > 0).length > 0 && (
            <Text style={styles.configText}>
              • {order.windows_config.filter(w => w.tintPercent > 0).length} стёкол тонировано
            </Text>
          )}
        </View>

        {order.studio_notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Комментарий студии</Text>
            <Text style={styles.notesText}>{order.studio_notes}</Text>
          </View>
        ) : null}

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
