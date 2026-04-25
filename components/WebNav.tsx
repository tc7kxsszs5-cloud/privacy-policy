import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useAuth } from '@/constants/AuthContext'

const LINKS = [
  { label: 'Главная', href: '/(tabs)' },
  { label: 'Каталог', href: '/catalog' },
  { label: 'Цены', href: '/prices' },
  { label: 'AI примерка', href: '/ai-wrap' },
  { label: 'Ассистент', href: '/assistant' },
  { label: 'Заказы', href: '/orders' },
]

export default function WebNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { profile } = useAuth()

  return (
    <View style={styles.nav}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.push('/(tabs)' as any)}>
          <View style={styles.brand}>
            <Text style={styles.logo}>DETAILING TIME</Text>
            <Text style={styles.logoSub}>Студия оклейки авто</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.links}>
          {LINKS.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <TouchableOpacity key={link.href} onPress={() => router.push(link.href as any)}>
                <Text style={[styles.link, active && styles.linkActive]}>{link.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.right}>
          {profile?.role === 'studio_owner' && (
            <TouchableOpacity onPress={() => router.push('/studio/dashboard' as any)}>
              <Text style={styles.studioBtn}>Студия</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)}>
            <Text style={styles.profileBtn}>Профиль</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.15)',
    zIndex: 100,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  brand: {
    flexDirection: 'column',
  },
  logo: {
    color: '#C9A84C',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  logoSub: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 1,
  },
  links: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'center',
  },
  link: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  linkActive: {
    color: '#C9A84C',
  },
  right: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  studioBtn: {
    color: '#C9A84C',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#C9A84C',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  profileBtn: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
})
