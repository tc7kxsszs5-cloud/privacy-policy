import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '@/constants/AuthContext'

export default function ProfileScreen() {
  const { profile, signOut } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile?.display_name ?? 'Пользователь'}</Text>
      <Text style={styles.role}>
        {profile?.role === 'studio_owner' ? 'Студия' : 'Клиент'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center',
               alignItems: 'center', padding: 24 },
  name: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  role: { color: '#888', fontSize: 16, marginBottom: 48 },
  button: { backgroundColor: '#333', borderRadius: 12, paddingVertical: 14,
            paddingHorizontal: 40 },
  buttonText: { color: '#fff', fontSize: 16 },
})
