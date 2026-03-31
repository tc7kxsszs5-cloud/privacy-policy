import { useEffect, useState } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal, Dimensions, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/constants/supabase'

type StudioWork = {
  id: string
  photo_url: string
  description: string | null
  hashtag: string
  created_at: string
}

const { width } = Dimensions.get('window')
const ITEM_SIZE = (width - 48) / 2

export default function GalleryScreen() {
  const router = useRouter()
  const [works, setWorks] = useState<StudioWork[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<StudioWork | null>(null)

  useEffect(() => {
    supabase
      .from('studio_works')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setWorks(data)
        setLoading(false)
      })
  }, [])

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
      ) : works.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Работы скоро появятся</Text>
          <Text style={styles.emptySub}>#detailingtime</Text>
        </View>
      ) : (
        <FlatList
          data={works}
          keyExtractor={w => w.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => setSelected(item)} activeOpacity={0.85}>
              <Image source={{ uri: item.photo_url }} style={styles.photo} resizeMode="cover" />
              <View style={styles.overlay}>
                <Text style={styles.hashtag}>{item.hashtag}</Text>
              </View>
            </TouchableOpacity>
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
              ) : null}
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
  grid: { padding: 16, paddingTop: 8 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  item: {
    width: ITEM_SIZE, height: ITEM_SIZE,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  photo: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 6,
  },
  hashtag: { color: '#C9A84C', fontSize: 11, fontWeight: '700' },
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
  modalHashtag: { color: '#C9A84C', fontSize: 13, fontWeight: '700' },
})
