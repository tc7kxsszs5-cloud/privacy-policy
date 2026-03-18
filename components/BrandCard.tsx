import { TouchableOpacity, Text, StyleSheet } from 'react-native'

type Props = { brand: string; count: number; onPress: () => void }

export function BrandCard({ brand, count, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.brand}>{brand}</Text>
      <Text style={styles.count}>{count} моделей</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20,
          marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  brand: { color: '#fff', fontSize: 18, fontWeight: '700' },
  count: { color: '#888', fontSize: 14, marginTop: 4 },
})
