import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Clipboard
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/constants/AuthContext'
import { supabase } from '@/constants/supabase'

type InviteCode = {
  id: string
  code: string
  used: boolean
  created_at: string
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'STUDIO-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function AdminScreen() {
  const { profile } = useAuth()
  const router = useRouter()
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile?.role !== 'admin') {
      router.replace('/')
      return
    }
    loadCodes()
  }, [profile])

  async function loadCodes() {
    const { data } = await supabase
      .from('invite_codes')
      .select('id, code, used, created_at')
      .order('created_at', { ascending: false })
    if (data) setCodes(data)
  }

  async function createCode() {
    setLoading(true)
    const code = generateCode()
    const { error } = await supabase
      .from('invite_codes')
      .insert({ code })

    if (error) {
      setLoading(false)
      return Alert.alert('Ошибка', error.message)
    }

    await loadCodes()
    setLoading(false)

    Alert.alert(
      'Код создан',
      code,
      [
        { text: 'Скопировать', onPress: () => Clipboard.setString(code) },
        { text: 'ОК' }
      ]
    )
  }

  if (profile?.role !== 'admin') return null

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Панель администратора</Text>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={createCode} disabled={loading}>
          <Text style={styles.createBtnText}>
            {loading ? 'Создаём...' : '+ Создать инвайт-код'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Выданные коды</Text>

        {codes.length === 0 && (
          <Text style={styles.empty}>Кодов пока нет</Text>
        )}

        {codes.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.codeRow, item.used && styles.codeRowUsed]}
            onPress={() => {
              if (!item.used) {
                Clipboard.setString(item.code)
                Alert.alert('Скопировано', item.code)
              }
            }}
          >
            <View>
              <Text style={[styles.codeText, item.used && styles.codeTextUsed]}>
                {item.code}
              </Text>
              <Text style={styles.codeDate}>
                {new Date(item.created_at).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            <View style={[styles.badge, item.used ? styles.badgeUsed : styles.badgeFree]}>
              <Text style={styles.badgeText}>{item.used ? 'Использован' : 'Свободен'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 20, paddingBottom: 48 },
  header: { marginBottom: 28 },
  back: { color: '#555', fontSize: 15, marginBottom: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  createBtn: {
    backgroundColor: '#C9A84C', borderRadius: 14,
    padding: 18, alignItems: 'center', marginBottom: 32,
  },
  createBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)', fontSize: 12,
    fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 12,
  },
  empty: { color: '#333', textAlign: 'center', marginTop: 32, fontSize: 14 },
  codeRow: {
    backgroundColor: '#141414', borderRadius: 14,
    padding: 16, marginBottom: 10, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  codeRowUsed: { opacity: 0.4 },
  codeText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  codeTextUsed: { color: '#555' },
  codeDate: { color: '#444', fontSize: 12, marginTop: 4 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeFree: { backgroundColor: 'rgba(79,201,107,0.15)' },
  badgeUsed: { backgroundColor: 'rgba(255,255,255,0.05)' },
  badgeText: { color: '#4fc96b', fontSize: 11, fontWeight: '700' },
})
