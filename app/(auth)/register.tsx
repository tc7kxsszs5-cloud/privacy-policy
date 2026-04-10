import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  async function handleRegister() {
    if (!email || !password) return Alert.alert('Заполните все поля')
    if (password.length < 6) return Alert.alert('Пароль должен быть не менее 6 символов')
    setLoading(true)
    const { error } = await signUp(email, password, 'client')
    setLoading(false)
    if (error) Alert.alert('Ошибка', error)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DETAILING TIME</Text>
      <Text style={styles.subtitle}>Создать аккаунт</Text>

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
        placeholder="Пароль (минимум 6 символов)"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Создаём...' : 'Создать аккаунт'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
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
})
