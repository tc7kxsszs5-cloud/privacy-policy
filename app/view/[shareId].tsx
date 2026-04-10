import { useRef, useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { CarViewer, CarViewerHandle } from '@/components/CarViewer'
import { WebViewToRN } from '@/components/CarViewer/bridge'
import { supabase } from '@/constants/supabase'
import { loadGlbDataUri } from '@/constants/car-glb-map'
import { GlbKey } from '@/constants/glb-assets'

type SharedConfig = {
  car_name: string
  glb_key: string
  parts_config: { part_id: string; colorHex: string; finish: string }[]
  windows_config: { window_id: string; tintPercent: number }[]
}

const DEMO_GLB = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb'

export default function ViewScreen() {
  const { shareId } = useLocalSearchParams<{ shareId: string }>()
  const router = useRouter()
  const viewerRef = useRef<CarViewerHandle>(null)
  const viewerReadyRef = useRef(false)
  const pendingConfigRef = useRef<SharedConfig | null>(null)
  const modelUrlRef = useRef(DEMO_GLB)

  const [config, setConfig] = useState<SharedConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('shared_configurations')
      .select('car_name, glb_key, parts_config, windows_config')
      .eq('id', shareId)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          Alert.alert('Ошибка', 'Конфигурация не найдена')
          router.back()
          return
        }

        const cfg = data as SharedConfig
        setConfig(cfg)
        setLoading(false)

        if (cfg.glb_key) {
          try {
            const dataUri = await loadGlbDataUri(cfg.glb_key as GlbKey)
            modelUrlRef.current = dataUri
          } catch {}
        }

        if (viewerReadyRef.current) {
          viewerRef.current?.send({ type: 'load_model', glbUrl: modelUrlRef.current })
        } else {
          pendingConfigRef.current = cfg
        }
      })
  }, [shareId])

  const handleViewerMessage = useCallback((msg: WebViewToRN) => {
    if (msg.type === 'ready') {
      viewerReadyRef.current = true
      viewerRef.current?.send({ type: 'load_model', glbUrl: modelUrlRef.current })
      if (pendingConfigRef.current) {
        pendingConfigRef.current = pendingConfigRef.current
      }
      return
    }
    if (msg.type === 'model_loaded') {
      const cfg = pendingConfigRef.current ?? config
      if (!cfg) return
      cfg.parts_config.forEach(({ part_id, colorHex, finish }) => {
        viewerRef.current?.send({ type: 'apply_material', meshName: part_id, colorHex, finish: finish as any })
      })
      cfg.windows_config.forEach(({ window_id, tintPercent }) => {
        if (tintPercent > 0) viewerRef.current?.send({ type: 'apply_tint', meshName: window_id, tintPercent })
      })
      pendingConfigRef.current = null
    }
  }, [config])

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{config?.car_name ?? 'Конфигурация'}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading
        ? <View style={styles.loader}><ActivityIndicator color="#C9A84C" size="large" /></View>
        : <CarViewer ref={viewerRef} onMessage={handleViewerMessage} />
      }

      <View style={styles.footer}>
        <Text style={styles.footerText}>Режим просмотра</Text>
        <Text style={styles.footerSub}>Чтобы создать свою конфигурацию — скачайте приложение</Text>
      </View>
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
  backBtn: { padding: 4, width: 60 },
  backText: { color: '#C9A84C', fontSize: 16 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,10,0.95)',
    padding: 16, paddingBottom: 32, alignItems: 'center', gap: 4,
  },
  footerText: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  footerSub: { color: '#555', fontSize: 12, textAlign: 'center' },
})
