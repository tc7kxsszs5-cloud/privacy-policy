import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { Order, OrderStatus } from '@/constants/orders-service'

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
  order: Order
  onPress: () => void
}

export function OrderCard({ order, onPress }: Props) {
  const partsCount = order.parts_config?.length ?? 0
  const tintCount = (order.windows_config ?? []).filter(w => w.tintPercent > 0).length
  const date = new Date(order.created_at).toLocaleDateString('ru-RU')

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.carName} numberOfLines={1}>
          {order.car_name || `Авто #${order.car_id.slice(0, 8)}`}
        </Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[order.status] + '22' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[order.status] }]}>
            {STATUS_LABEL[order.status]}
          </Text>
        </View>
      </View>
      <View style={styles.meta}>
        {partsCount > 0 && <Text style={styles.metaText}>{partsCount} элементов</Text>}
        {tintCount > 0 && <Text style={styles.metaText}>{tintCount} стёкол</Text>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carName: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  meta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  metaText: { color: '#888', fontSize: 13 },
  date: { color: '#555', fontSize: 12, marginLeft: 'auto' },
})
