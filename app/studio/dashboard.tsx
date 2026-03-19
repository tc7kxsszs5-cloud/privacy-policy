import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getStudioOrders, updateOrderStatus } from '@/constants/orders-service'
import { OrderCard } from '@/components/studio/OrderCard'
import { useAuth } from '@/constants/AuthContext'
import type { Order, OrderStatus } from '@/constants/orders-service'

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
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || profile?.role !== 'studio_owner') { setLoading(false); return }
    getStudioOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [user, profile])

  async function handleUpdateStatus(orderId: string, status: OrderStatus) {
    try {
      const updated = await updateOrderStatus(orderId, status)
      if (updated) setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (e: any) {
      Alert.alert('Ошибка', e.message)
    }
  }

  if (!user || profile?.role !== 'studio_owner') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Доступ только для студий</Text>
      </View>
    )
  }

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
          data={orders}
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
              {NEXT_STATUS[item.status] && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleUpdateStatus(item.id, NEXT_STATUS[item.status]!)}
                >
                  <Text style={styles.actionBtnText}>
                    {NEXT_STATUS_LABEL[item.status]}
                  </Text>
                </TouchableOpacity>
              )}
              {item.status !== 'cancelled' && item.status !== 'done' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleUpdateStatus(item.id, 'cancelled')}
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
