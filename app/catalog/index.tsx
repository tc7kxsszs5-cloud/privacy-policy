import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { trpc } from '@/constants/trpc'
import { BrandCard } from '@/components/BrandCard'

export default function CatalogScreen() {
  const [brands, setBrands] = useState<{ name: string; count: number; thumbnail_url?: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    trpc.cars.brands.query().then(data => {
      setBrands(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#C9A84C" />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите марку</Text>
      <FlatList
        data={brands}
        keyExtractor={b => b.name}
        renderItem={({ item }) => (
          <BrandCard brand={item.name} count={item.count}
            onPress={() => router.push({
              pathname: '/catalog/[brand]',
              params: { brand: item.name },
            } as any)} />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 24 },
})
