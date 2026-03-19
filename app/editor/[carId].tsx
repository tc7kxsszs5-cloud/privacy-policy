import { useRef, useCallback, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet from '@gorhom/bottom-sheet'
import { CarViewer, CarViewerHandle } from '@/components/CarViewer'
import { MaterialSheet } from '@/components/editor/MaterialSheet'
import { TintSheet } from '@/components/editor/TintSheet'
import { useEditorStore } from '@/constants/editor-store'
import { WebViewToRN } from '@/components/CarViewer/bridge'
import { createOrder } from '@/constants/orders-service'
import { useAuth } from '@/constants/AuthContext'

const DEMO_GLB = 'https://threejs.org/examples/models/gltf/ferrari.glb'

export default function EditorScreen() {
  const { carId, glbUrl } = useLocalSearchParams<{ carId: string; glbUrl?: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const viewerRef = useRef<CarViewerHandle>(null)
  const materialSheetRef = useRef<BottomSheet>(null)
  const tintSheetRef = useRef<BottomSheet>(null)

  const {
    selectedMesh, partsConfig, windowsConfig,
    setCarId, selectMesh, applyMaterial, applyTint, resetAll
  } = useEditorStore()

  const modelUrl = glbUrl || DEMO_GLB

  useEffect(() => {
    setCarId(carId, modelUrl)
  }, [carId])

  const handleViewerMessage = useCallback((msg: WebViewToRN) => {
    if (msg.type === 'model_loaded') {
      // Re-apply any saved state
    } else if (msg.type === 'mesh_tapped') {
      const isGlass = msg.meshName.startsWith('glass_')
      selectMesh(msg.meshName)
      if (isGlass) {
        materialSheetRef.current?.close()
        tintSheetRef.current?.expand()
      } else {
        tintSheetRef.current?.close()
        materialSheetRef.current?.expand()
      }
    } else if (msg.type === 'model_error') {
      Alert.alert('Ошибка', 'Не удалось загрузить модель')
    }
  }, [selectMesh])

  useEffect(() => {
    const timer = setTimeout(() => {
      viewerRef.current?.send({ type: 'load_model', glbUrl: modelUrl })
    }, 500)
    return () => clearTimeout(timer)
  }, [modelUrl])

  const handleMaterialSelect = useCallback((materialId: string, colorHex: string, finish: any) => {
    if (!selectedMesh) return
    applyMaterial(selectedMesh, { materialId, colorHex, finish })
    viewerRef.current?.send({ type: 'apply_material', meshName: selectedMesh, colorHex, finish })
    materialSheetRef.current?.close()
    selectMesh(null)
  }, [selectedMesh, applyMaterial, selectMesh])

  const handleTintChange = useCallback((meshName: string, tintPercent: number) => {
    applyTint(meshName, tintPercent)
    viewerRef.current?.send({ type: 'apply_tint', meshName, tintPercent })
  }, [applyTint])

  const handleReset = useCallback(() => {
    resetAll()
    viewerRef.current?.send({ type: 'reset_all' })
  }, [resetAll])

  const handleSendOrder = useCallback(async () => {
    if (!user) return Alert.alert('Войдите чтобы отправить заявку')

    const partsArray = Object.entries(partsConfig).map(([part_id, v]) => ({ part_id, ...v }))
    const windowsArray = Object.entries(windowsConfig).map(([window_id, v]) => ({ window_id, ...v }))

    if (partsArray.length === 0 && windowsArray.length === 0) {
      return Alert.alert('Выберите хотя бы один элемент', 'Нажмите на деталь машины чтобы изменить цвет')
    }

    try {
      await createOrder({
        client_id: user.id,
        car_id: carId,
        car_name: '',
        parts_config: partsArray as any,
        windows_config: windowsArray as any,
      })
      Alert.alert(
        'Заявка отправлена!',
        'Мы получили вашу конфигурацию. Приезжайте в студию Флор для согласования и оплаты.',
        [{ text: 'Мои заявки', onPress: () => router.push('/orders') }, { text: 'OK' }]
      )
    } catch (e: any) {
      Alert.alert('Ошибка', e.message)
    }
  }, [user, carId, partsConfig, windowsConfig, router])

  const handleShare = useCallback(async () => {
    await Share.share({ message: `CarWrap конфигурация машины — carwrap://editor/${carId}` })
  }, [carId])

  const partsCount = Object.keys(partsConfig).length
  const tintCount = Object.keys(windowsConfig).filter(k => windowsConfig[k].tintPercent > 0).length

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Сбросить</Text>
        </TouchableOpacity>
      </View>

      <CarViewer ref={viewerRef} onMessage={handleViewerMessage} />

      <View style={styles.actionBar}>
        <View style={styles.stats}>
          {partsCount > 0 && <Text style={styles.stat}>{partsCount} деталей</Text>}
          {tintCount > 0 && <Text style={styles.stat}>{tintCount} стёкол</Text>}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleShare}>
            <Text style={styles.btnSecondaryText}>Поделиться</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSendOrder}>
            <Text style={styles.btnPrimaryText}>Отправить заявку</Text>
          </TouchableOpacity>
        </View>
      </View>

      {partsCount === 0 && tintCount === 0 && (
        <View style={styles.hint} pointerEvents="none">
          <Text style={styles.hintText}>Нажми на деталь машины чтобы изменить цвет</Text>
        </View>
      )}

      <MaterialSheet
        ref={materialSheetRef}
        meshName={selectedMesh}
        onSelect={handleMaterialSelect}
        onClose={() => selectMesh(null)}
      />
      <TintSheet
        ref={tintSheetRef}
        windowsConfig={windowsConfig}
        onTintChange={handleTintChange}
        onClose={() => selectMesh(null)}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(15,15,15,0.8)',
  },
  backBtn: { padding: 4 },
  backText: { color: '#fff', fontSize: 16 },
  resetText: { color: '#e63946', fontSize: 14 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(15,15,15,0.95)',
    padding: 16, paddingBottom: 32,
  },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stat: { color: '#888', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  btnSecondary: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: '#333', alignItems: 'center',
  },
  btnSecondaryText: { color: '#fff', fontWeight: '600' },
  btnPrimary: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#e63946', alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  hint: {
    position: 'absolute', top: '50%', left: 24, right: 24,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12,
  },
})
