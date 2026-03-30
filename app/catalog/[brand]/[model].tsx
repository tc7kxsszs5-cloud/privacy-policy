import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { trpc } from '@/constants/trpc'
import { getGlbKey } from '@/constants/car-glb-map'

type Car = { id: string; make: string; model: string; year_from: number;
             year_to: number | null; generation_name: string | null; glb_url?: string | null }

export default function GenerationsScreen() {
  const { brand, model } = useLocalSearchParams<{ brand: string; model: string }>()
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trpc.cars.list.query({ make: brand, model }).then(data => {
      setCars(data as Car[])
      setLoading(false)
    })
  }, [brand, model])

  const handlePress = (item: Car) => {
    const glbKey = getGlbKey(brand, model)
    const params = new URLSearchParams({
      ...(glbKey ? { glbKey } : item.glb_url ? { glbUrl: item.glb_url } : {}),
      carName: `${brand} ${model}`,
    })
    router.push(`/editor/${item.id}?${params.toString()}`)
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#C9A84C" />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{brand} {model}</Text>
      <FlatList
        data={cars}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <Text style={styles.gen}>{item.generation_name ?? 'Базовая'}</Text>
            <Text style={styles.years}>
              {item.year_from}–{item.year_to ?? 'н.в.'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  card: { backgroundColor: '#141414', borderRadius: 16, padding: 20,
          marginBottom: 12, borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gen: { color: '#fff', fontSize: 16, fontWeight: '600' },
  years: { color: '#888', fontSize: 14 },
})
