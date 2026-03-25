import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getMyOrders } from '@/constants/orders-service'
import { OrderCard } from '@/components/studio/OrderCard'
import { useAuth } from '@/constants/AuthContext'
import type { Order } from '@/constants/orders-service'

export default function OrdersScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getMyOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Войдите чтобы видеть свои заявки</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
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
          <ActivityIndicator color="#C9A84C" />
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
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backText: { color: '#C9A84C', fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  ctaBtn: { backgroundColor: '#C9A84C', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  ctaBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  loginBtn: { backgroundColor: '#141414', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)' },
  loginBtnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 20 },
})
