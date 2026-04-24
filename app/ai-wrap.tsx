import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { readAsStringAsync } from 'expo-file-system/legacy'
import { generateAiWrap } from '@/constants/ai-wrap-service'
import type { MaterialFinish } from '@/components/CarViewer/bridge'
import {
  AI_WRAP_FINISH_LABELS,
  AI_WRAP_MATERIAL_PRESETS,
  type AiWrapMaterialPreset,
} from '@/constants/ai-wrap-materials'

const FINISHES: MaterialFinish[] = ['gloss', 'matte', 'satin', 'pearl', 'carbon', 'chrome']

const DESIGN_PRESETS = [
  'Хамелеон сине-фиолетовый',
  'Хамелеон зелено-золотой',
  'Голографическая пленка',
  'Камуфляж серый',
  'Камуфляж зеленый',
  'Дрифт-ливрея',
  'Гоночные полосы',
  'Двухцветная оклейка черный верх и цветной низ',
  'Градиент синий в фиолетовый',
  'Градиент красный в черный',
]

type PickedPhoto = {
  uri: string
  mimeType: string
  width?: number
  height?: number
}

export default function AiWrapScreen() {
  const router = useRouter()
  const [photo, setPhoto] = useState<PickedPhoto | null>(null)
  const [prompt, setPrompt] = useState('Чёрный матовый винил')
  const [activeFinish, setActiveFinish] = useState<MaterialFinish>('matte')
  const [selectedMaterialId, setSelectedMaterialId] = useState('m-black')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const resultAspect = useMemo(() => {
    if (!photo?.width || !photo?.height) return 4 / 3
    return photo.width / photo.height
  }, [photo])

  const materials = useMemo(
    () => AI_WRAP_MATERIAL_PRESETS.filter((material) => material.finish === activeFinish),
    [activeFinish]
  )

  function materialPrompt(material: AiWrapMaterialPreset) {
    const finishLabel = AI_WRAP_FINISH_LABELS[material.finish].toLowerCase()
    const brandText = material.brand ? `, пленка ${material.brand}` : ''
    return `${material.name}, ${finishLabel}, цвет ${material.colorHex}${brandText}`
  }

  function selectMaterial(material: AiWrapMaterialPreset) {
    setSelectedMaterialId(material.id)
    setPrompt(materialPrompt(material))
  }

  async function pickPhoto() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        Alert.alert('Нет доступа', 'Разрешите доступ к фото, чтобы загрузить машину')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.55,
        allowsEditing: true,
        aspect: [4, 3],
        base64: false,
        selectionLimit: 1,
      })

      if (result.canceled || !result.assets[0]) return

      const asset = result.assets[0]
      setPhoto({
        uri: asset.uri,
        mimeType: asset.mimeType || 'image/jpeg',
        width: asset.width,
        height: asset.height,
      })
      setResultUrl(null)
    } catch (e: any) {
      Alert.alert('Ошибка загрузки фото', e.message || 'Попробуйте выбрать другое изображение')
    }
  }

  async function generate() {
    if (!photo) {
      Alert.alert('Загрузите фото', 'Сначала выберите фото автомобиля или мотоцикла')
      return
    }
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt) {
      Alert.alert('Опишите пленку', 'Напишите цвет, материал или дизайн оклейки')
      return
    }

    setLoading(true)
    try {
      const imageBase64 = await readAsStringAsync(photo.uri, { encoding: 'base64' })
      const result = await generateAiWrap({
        imageBase64,
        mimeType: photo.mimeType,
        prompt: cleanPrompt,
        quality: 'medium',
        size: resultAspect >= 1 ? '1536x1024' : '1024x1536',
      })
      setResultUrl(result.imageUrl)
    } catch (e: any) {
      Alert.alert('Не удалось сгенерировать', e.message || 'Проверьте подключение к AI-серверу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>AI примерка</Text>
          <Text style={styles.subtitle}>Detailing Time</Text>
        </View>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Фото авто</Text>
          <Text style={styles.heroTitle}>Примерь пленку на своей машине</Text>
          <Text style={styles.heroText}>
            Загрузи фото, выбери цвет или напиши идею. Лучше работает фото, где кузов хорошо виден.
          </Text>
        </View>

        <TouchableOpacity style={styles.uploadBox} onPress={pickPhoto} activeOpacity={0.88}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.uploadImage} resizeMode="cover" />
          ) : (
            <View style={styles.uploadEmpty}>
              <Text style={styles.plus}>+</Text>
              <Text style={styles.uploadTitle}>Загрузить фото</Text>
              <Text style={styles.uploadHint}>JPG, PNG или WEBP</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Палитра пленок</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.finishTabs}>
          {FINISHES.map((finish) => (
            <TouchableOpacity
              key={finish}
              style={[styles.finishTab, activeFinish === finish && styles.finishTabActive]}
              onPress={() => setActiveFinish(finish)}
            >
              <Text style={[styles.finishTabText, activeFinish === finish && styles.finishTabTextActive]}>
                {AI_WRAP_FINISH_LABELS[finish]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.paletteGrid}>
          {materials.map((material) => (
            <TouchableOpacity
              key={material.id}
              style={[
                styles.swatch,
                { backgroundColor: material.colorHex },
                selectedMaterialId === material.id && styles.swatchActive,
              ]}
              onPress={() => selectMaterial(material)}
              activeOpacity={0.78}
            >
              <FinishOverlay finish={material.finish} />
              <Text style={styles.swatchLabel} numberOfLines={1}>{material.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Идея или уточнение</Text>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Например: сатиновый зеленый винил"
          placeholderTextColor="#555"
          multiline
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presets}>
          {DESIGN_PRESETS.map((item) => (
            <TouchableOpacity key={item} style={styles.preset} onPress={() => setPrompt(item)}>
              <Text style={styles.presetText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.generateBtn, (!photo || loading) && styles.generateBtnDisabled]}
          onPress={generate}
          disabled={!photo || loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.generateText}>Сгенерировать фото</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resultBlock}>
          <Text style={styles.resultTitle}>Результат оклейки</Text>
          <View style={[styles.resultFrame, { aspectRatio: resultAspect }]}>
            {resultUrl ? (
              <Image source={{ uri: resultUrl }} style={styles.resultImage} resizeMode="cover" />
            ) : (
              <View style={styles.resultEmpty}>
                <Text style={styles.resultEmptyTitle}>Результат появится здесь</Text>
                <Text style={styles.resultEmptyText}>Обычно генерация занимает 15-60 секунд</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function FinishOverlay({ finish }: { finish: MaterialFinish }) {
  if (finish === 'gloss') return <View style={overlay.gloss} pointerEvents="none" />
  if (finish === 'chrome') return <View style={overlay.chrome} pointerEvents="none" />
  if (finish === 'pearl') return <View style={overlay.pearl} pointerEvents="none" />
  if (finish === 'carbon') return <View style={overlay.carbon} pointerEvents="none" />
  if (finish === 'satin') return <View style={overlay.satin} pointerEvents="none" />
  return null
}

const overlay = StyleSheet.create({
  gloss: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderTopWidth: 12,
    borderLeftWidth: 12,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  chrome: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderTopWidth: 16,
    borderLeftWidth: 16,
    borderColor: 'rgba(255,255,255,0.48)',
  },
  pearl: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: 'rgba(255,220,255,0.14)',
    borderTopWidth: 9,
    borderColor: 'rgba(200,180,255,0.42)',
  },
  carbon: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  satin: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 7,
    borderColor: 'rgba(255,255,255,0.16)',
  },
})

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.15)',
  },
  back: { color: '#C9A84C', fontSize: 16, width: 64 },
  headerCenter: { alignItems: 'center' },
  title: { color: '#C9A84C', fontSize: 16, fontWeight: '900' },
  subtitle: { color: '#666', fontSize: 12, marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  hero: { marginBottom: 18 },
  kicker: { color: '#C9A84C', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 36, marginTop: 8 },
  heroText: { color: 'rgba(255,255,255,0.62)', fontSize: 14, lineHeight: 21, marginTop: 10 },
  uploadBox: {
    minHeight: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    marginBottom: 18,
  },
  uploadImage: { width: '100%', height: 260 },
  uploadEmpty: { minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: 24 },
  plus: { color: '#C9A84C', fontSize: 46, lineHeight: 52, fontWeight: '300' },
  uploadTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 6 },
  uploadHint: { color: '#666', fontSize: 13, marginTop: 6 },
  label: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 8 },
  finishTabs: { gap: 8, paddingBottom: 12 },
  finishTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.16)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  finishTabActive: { borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.12)' },
  finishTabText: { color: '#666', fontSize: 13, fontWeight: '700' },
  finishTabTextActive: { color: '#C9A84C' },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  swatch: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'flex-end',
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  swatchActive: { borderColor: '#C9A84C', borderWidth: 2 },
  swatchLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    minHeight: 86,
    backgroundColor: '#151515',
    color: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 21,
  },
  presets: { gap: 8, paddingVertical: 14 },
  preset: {
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  presetText: { color: '#C9A84C', fontSize: 13, fontWeight: '700' },
  generateBtn: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  generateBtnDisabled: { opacity: 0.45 },
  generateText: { color: '#0a0a0a', fontSize: 16, fontWeight: '900' },
  resultBlock: { marginBottom: 12 },
  resultTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  resultFrame: {
    width: '100%',
    minHeight: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resultImage: { width: '100%', height: '100%' },
  resultEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultEmptyTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  resultEmptyText: { color: '#666', fontSize: 13, marginTop: 8, textAlign: 'center' },
})
