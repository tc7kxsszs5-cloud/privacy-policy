import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Image, Alert, ActivityIndicator, TextInput, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/constants/supabase'
import { useAuth } from '@/constants/AuthContext'

type Work = {
  id: string
  photo_url: string
  description: string | null
  hashtag: string
  created_at: string
}

export default function UploadWorksScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [studioId, setStudioId] = useState<string | null>(null)
  const [hashtag, setHashtag] = useState('#detailingtime')
  const [description, setDescription] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user) return
    const { data: studio } = await supabase
      .from('studio_profiles')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (!studio) { setLoading(false); return }
    setStudioId(studio.id)
    setHashtag(`#${studio.name.toLowerCase().replace(/\s+/g, '')}`)

    const { data } = await supabase
      .from('studio_works')
      .select('*')
      .eq('studio_id', studio.id)
      .order('created_at', { ascending: false })

    setWorks(data ?? [])
    setLoading(false)
  }

  async function pickAndUpload() {
    if (!studioId) return
    if (works.length >= 10) {
      Alert.alert('Лимит', 'Максимум 10 фотографий. Удалите старые, чтобы добавить новые.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (result.canceled || !result.assets[0]) return

    setUploading(true)
    try {
      const asset = result.assets[0]
      const ext = asset.uri.split('.').pop() ?? 'jpg'
      const filename = `${studioId}/${Date.now()}.${ext}`

      const response = await fetch(asset.uri)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('studio-gallery')
        .upload(filename, arrayBuffer, { contentType: `image/${ext}` })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage
        .from('studio-gallery')
        .getPublicUrl(filename)

      const { data: work, error: insertError } = await supabase
        .from('studio_works')
        .insert({
          studio_id: studioId,
          photo_url: urlData.publicUrl,
          description: description.trim() || null,
          hashtag: hashtag.trim() || '#detailingtime',
        })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      setWorks(prev => [work, ...prev])
      setDescription('')
      Alert.alert('Готово', 'Фото добавлено в галерею')
    } catch (e: any) {
      Alert.alert('Ошибка', e.message)
    } finally {
      setUploading(false)
    }
  }

  async function deleteWork(work: Work) {
    Alert.alert('Удалить фото?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive',
        onPress: async () => {
          await supabase.from('studio_works').delete().eq('id', work.id)
          // Удалить из storage
          const path = work.photo_url.split('/studio-gallery/')[1]
          if (path) await supabase.storage.from('studio-gallery').remove([path])
          setWorks(prev => prev.filter(w => w.id !== work.id))
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Галерея работ</Text>
        <Text style={styles.counter}>{works.length}/10</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Upload form */}
        <View style={styles.uploadSection}>
          <TextInput
            style={styles.input}
            value={hashtag}
            onChangeText={setHashtag}
            placeholder="#хэштег студии"
            placeholderTextColor="#555"
          />
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={description}
            onChangeText={setDescription}
            placeholder="Описание работы (необязательно)"
            placeholderTextColor="#555"
            multiline
            numberOfLines={2}
          />
          <TouchableOpacity
            style={[styles.uploadBtn, (uploading || works.length >= 10) && styles.uploadBtnDisabled]}
            onPress={pickAndUpload}
            disabled={uploading || works.length >= 10}
          >
            {uploading
              ? <ActivityIndicator color="#0a0a0a" />
              : <Text style={styles.uploadBtnText}>+ Добавить фото</Text>
            }
          </TouchableOpacity>
          {works.length >= 10 && (
            <Text style={styles.limitText}>Достигнут лимит 10 фотографий</Text>
          )}
        </View>

        {/* Works grid */}
        {loading ? (
          <ActivityIndicator color="#C9A84C" style={{ marginTop: 32 }} />
        ) : works.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Пока нет работ</Text>
            <Text style={styles.emptySub}>Добавьте первую фотографию</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {works.map(work => (
              <View key={work.id} style={styles.workItem}>
                <Image source={{ uri: work.photo_url }} style={styles.workPhoto} resizeMode="cover" />
                <View style={styles.workOverlay}>
                  <Text style={styles.workHashtag}>{work.hashtag}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteWork(work)}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  counter: { color: '#C9A84C', fontSize: 15, fontWeight: '700', width: 60, textAlign: 'right' },

  scroll: { padding: 16, paddingBottom: 48 },

  uploadSection: { marginBottom: 24 },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginBottom: 10,
  },
  inputMulti: { height: 72, textAlignVertical: 'top' },
  uploadBtn: {
    backgroundColor: '#C9A84C', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  uploadBtnDisabled: { opacity: 0.4 },
  uploadBtnText: { color: '#0a0a0a', fontSize: 16, fontWeight: '800' },
  limitText: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 8 },

  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  emptySub: { color: '#666', fontSize: 14, marginTop: 6 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  workItem: {
    width: '48%', aspectRatio: 1,
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  workPhoto: { width: '100%', height: '100%' },
  workOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', padding: 6,
  },
  workHashtag: { color: '#C9A84C', fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12,
    width: 24, height: 24, justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnText: { color: '#fff', fontSize: 12 },
})
