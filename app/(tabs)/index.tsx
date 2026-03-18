import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'

export default function HomeScreen() {
  const router = useRouter()
  const { profile } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CarWrap</Text>
      <Text style={styles.subtitle}>
        {profile?.role === 'studio_owner' ? 'Панель студии' : 'Настрой свою машину'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/catalog')}>
        <Text style={styles.buttonText}>Начать конфигурацию</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center',
               alignItems: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 40, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 48 },
  button: { backgroundColor: '#e63946', borderRadius: 16, paddingVertical: 18,
            paddingHorizontal: 48 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
})
