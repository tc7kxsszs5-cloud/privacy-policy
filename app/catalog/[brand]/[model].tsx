import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { trpc } from '@/constants/trpc'

type Car = { id: string; make: string; model: string; year_from: number;
             year_to: number | null; generation_name: string | null }

export default function GenerationsScreen() {
  const { brand, model } = useLocalSearchParams<{ brand: string; model: string }>()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trpc.cars.list.query({ make: brand, model }).then(data => {
      setCars(data as Car[])
      setLoading(false)
    })
  }, [brand, model])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#e63946" />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{brand} {model}</Text>
      <FlatList
        data={cars}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => Alert.alert('Готово!', `Выбрано: ${item.generation_name ?? item.year_from}\n\n3D-редактор будет в Плане 2`)}>
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
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20,
          marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a',
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gen: { color: '#fff', fontSize: 16, fontWeight: '600' },
  years: { color: '#888', fontSize: 14 },
})
