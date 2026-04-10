import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'
import { supabase } from '@/constants/supabase'

export default function StudioRegisterScreen() {
  const [inviteCode, setInviteCode] = useState('')
  const [studioName, setStudioName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  async function handleRegister() {
    if (!inviteCode || !studioName || !email || !password)
      return Alert.alert('Заполните все поля')
    if (password.length < 6)
      return Alert.alert('Пароль должен быть не менее 6 символов')

    setLoading(true)

    // Проверяем инвайт-код
    const { data: codeData, error: codeError } = await supabase
      .from('invite_codes')
      .select('id, used')
      .eq('code', inviteCode.toUpperCase().trim())
      .single()

    if (codeError || !codeData) {
      setLoading(false)
      return Alert.alert('Ошибка', 'Инвайт-код не найден')
    }

    if (codeData.used) {
      setLoading(false)
      return Alert.alert('Ошибка', 'Этот код уже был использован')
    }

    // Регистрируем аккаунт студии
    const { error } = await signUp(email, password, 'studio_owner')
    if (error) {
      setLoading(false)
      return Alert.alert('Ошибка', error)
    }

    // Получаем нового пользователя
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Сохраняем название студии в профиле
      await supabase
        .from('profiles')
        .update({ studio_name: studioName.trim() })
        .eq('id', user.id)

      // Помечаем код как использованный
      await supabase
        .from('invite_codes')
        .update({ used: true, used_by: user.id })
        .eq('id', codeData.id)
    }

    setLoading(false)
    Alert.alert(
      'Готово!',
      'Студия зарегистрирована. Войдите с вашим email и паролем.',
      [{ text: 'Войти', onPress: () => router.replace('/(auth)/studio-login' as any) }]
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>РЕГИСТРАЦИЯ СТУДИИ</Text>
      </View>

      <Text style={styles.title}>DETAILING TIME</Text>
      <Text style={styles.subtitle}>Подключить студию</Text>

      <TextInput
        style={styles.input}
        placeholder="Инвайт-код (получите у администратора)"
        placeholderTextColor="#555"
        value={inviteCode}
        onChangeText={setInviteCode}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Название студии"
        placeholderTextColor="#555"
        value={studioName}
        onChangeText={setStudioName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email студии"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль (минимум 6 символов)"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Регистрируем...' : 'Зарегистрировать студию'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Инвайт-код выдаётся администратором.{'\n'}
        Свяжитесь с нами для получения доступа.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0a0a0a' },
  back: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#555', fontSize: 15 },
  badge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 20,
  },
  badgeText: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: {
    fontSize: 22, fontWeight: '700', color: '#C9A84C',
    textAlign: 'center', marginBottom: 8, letterSpacing: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)', textAlign: 'center',
    fontSize: 14, marginBottom: 40,
  },
  input: {
    backgroundColor: '#141414', color: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
  },
  button: {
    backgroundColor: '#C9A84C', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 16 },
  hint: {
    color: '#333', textAlign: 'center', fontSize: 12,
    lineHeight: 18, marginTop: 32,
  },
})
