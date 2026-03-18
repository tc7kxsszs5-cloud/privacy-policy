import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { trpc } from '@/constants/trpc'

export default function BrandModelsScreen() {
  const { brand } = useLocalSearchParams<{ brand: string }>()
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    trpc.cars.list.query({ make: brand }).then(cars => {
      const unique = [...new Set(cars.map(c => c.model))]
      setModels(unique)
      setLoading(false)
    })
  }, [brand])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#e63946" />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{brand}</Text>
      <FlatList
        data={models}
        keyExtractor={m => m}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => router.push(`/catalog/${brand}/${item}`)}>
            <Text style={styles.model}>{item}</Text>
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
          marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  model: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
