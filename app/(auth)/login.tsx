import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Заполните все поля')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) Alert.alert('Ошибка', error)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DETAILING TIME</Text>
      <Text style={styles.subtitle}>Вход в аккаунт</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
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
        <Text style={styles.buttonText}>{loading ? 'Вход...' : 'Войти'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>Нет аккаунта? Зарегистрироваться</Text>
      </TouchableOpacity>

      {/* Скрытый вход для студий — внизу экрана, не бросается в глаза */}
      <TouchableOpacity
        style={styles.studioEntry}
        onPress={() => router.push('/(auth)/studio-login' as any)}
      >
        <Text style={styles.studioEntryText}>Для партнёров →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0a0a0a' },
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
  link: { color: '#C9A84C', textAlign: 'center', marginTop: 20 },
  studioEntry: {
    position: 'absolute', bottom: 48, alignSelf: 'center',
  },
  studioEntryText: { color: '#2a2a2a', fontSize: 12 },
})
