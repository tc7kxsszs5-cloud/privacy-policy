import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/constants/AuthContext'

const FEATURES = [
  { icon: '🏎️', title: '3D Конфигуратор', desc: 'Крути модель, выбирай цвет на каждую деталь', route: '/catalog' },
  { icon: '🎨', title: '78 материалов', desc: 'Глянец, мат, сатин, карбон, хром', route: '/catalog' },
  { icon: '🚘', title: 'Оклейка авто', desc: 'Услуги и прайс-лист студии', route: '/prices' },
  { icon: '📋', title: 'Заявка онлайн', desc: 'Отправь конфигурацию — приедь и оплати', route: '/orders' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, profile } = useAuth()

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <View>
            <Text style={styles.logo}>DETAILING TIME</Text>
            <Text style={styles.logoSub}>Студия оклейки авто</Text>
          </View>
          <View style={styles.navRight}>
            {profile?.role === 'studio_owner' && (
              <TouchableOpacity onPress={() => router.push('/studio/dashboard')}>
                <Text style={styles.navLink}>Дашборд</Text>
              </TouchableOpacity>
            )}
            {user ? (
              <TouchableOpacity onPress={() => router.push('/orders')}>
                <Text style={styles.navLink}>Заявки</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTag}>Студия оклейки авто</Text>
          <Text style={styles.heroTitle}>Создай{'\n'}свой{'\n'}стиль</Text>
          <Text style={styles.heroDesc}>
            Выбери автомобиль, настрой цвет в 3D и отправь заявку.{'\n'}Оплата — в студии.
          </Text>
          <TouchableOpacity style={styles.heroCta} onPress={() => router.push('/catalog')}>
            <Text style={styles.heroCtaText}>Попробовать →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <TouchableOpacity key={i} style={styles.featureCard} onPress={() => router.push(f.route as any)} activeOpacity={0.7}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.studioCta} onPress={() => router.push('/studio')}>
          <View>
            <Text style={styles.studioCtaLabel}>О студии</Text>
            <Text style={styles.studioCtaTitle}>Флор</Text>
            <Text style={styles.studioCtaDesc}>Прайс-лист, адрес, контакты →</Text>
          </View>
          <Text style={styles.studioCtaArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportLink} onPress={() => router.push('/support')}>
          <Text style={styles.supportLinkText}>Служба поддержки</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 20, paddingBottom: 48 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
  logo: { color: '#C9A84C', fontSize: 18, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' },
  logoSub: { color: '#666', fontSize: 11, letterSpacing: 1, marginTop: 2 },
  navRight: { flexDirection: 'row', gap: 20 },
  navLink: { color: '#888', fontSize: 15 },
  hero: { marginBottom: 48 },
  heroTag: { color: '#C9A84C', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 64, fontWeight: '900', lineHeight: 68, marginBottom: 20 },
  heroDesc: { color: '#888', fontSize: 16, lineHeight: 26, marginBottom: 32 },
  heroCta: {
    backgroundColor: '#C9A84C', paddingHorizontal: 32, paddingVertical: 18,
    borderRadius: 16, alignSelf: 'flex-start',
  },
  heroCtaText: { color: '#000', fontSize: 16, fontWeight: '700' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  featureCard: {
    width: '47%', backgroundColor: '#141414', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
  },
  featureIcon: { fontSize: 28, marginBottom: 10 },
  featureTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  featureDesc: { color: '#888', fontSize: 13, lineHeight: 20 },
  studioCta: {
    backgroundColor: '#141414', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  studioCtaLabel: { color: '#C9A84C', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  studioCtaTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  studioCtaDesc: { color: '#888', fontSize: 14 },
  studioCtaArrow: { color: '#C9A84C', fontSize: 28 },
  supportLink: { alignItems: 'center', paddingVertical: 16 },
  supportLinkText: { color: '#555', fontSize: 14 },
})
