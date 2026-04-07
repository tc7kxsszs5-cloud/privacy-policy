import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/constants/supabase'
import { useEditorStore } from '@/constants/editor-store'

const { width } = Dimensions.get('window')
const ITEM_SIZE = (width - 48) / 2

type StudioWork = {
  id: string
  studio_id: string
  photo_url: string
  hashtag: string
  description: string | null
}

type Studio = {
  id: string
  name: string
  hashtag: string
  works: StudioWork[]
}

export default function SelectStudioScreen() {
  const router = useRouter()
  const selectStudio = useEditorStore(s => s.selectStudio)
  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudios()
  }, [])

  async function loadStudios() {
    // Загрузим все студии с их работами
    const { data: works } = await supabase
      .from('studio_works')
      .select('id, studio_id, photo_url, hashtag, description')
      .order('created_at', { ascending: false })

    const { data: profiles } = await supabase
      .from('studio_profiles')
      .select('id, name, hashtag')

    if (!profiles) { setLoading(false); return }

    // Группируем работы по студии
    const map: Record<string, Studio> = {}
    for (const p of profiles) {
      map[p.id] = { id: p.id, name: p.name, hashtag: p.hashtag || `#${p.name}`, works: [] }
    }
    for (const w of works ?? []) {
      if (map[w.studio_id]) map[w.studio_id].works.push(w)
    }

    // Только студии с работами
    setStudios(Object.values(map).filter(s => s.works.length > 0))
    setLoading(false)
  }

  function confirmSelect(studio: Studio) {
    Alert.alert(
      `Выбрать ${studio.hashtag}?`,
      `Заявка будет отправлена в студию "${studio.name}"`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выбрать',
          onPress: () => {
            selectStudio(studio.id, studio.hashtag)
            router.back()
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Выберите студию</Text>
        <View style={{ width: 60 }} />
      </View>
      <Text style={styles.subtitle}>Просмотрите работы студий и выберите по хэштегу</Text>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#C9A84C" /></View>
      ) : studios.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Студии пока не добавили работы</Text>
        </View>
      ) : (
        <FlatList
          data={studios}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: studio }) => (
            <View style={styles.studioBlock}>
              <View style={styles.studioHeader}>
                <Text style={styles.studioHashtag}>{studio.hashtag}</Text>
                <Text style={styles.studioName}>{studio.name}</Text>
                <TouchableOpacity style={styles.selectBtn} onPress={() => confirmSelect(studio)}>
                  <Text style={styles.selectBtnText}>Выбрать</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={studio.works.slice(0, 6)}
                keyExtractor={w => w.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.worksRow}
                renderItem={({ item: work }) => (
                  <View style={styles.workThumb}>
                    <Image source={{ uri: work.photo_url }} style={styles.workPhoto} resizeMode="cover" />
                  </View>
                )}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  back: { color: '#C9A84C', fontSize: 16, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#666', fontSize: 13, paddingHorizontal: 16, paddingVertical: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#666', fontSize: 16 },
  list: { paddingBottom: 48 },

  studioBlock: {
    marginBottom: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 16,
  },
  studioHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10, gap: 8,
  },
  studioHashtag: { color: '#C9A84C', fontSize: 15, fontWeight: '800', flex: 1 },
  studioName: { color: '#666', fontSize: 12 },
  selectBtn: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1, borderColor: '#C9A84C',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  selectBtnText: { color: '#C9A84C', fontSize: 13, fontWeight: '700' },

  worksRow: { paddingHorizontal: 16, gap: 8 },
  workThumb: {
    width: 110, height: 82,
    borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  workPhoto: { width: '100%', height: '100%' },
})
