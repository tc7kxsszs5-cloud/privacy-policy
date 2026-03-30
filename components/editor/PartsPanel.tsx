import { forwardRef, useMemo, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet'

type Props = {
  meshNames: string[]
  partsConfig: Record<string, { colorHex: string }>
  windowsConfig: Record<string, { tintPercent: number }>
  onSelectMesh: (meshName: string) => void
  onClose: () => void
}

const GLASS_PATTERNS = ['glass_', 'Window', 'Windshield', 'windshield', 'window', 'Glass']

function isGlass(name: string) {
  return GLASS_PATTERNS.some(p => name.includes(p))
}

export const PartsPanel = forwardRef<BottomSheet, Props>(
  ({ meshNames, partsConfig, windowsConfig, onSelectMesh, onClose }, ref) => {
    const snapPoints = useMemo(() => ['60%', '90%'], [])

    const bodyParts = useMemo(() => meshNames.filter(n => !isGlass(n)), [meshNames])
    const glassParts = useMemo(() => meshNames.filter(n => isGlass(n)), [meshNames])

    const renderItem = useCallback(({ item }: { item: string }) => {
      const wrapped = partsConfig[item]
      const tinted = windowsConfig[item]?.tintPercent > 0
      const glass = isGlass(item)

      return (
        <TouchableOpacity style={styles.row} onPress={() => onSelectMesh(item)}>
          <View style={styles.rowLeft}>
            {wrapped ? (
              <View style={[styles.dot, { backgroundColor: wrapped.colorHex }]} />
            ) : tinted ? (
              <View style={[styles.dot, { backgroundColor: '#444' }]} />
            ) : (
              <View style={[styles.dot, styles.dotEmpty]} />
            )}
            <Text style={styles.meshName} numberOfLines={1}>{item}</Text>
          </View>
          <Text style={styles.tag}>
            {glass ? 'стекло' : wrapped ? 'оклеено' : tinted ? 'тонировано' : 'не обработано'}
          </Text>
        </TouchableOpacity>
      )
    }, [partsConfig, windowsConfig, onSelectMesh])

    type ListEntry = { type: 'header'; title: string } | { type: 'item'; name: string }

    const data = useMemo<ListEntry[]>(() => {
      const result: ListEntry[] = []
      if (bodyParts.length > 0) {
        result.push({ type: 'header', title: `Кузов (${bodyParts.length})` })
        bodyParts.forEach(n => result.push({ type: 'item', name: n }))
      }
      if (glassParts.length > 0) {
        result.push({ type: 'header', title: `Стёкла (${glassParts.length})` })
        glassParts.forEach(n => result.push({ type: 'item', name: n }))
      }
      return result
    }, [bodyParts, glassParts])

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.header}>
          <Text style={styles.title}>Детали автомобиля</Text>
          <Text style={styles.subtitle}>Нажмите на деталь для оклейки или тонировки</Text>
        </BottomSheetView>
        <BottomSheetFlatList
          data={data}
          keyExtractor={(item: ListEntry, i: number) => (item.type === 'header' ? `h-${i}` : item.name)}
          renderItem={({ item }: { item: ListEntry }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionHeader}>{item.title}</Text>
            }
            return renderItem({ item: item.name })
          }}
          contentContainerStyle={styles.list}
        />
      </BottomSheet>
    )
  }
)

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#141414' },
  handle: { backgroundColor: 'rgba(201,168,76,0.3)' },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  subtitle: { color: '#666', fontSize: 12, marginTop: 4 },
  list: { paddingBottom: 40 },
  sectionHeader: {
    color: '#C9A84C', fontSize: 11, fontWeight: '700',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(201,168,76,0.06)',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  dotEmpty: { borderWidth: 1, borderColor: '#444', backgroundColor: 'transparent' },
  meshName: { color: '#ccc', fontSize: 13, flex: 1 },
  tag: { color: '#555', fontSize: 11 },
})
