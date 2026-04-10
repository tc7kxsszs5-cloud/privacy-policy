import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'

const APP_VERSION = '1.0.0'
const APP_BUILD = '17'

export default function ProfileScreen() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile?.display_name ?? 'Пользователь'}</Text>
      <Text style={styles.role}>
        {profile?.role === 'admin' ? 'Администратор' : profile?.role === 'studio_owner' ? 'Студия' : 'Клиент'}
      </Text>

      {profile?.role === 'admin' && (
        <TouchableOpacity style={styles.adminButton} onPress={() => router.push('/admin' as any)}>
          <Text style={styles.adminButtonText}>Панель администратора</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Выйти</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerVersion}>Версия {APP_VERSION} ({APP_BUILD})</Text>
        <Text style={styles.footerDev}>Mikheil Galoian by Detailing Time</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center',
               alignItems: 'center', padding: 24 },
  name: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  role: { color: '#666', fontSize: 16, marginBottom: 48 },
  adminButton: {
    backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 14,
    paddingHorizontal: 40, marginBottom: 12,
  },
  adminButtonText: { color: '#000', fontSize: 16, fontWeight: '800' },
  button: { backgroundColor: '#141414', borderRadius: 12, paddingVertical: 14,
            paddingHorizontal: 40, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  buttonText: { color: '#C9A84C', fontSize: 16 },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center', gap: 4 },
  footerVersion: { color: '#333', fontSize: 12 },
  footerDev: { color: '#333', fontSize: 12 },
})
