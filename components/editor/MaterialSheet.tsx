import { forwardRef, useCallback, useMemo, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { MATERIAL_PRESETS, FINISH_LABELS } from '@/constants/materials-data'
import type { MaterialFinish } from '@/components/CarViewer/bridge'

type Props = {
  meshName: string | null
  onSelect: (materialId: string, colorHex: string, finish: MaterialFinish) => void
  onClose: () => void
}

const FINISHES: MaterialFinish[] = ['gloss', 'matte', 'satin', 'carbon', 'chrome']

export const MaterialSheet = forwardRef<BottomSheet, Props>(({ meshName, onSelect, onClose }, ref) => {
  const [activeFinish, setActiveFinish] = useState<MaterialFinish>('gloss')
  const snapPoints = useMemo(() => ['50%'], [])

  const filtered = MATERIAL_PRESETS.filter(m => m.finish === activeFinish)

  const handleClose = useCallback(() => onClose(), [onClose])

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>
          {meshName ? `Деталь: ${meshName}` : 'Выберите материал'}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {FINISHES.map(f => (
            <TouchableOpacity key={f} style={[styles.tab, activeFinish === f && styles.tabActive]}
              onPress={() => setActiveFinish(f)}>
              <Text style={[styles.tabText, activeFinish === f && styles.tabTextActive]}>
                {FINISH_LABELS[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          numColumns={5}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.swatch, { backgroundColor: item.colorHex }]}
              onPress={() => onSelect(item.id, item.colorHex, item.finish)}
            >
              <Text style={styles.swatchLabel} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.grid}
        />
      </BottomSheetView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#1a1a1a' },
  handle: { backgroundColor: '#444' },
  container: { flex: 1, padding: 16 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  tabs: { flexGrow: 0, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
         borderWidth: 1, borderColor: '#333', marginRight: 8 },
  tabActive: { borderColor: '#e63946', backgroundColor: '#1a0507' },
  tabText: { color: '#888', fontSize: 13 },
  tabTextActive: { color: '#e63946' },
  grid: { paddingBottom: 24 },
  swatch: { width: '18%', aspectRatio: 1, borderRadius: 10, margin: '1%',
            justifyContent: 'flex-end', padding: 4, borderWidth: 1, borderColor: '#333' },
  swatchLabel: { color: '#fff', fontSize: 9, textShadowColor: '#000',
                 textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
})
