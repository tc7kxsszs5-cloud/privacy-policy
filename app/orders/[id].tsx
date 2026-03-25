import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native'
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
    return <View style={styles.center}><ActivityIndicator color="#C9A84C" /></View>
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

        <View style={styles.contactBlock}>
          <Text style={styles.contactTitle}>Связаться со студией</Text>
          <Text style={styles.contactSubtitle}>Есть вопрос по заявке? Напишите или позвоните нам</Text>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL(
              `mailto:info@flor-detailing.ru?subject=Вопрос по заявке №${order.id.slice(0, 8).toUpperCase()}&body=Добрый день! У меня вопрос по заявке №${order.id.slice(0, 8).toUpperCase()}.`
            )}
          >
            <Text style={styles.contactBtnIcon}>✉️</Text>
            <View>
              <Text style={styles.contactBtnLabel}>Написать на почту</Text>
              <Text style={styles.contactBtnValue}>info@flor-detailing.ru</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactBtn, styles.contactBtnPhone]}
            onPress={() => Linking.openURL('tel:+74954111003')}
          >
            <Text style={styles.contactBtnIcon}>📞</Text>
            <View>
              <Text style={styles.contactBtnLabel}>Позвонить</Text>
              <Text style={styles.contactBtnValue}>+7 (495) 411-10-03</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  errorText: { color: '#888', fontSize: 16 },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#C9A84C', fontSize: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#ccc', fontSize: 18, marginBottom: 4 },
  date: { color: '#555', fontSize: 13, marginBottom: 32 },
  tracker: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  trackerStep: { alignItems: 'center', flex: 1, position: 'relative' },
  trackerDot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(201,168,76,0.12)',
    backgroundColor: '#141414',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  trackerDotActive: { borderColor: '#C9A84C', backgroundColor: '#C9A84C' },
  trackerCheck: { color: '#000', fontSize: 12, fontWeight: '800' },
  trackerLine: {
    position: 'absolute', top: 13, left: '50%', right: '-50%',
    height: 2, backgroundColor: 'rgba(201,168,76,0.12)',
  },
  trackerLineActive: { backgroundColor: '#C9A84C' },
  trackerLabel: { color: '#555', fontSize: 10, textAlign: 'center' },
  trackerLabelActive: { color: '#C9A84C' },
  section: {
    backgroundColor: '#141414', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', marginBottom: 16,
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
  contactBlock: {
    marginTop: 8, backgroundColor: '#141414', borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
  },
  contactTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  contactSubtitle: { color: '#666', fontSize: 13, marginBottom: 16, lineHeight: 18 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', marginBottom: 10,
  },
  contactBtnPhone: {
    backgroundColor: '#ffffff08', borderColor: '#ffffff15', marginBottom: 0,
  },
  contactBtnIcon: { fontSize: 22 },
  contactBtnLabel: { color: '#888', fontSize: 12, marginBottom: 2 },
  contactBtnValue: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
