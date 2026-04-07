import { useRef, useCallback, useEffect, useState } from 'react'
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
import { loadGlbDataUri } from '@/constants/car-glb-map'
import { GlbKey } from '@/constants/glb-assets'

const DEMO_GLB = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb'

export default function EditorScreen() {
  const { carId, glbUrl, glbKey, carName } = useLocalSearchParams<{ carId: string; glbUrl?: string; glbKey?: string; carName?: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const viewerRef = useRef<CarViewerHandle>(null)
  const materialSheetRef = useRef<BottomSheet>(null)
  const tintSheetRef = useRef<BottomSheet>(null)

  const {
    selectedMesh, partsConfig, windowsConfig,
    selectedStudioId, selectedStudioHashtag,
    setCarId, selectMesh, applyMaterial, applyTint, resetAll,
  } = useEditorStore()

  const [modelUrl, setModelUrl] = useState(glbUrl || DEMO_GLB)
  const viewerReadyRef = useRef(false)
  const pendingUrlRef = useRef<string | null>(null)

  useEffect(() => {
    setCarId(carId, modelUrl)
    if (glbKey) {
      loadGlbDataUri(glbKey as GlbKey).then(dataUri => {
        if (viewerReadyRef.current) {
          viewerRef.current?.send({ type: 'load_model', glbUrl: dataUri })
        } else {
          pendingUrlRef.current = dataUri
        }
        setModelUrl(dataUri)
      }).catch(() => {})
    }
  }, [carId])

  const handleViewerMessage = useCallback((msg: WebViewToRN) => {
    if (msg.type === 'ready') {
      viewerReadyRef.current = true
      const url = pendingUrlRef.current ?? modelUrl
      viewerRef.current?.send({ type: 'load_model', glbUrl: url })
      pendingUrlRef.current = null
      return
    }
    if (msg.type === 'model_loaded') {
      const { partsConfig, windowsConfig } = useEditorStore.getState()
      Object.entries(partsConfig).forEach(([meshName, { colorHex, finish }]) => {
        viewerRef.current?.send({ type: 'apply_material', meshName, colorHex, finish })
      })
      Object.entries(windowsConfig).forEach(([meshName, { tintPercent }]) => {
        if (tintPercent > 0) viewerRef.current?.send({ type: 'apply_tint', meshName, tintPercent })
      })
    } else if (msg.type === 'mesh_tapped') {
      selectMesh(msg.meshName)
      viewerRef.current?.send({ type: 'highlight_mesh', meshName: msg.meshName })
      if (msg.isGlass) {
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


  const deselectMesh = useCallback(() => {
    selectMesh(null)
    viewerRef.current?.send({ type: 'highlight_mesh', meshName: null })
  }, [selectMesh])

  const handleMaterialSelect = useCallback((materialId: string, colorHex: string, finish: any) => {
    if (!selectedMesh) return
    applyMaterial(selectedMesh, { materialId, colorHex, finish })
    viewerRef.current?.send({ type: 'apply_material', meshName: selectedMesh, colorHex, finish })
    materialSheetRef.current?.close()
    deselectMesh()
  }, [selectedMesh, applyMaterial, deselectMesh])

  const handleTintChange = useCallback((meshName: string, tintPercent: number) => {
    applyTint(meshName, tintPercent)
    viewerRef.current?.send({ type: 'apply_tint', meshName, tintPercent })
  }, [applyTint])

  const handleReset = useCallback(() => {
    resetAll()
    viewerRef.current?.send({ type: 'reset_all' })
    viewerRef.current?.send({ type: 'highlight_mesh', meshName: null })
  }, [resetAll])

  const handleSendOrder = useCallback(async () => {
    if (!user) return Alert.alert('Войдите чтобы отправить заявку')

    const partsArray = Object.entries(partsConfig).map(([part_id, v]) => ({ part_id, ...v }))
    const windowsArray = Object.entries(windowsConfig).map(([window_id, v]) => ({ window_id, ...v }))

    if (partsArray.length === 0 && windowsArray.length === 0) {
      return Alert.alert('Выберите хотя бы один элемент', 'Нажмите на деталь машины чтобы изменить цвет')
    }

    // Если студия не выбрана — предложить выбрать
    if (!selectedStudioId) {
      Alert.alert(
        'Выберите студию',
        'Посмотрите галерею работ и выберите студию по хэштегу',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Выбрать студию', onPress: () => router.push('/studio/select-studio' as any) },
        ]
      )
      return
    }

    try {
      await createOrder({
        client_id: user.id,
        car_id: carId,
        car_name: carName ?? '',
        parts_config: partsArray as any,
        windows_config: windowsArray as any,
        studio_id: selectedStudioId,
      })
      Alert.alert(
        'Заявка отправлена!',
        `Заявка отправлена в студию ${selectedStudioHashtag}. Ожидайте подтверждения.`,
        [{ text: 'Мои заявки', onPress: () => router.push('/orders') }, { text: 'OK' }]
      )
    } catch (e: any) {
      Alert.alert('Ошибка', e.message)
    }
  }, [user, carId, partsConfig, windowsConfig, selectedStudioId, selectedStudioHashtag, router])

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
          {selectedMesh
            ? <Text style={styles.selectedMesh}>✦ {selectedMesh}</Text>
            : <>
                {partsCount > 0 && <Text style={styles.stat}>{partsCount} деталей</Text>}
                {tintCount > 0 && <Text style={styles.stat}>{tintCount} стёкол</Text>}
                <TouchableOpacity onPress={() => router.push('/studio/select-studio' as any)}>
                  <Text style={selectedStudioHashtag ? styles.studioSelected : styles.studioPick}>
                    {selectedStudioHashtag ?? '+ Студия'}
                  </Text>
                </TouchableOpacity>
              </>
          }
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
          <Text style={styles.hintText}>Увеличь (pinch) и нажми на деталь — бампер, зеркало, молдинг</Text>
        </View>
      )}

      <MaterialSheet
        ref={materialSheetRef}
        meshName={selectedMesh}
        onSelect={handleMaterialSelect}
        onClose={deselectMesh}
      />
      <TintSheet
        ref={tintSheetRef}
        windowsConfig={windowsConfig}
        onTintChange={handleTintChange}
        onClose={deselectMesh}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(10,10,10,0.9)',
  },
  backBtn: { padding: 4 },
  backText: { color: '#C9A84C', fontSize: 16 },
  resetText: { color: '#e63946', fontSize: 14 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,10,0.95)',
    padding: 16, paddingBottom: 32,
  },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' },
  stat: { color: '#666', fontSize: 12 },
  selectedMesh: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  studioPick: { color: '#555', fontSize: 12, borderWidth: 1, borderColor: '#333', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  studioSelected: { color: '#C9A84C', fontSize: 12, fontWeight: '700', borderWidth: 1, borderColor: '#C9A84C', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  btnSecondary: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)', alignItems: 'center',
  },
  btnSecondaryText: { color: '#fff', fontWeight: '600' },
  btnPrimary: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#C9A84C', alignItems: 'center',
  },
  btnPrimaryText: { color: '#000', fontWeight: '800' },
  hint: {
    position: 'absolute', top: '50%', left: 24, right: 24,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12,
  },
})
