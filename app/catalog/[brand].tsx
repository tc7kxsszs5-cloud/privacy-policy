import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { trpc } from '@/constants/trpc'

type ModelItem = { model: string; thumbnail_url?: string | null }

export default function BrandModelsScreen() {
  const { brand } = useLocalSearchParams<{ brand: string }>()
  const [models, setModels] = useState<ModelItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    trpc.cars.list.query({ make: brand }).then(cars => {
      const seen = new Set<string>()
      const unique: ModelItem[] = []
      for (const c of cars) {
        if (!seen.has(c.model)) {
          seen.add(c.model)
          unique.push({ model: c.model, thumbnail_url: (c as any).thumbnail_url })
        }
      }
      setModels(unique)
      setLoading(false)
    })
  }, [brand])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#C9A84C" />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{brand}</Text>
      <FlatList
        data={models}
        keyExtractor={m => m.model}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
              pathname: '/catalog/[brand]/[model]',
              params: { brand, model: item.model },
            } as any)}
            activeOpacity={0.7}
          >
            {item.thumbnail_url ? (
              <Image
                source={{ uri: item.thumbnail_url }}
                style={styles.thumb}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Text style={styles.thumbPlaceholderText}>{item.model.charAt(0)}</Text>
              </View>
            )}
            <Text style={styles.model}>{item.model}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  card: {
    backgroundColor: '#141414', borderRadius: 16,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  thumb: { width: 100, height: 66 },
  thumbPlaceholder: {
    width: 100, height: 66,
    backgroundColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbPlaceholderText: { color: '#333', fontSize: 22, fontWeight: '700' },
  model: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1, paddingHorizontal: 14 },
  chevron: { color: '#C9A84C', fontSize: 20, paddingRight: 16 },
})
