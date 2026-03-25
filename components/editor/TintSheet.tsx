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
                minimumTrackTintColor="#C9A84C"
                maximumTrackTintColor="rgba(201,168,76,0.15)"
                thumbTintColor="#C9A84C"
              />
            </View>
          )
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#141414' },
  handle: { backgroundColor: 'rgba(201,168,76,0.3)' },
  container: { padding: 16, paddingBottom: 32 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  row: { marginBottom: 16 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  glassName: { color: '#ccc', fontSize: 14 },
  tintValue: { color: '#C9A84C', fontSize: 14, fontWeight: '600' },
  tintPreview: { height: 20, backgroundColor: '#0a0a0a', borderRadius: 4, marginBottom: 4 },
  slider: { width: '100%', height: 32 },
})
