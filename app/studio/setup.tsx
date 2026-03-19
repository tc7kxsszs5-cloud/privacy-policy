import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getStudioProfile, upsertStudioProfile } from '@/constants/studio-service'
import { useAuth } from '@/constants/AuthContext'

export default function StudioSetupScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: 'Флор',
    description: '',
    address: '',
    phone: '',
    telegram: '',
    whatsapp: '',
  })

  useEffect(() => {
    getStudioProfile()
      .then(profile => {
        if (profile) setForm(f => ({
          ...f,
          name: profile.name || f.name,
          description: profile.description || f.description,
          address: profile.address || f.address,
          phone: profile.phone || f.phone,
          telegram: profile.telegram || f.telegram,
          whatsapp: profile.whatsapp || f.whatsapp,
        }))
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!user) return Alert.alert('Не авторизованы')
    setSaving(true)
    try {
      await upsertStudioProfile(user.id, form)
      Alert.alert('Сохранено!', '', [{ text: 'OK', onPress: () => router.back() }])
    } catch (e: any) {
      Alert.alert('Ошибка', e.message)
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof typeof form, label: string, placeholder: string) => (
    <View style={styles.field} key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
        placeholder={placeholder}
        placeholderTextColor="#555"
      />
    </View>
  )

  if (loading) return <View style={styles.center}><ActivityIndicator color="#e63946" /></View>

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Настройки студии</Text>

        {field('name', 'Название', 'Флор')}
        {field('description', 'Описание', 'Профессиональная оклейка автомобилей')}
        {field('address', 'Адрес', 'ул. Примерная, 1')}
        {field('phone', 'Телефон', '+7 (900) 000-00-00')}
        {field('telegram', 'Telegram', '@flor_detailing')}
        {field('whatsapp', 'WhatsApp', '79000000000')}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Сохраняем...' : 'Сохранить'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 28 },
  field: { marginBottom: 20 },
  label: { color: '#888', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2a2a',
  },
  saveBtn: {
    backgroundColor: '#e63946', padding: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
