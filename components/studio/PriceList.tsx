import { View, Text, StyleSheet } from 'react-native'
import type { PriceItem } from '@/constants/studio-service'

type Props = {
  items: PriceItem[]
}

export function PriceList({ items }: Props) {
  if (!items || items.length === 0) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Прайс-лист</Text>
      {items.map((item, i) => (
        <View key={item.id} style={[styles.row, i < items.length - 1 && styles.rowBorder]}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <Text style={styles.price}>
            от {item.price_from.toLocaleString('ru-RU')}
            {item.price_to ? ` — ${item.price_to.toLocaleString('ru-RU')}` : ''} {item.unit}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'center',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  itemName: { color: '#ccc', fontSize: 14, flex: 1 },
  price: { color: '#e63946', fontSize: 14, fontWeight: '600' },
})
