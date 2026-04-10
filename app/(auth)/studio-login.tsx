import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'

export default function StudioLoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingCheck, setPendingCheck] = useState(false)
  const { signIn, signOut, profile } = useAuth()
  const router = useRouter()

  // После входа — проверяем роль
  useEffect(() => {
    if (!pendingCheck || !profile) return
    setPendingCheck(false)

    if (profile.role !== 'studio_owner') {
      signOut()
      Alert.alert(
        'Нет доступа',
        'Этот вход только для студий-партнёров. Обратитесь к администратору.'
      )
    } else {
      router.replace('/studio/dashboard' as any)
    }
  }, [profile, pendingCheck])

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Заполните все поля')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      Alert.alert('Ошибка', error)
      return
    }

    // Ждём загрузки профиля через useEffect выше
    setPendingCheck(true)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>СТУДИЯ / ПАРТНЁР</Text>
      </View>

      <Text style={styles.title}>DETAILING TIME</Text>
      <Text style={styles.subtitle}>Вход для студий</Text>

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
        placeholder="Пароль"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Вход...' : 'Войти как студия'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => router.push('/(auth)/studio-register' as any)}
      >
        <Text style={styles.registerLinkText}>Нет аккаунта? Зарегистрировать студию →</Text>
      </TouchableOpacity>
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
  registerLink: { alignItems: 'center', marginTop: 32 },
  registerLinkText: { color: '#C9A84C', fontSize: 13 },
})
