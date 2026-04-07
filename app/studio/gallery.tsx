import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Modal, Dimensions, ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/constants/supabase'
import { useEditorStore } from '@/constants/editor-store'

type StudioWork = {
  id: string
  studio_id: string
  photo_url: string
  description: string | null
  hashtag: string
  created_at: string
}

type Studio = {
  id: string
  name: string
  hashtag: string
  works: StudioWork[]
}

const { width } = Dimensions.get('window')

export default function GalleryScreen() {
  const router = useRouter()
  const selectStudio = useEditorStore(s => s.selectStudio)
  const selectedStudioId = useEditorStore(s => s.selectedStudioId)

  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<StudioWork | null>(null)

  useEffect(() => {
    loadGallery()
  }, [])

  async function loadGallery() {
    const [{ data: works }, { data: profiles }] = await Promise.all([
      supabase.from('studio_works').select('*').order('created_at', { ascending: false }),
      supabase.from('studio_profiles').select('id, name, hashtag'),
    ])

    if (!profiles) { setLoading(false); return }

    const map: Record<string, Studio> = {}
    for (const p of profiles) {
      map[p.id] = {
        id: p.id,
        name: p.name,
        hashtag: p.hashtag || `#${p.name.toLowerCase().replace(/\s+/g, '')}`,
        works: [],
      }
    }
    for (const w of works ?? []) {
      if (map[w.studio_id]) map[w.studio_id].works.push(w)
    }

    setStudios(Object.values(map).filter(s => s.works.length > 0))
    setLoading(false)
  }

  function handleSelectStudio(studio: Studio) {
    Alert.alert(
      `Выбрать ${studio.hashtag}?`,
      `Заявки будут отправляться в студию "${studio.name}"`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выбрать',
          onPress: () => {
            selectStudio(studio.id, studio.hashtag)
            Alert.alert(
              'Студия выбрана',
              `${studio.hashtag} сохранён. Теперь создайте конфигурацию и отправьте заявку.`,
              [{ text: 'OK' }]
            )
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
        <Text style={styles.title}>Наши работы</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#C9A84C" />
        </View>
      ) : studios.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Работы скоро появятся</Text>
          <Text style={styles.emptySub}>#detailingtime</Text>
        </View>
      ) : (
        <FlatList
          data={studios}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: studio }) => (
            <View style={styles.studioSection}>
              {/* Studio header */}
              <View style={styles.studioHeader}>
                <View>
                  <Text style={styles.studioHashtag}>{studio.hashtag}</Text>
                  <Text style={styles.studioName}>{studio.name}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    selectedStudioId === studio.id && styles.selectBtnActive,
                  ]}
                  onPress={() => handleSelectStudio(studio)}
                >
                  <Text style={[
                    styles.selectBtnText,
                    selectedStudioId === studio.id && styles.selectBtnTextActive,
                  ]}>
                    {selectedStudioId === studio.id ? '✓ Выбрано' : 'Выбрать'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Works row */}
              <FlatList
                data={studio.works}
                keyExtractor={w => w.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.worksRow}
                renderItem={({ item: work }) => (
                  <TouchableOpacity
                    style={styles.workThumb}
                    onPress={() => setSelected(work)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: work.photo_url }} style={styles.workPhoto} resizeMode="cover" />
                    <View style={styles.workOverlay}>
                      <Text style={styles.workHashtag}>{work.hashtag}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        />
      )}

      {/* Fullscreen viewer */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {selected && (
            <>
              <Image source={{ uri: selected.photo_url }} style={styles.modalPhoto} resizeMode="contain" />
              {selected.description ? (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalDesc}>{selected.description}</Text>
                  <Text style={styles.modalHashtag}>{selected.hashtag}</Text>
                </View>
              ) : (
                <Text style={styles.modalHashtag}>{selected.hashtag}</Text>
              )}
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  back: { color: '#C9A84C', fontSize: 16, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#C9A84C', fontSize: 14 },

  list: { paddingBottom: 48 },

  studioSection: {
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 20,
  },
  studioHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  studioHashtag: { color: '#C9A84C', fontSize: 17, fontWeight: '800' },
  studioName: { color: '#555', fontSize: 12, marginTop: 2 },
  selectBtn: {
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
  },
  selectBtnActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  selectBtnText: { color: '#C9A84C', fontSize: 13, fontWeight: '700' },
  selectBtnTextActive: { color: '#0a0a0a' },

  worksRow: { paddingHorizontal: 16, gap: 10 },
  workThumb: {
    width: 140, height: 105,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  workPhoto: { width: '100%', height: '100%' },
  workOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 5,
  },
  workHashtag: { color: '#C9A84C', fontSize: 10, fontWeight: '700' },

  // Modal
  modal: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalClose: {
    position: 'absolute', top: 60, right: 24, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 18 },
  modalPhoto: { width: width, height: width * 1.1 },
  modalInfo: { padding: 24, alignItems: 'center' },
  modalDesc: { color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 6 },
  modalHashtag: { color: '#C9A84C', fontSize: 13, fontWeight: '700', marginTop: 8 },
})
