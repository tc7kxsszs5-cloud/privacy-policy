import { forwardRef, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import Slider from '@react-native-community/slider'
import { GLASS_MESHES } from '@/constants/materials-data'

type Props = {
  windowsConfig: Record<string, { tintPercent: number }>
  onTintChange: (meshName: string, tintPercent: number) => void
  onClose: () => void
}

export const TintSheet = forwardRef<BottomSheet, Props>(({ windowsConfig, onTintChange, onClose }, ref) => {
  const snapPoints = useMemo(() => ['45%'], [])

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
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Тонировка стёкол</Text>
        {GLASS_MESHES.map(g => {
          const tint = windowsConfig[g.meshName]?.tintPercent ?? 0
          return (
            <View key={g.meshName} style={styles.row}>
              <View style={styles.rowLabel}>
                <Text style={styles.glassName}>{g.label}</Text>
                <Text style={styles.tintValue}>{tint}%</Text>
              </View>
              <View style={[styles.tintPreview, { opacity: 1 - (tint / 100) * 0.9 }]} />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={95}
                step={5}
                value={tint}
                onValueChange={v => onTintChange(g.meshName, Math.round(v))}
                minimumTrackTintColor="#e63946"
                maximumTrackTintColor="#333"
                thumbTintColor="#e63946"
              />
            </View>
          )
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#1a1a1a' },
  handle: { backgroundColor: '#444' },
  container: { padding: 16, paddingBottom: 32 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  row: { marginBottom: 16 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  glassName: { color: '#ccc', fontSize: 14 },
  tintValue: { color: '#e63946', fontSize: 14, fontWeight: '600' },
  tintPreview: { height: 20, backgroundColor: '#111', borderRadius: 4, marginBottom: 4 },
  slider: { width: '100%', height: 32 },
})
