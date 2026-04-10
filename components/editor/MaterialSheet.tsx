import { forwardRef, useCallback, useMemo, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { MATERIAL_PRESETS, FINISH_LABELS } from '@/constants/materials-data'
import type { MaterialFinish } from '@/components/CarViewer/bridge'

type Props = {
  meshName: string | null
  onSelect: (materialId: string, colorHex: string, finish: MaterialFinish) => void
  onClose: () => void
  onOpen?: () => void
  onDismiss?: () => void
}

const FINISHES: MaterialFinish[] = ['gloss', 'matte', 'satin', 'pearl', 'carbon', 'chrome']

// Visual finish overlay shown on swatches to indicate material type
function FinishOverlay({ finish }: { finish: MaterialFinish }) {
  if (finish === 'gloss') {
    return (
      <View style={overlay.gloss} pointerEvents="none" />
    )
  }
  if (finish === 'chrome') {
    return (
      <View style={overlay.chrome} pointerEvents="none" />
    )
  }
  if (finish === 'pearl') {
    return (
      <View style={overlay.pearl} pointerEvents="none" />
    )
  }
  if (finish === 'carbon') {
    return (
      <View style={overlay.carbon} pointerEvents="none" />
    )
  }
  if (finish === 'satin') {
    return (
      <View style={overlay.satin} pointerEvents="none" />
    )
  }
  return null
}

export const MaterialSheet = forwardRef<BottomSheet, Props>(
  ({ meshName, onSelect, onClose, onOpen, onDismiss }, ref) => {
    const [activeFinish, setActiveFinish] = useState<MaterialFinish>('gloss')
    const snapPoints = useMemo(() => ['52%'], [])

    const filtered = MATERIAL_PRESETS.filter(m => m.finish === activeFinish)

    const handleChange = useCallback((index: number) => {
      if (index >= 0) {
        onOpen?.()
      } else {
        onDismiss?.()
        onClose()
      }
    }, [onClose, onOpen, onDismiss])

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleChange}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.container}>
          <Text style={styles.title}>
            {meshName ? `✦ ${meshName}` : 'Выберите материал'}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {FINISHES.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.tab, activeFinish === f && styles.tabActive]}
                onPress={() => setActiveFinish(f)}
              >
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
                activeOpacity={0.75}
              >
                <FinishOverlay finish={item.finish} />
                <Text style={styles.swatchLabel} numberOfLines={1}>
                  {item.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.grid}
          />
        </BottomSheetView>
      </BottomSheet>
    )
  }
)

const overlay = StyleSheet.create({
  // Gloss: bright diagonal highlight — top-left shine
  gloss: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9,
    backgroundColor: 'transparent',
    borderTopWidth: 10,
    borderLeftWidth: 10,
    borderColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // Chrome: strong diagonal gradient effect
  chrome: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 14,
    borderLeftWidth: 14,
    borderColor: 'rgba(255,255,255,0.45)',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // Pearl: soft rainbow tint at top
  pearl: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9,
    backgroundColor: 'rgba(255,220,255,0.12)',
    borderTopWidth: 8,
    borderColor: 'rgba(200,180,255,0.4)',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  // Carbon: dark grid lines
  carbon: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  // Satin: subtle soft sheen
  satin: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 6,
    borderColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
})

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#141414' },
  handle: { backgroundColor: 'rgba(201,168,76,0.35)' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 10, opacity: 0.85 },
  tabs: { flexGrow: 0, marginBottom: 10 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', marginRight: 8,
  },
  tabActive: { borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.1)' },
  tabText: { color: '#555', fontSize: 13 },
  tabTextActive: { color: '#C9A84C', fontWeight: '600' },
  grid: { paddingBottom: 24 },
  swatch: {
    width: '18%', aspectRatio: 1, borderRadius: 10, margin: '1%',
    justifyContent: 'flex-end', padding: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  swatchLabel: {
    color: '#fff', fontSize: 8, fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
})
