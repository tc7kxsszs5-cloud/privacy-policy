import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'client' | 'studio_owner'>('client')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  async function handleRegister() {
    if (!email || !password) return Alert.alert('Заполните все поля')
    setLoading(true)
    const { error } = await signUp(email, password, role)
    setLoading(false)
    if (error) Alert.alert('Ошибка', error)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Пароль" value={password}
        onChangeText={setPassword} secureTextEntry />

      <Text style={styles.label}>Я:</Text>
      <View style={styles.roleRow}>
        {(['client', 'studio_owner'] as const).map(r => (
          <TouchableOpacity key={r} style={[styles.roleBtn, role === r && styles.roleBtnActive]}
            onPress={() => setRole(r)}>
            <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
              {r === 'client' ? 'Клиент' : 'Студия'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Регистрация...' : 'Создать аккаунт'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0f0f0f' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 12, padding: 16,
           marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  label: { color: '#888', marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
             borderColor: '#333', alignItems: 'center' },
  roleBtnActive: { borderColor: '#e63946', backgroundColor: '#1a0507' },
  roleBtnText: { color: '#888', fontWeight: '600' },
  roleBtnTextActive: { color: '#e63946' },
  button: { backgroundColor: '#e63946', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { color: '#888', textAlign: 'center', marginTop: 20 },
})
