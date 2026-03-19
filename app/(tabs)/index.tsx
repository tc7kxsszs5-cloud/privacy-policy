import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/constants/AuthContext'

const FEATURES = [
  { icon: '🚗', title: '3D Конфигуратор', desc: 'Крути модель, выбирай цвет на каждую деталь' },
  { icon: '🎨', title: '20+ материалов', desc: 'Глянец, мат, сатин, карбон, хром' },
  { icon: '🪟', title: 'Тонировка стёкол', desc: 'Настраивай каждое стекло отдельно' },
  { icon: '📋', title: 'Заявка онлайн', desc: 'Отправь конфигурацию — приедь и оплати' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, profile } = useAuth()

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Text style={styles.logo}>Флор</Text>
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
            <View key={i} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
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
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 48 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
  logo: { color: '#e63946', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  navRight: { flexDirection: 'row', gap: 20 },
  navLink: { color: '#888', fontSize: 15 },
  hero: { marginBottom: 48 },
  heroTag: { color: '#e63946', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 64, fontWeight: '900', lineHeight: 68, marginBottom: 20 },
  heroDesc: { color: '#888', fontSize: 16, lineHeight: 26, marginBottom: 32 },
  heroCta: {
    backgroundColor: '#e63946', paddingHorizontal: 32, paddingVertical: 18,
    borderRadius: 16, alignSelf: 'flex-start',
  },
  heroCtaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  featureCard: {
    width: '47%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  featureIcon: { fontSize: 28, marginBottom: 10 },
  featureTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  featureDesc: { color: '#888', fontSize: 13, lineHeight: 20 },
  studioCta: {
    backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#2a2a2a',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  studioCtaLabel: { color: '#e63946', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  studioCtaTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  studioCtaDesc: { color: '#888', fontSize: 14 },
  studioCtaArrow: { color: '#e63946', fontSize: 28 },
  supportLink: { alignItems: 'center', paddingVertical: 16 },
  supportLinkText: { color: '#555', fontSize: 14 },
})
