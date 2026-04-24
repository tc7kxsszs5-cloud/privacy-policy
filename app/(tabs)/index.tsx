import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Animated } from 'react-native'
import { useRef, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/constants/AuthContext'

const HERO_COLORS = [
  '#C9A84C', // золото (бренд)
  '#ff3020', // красный
  '#fc6c00', // оранжевый
  '#fec500', // жёлтый
  '#4fc96b', // зелёный
  '#2196F3', // синий
  '#9C27B0', // фиолетовый
  '#e6e9ee', // белый
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const colorAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animate = (index: number) => {
      Animated.timing(colorAnim, {
        toValue: index,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => animate((index + 1) % HERO_COLORS.length))
    }
    animate(1)
  }, [])

  const animatedColor = colorAnim.interpolate({
    inputRange: HERO_COLORS.map((_, i) => i),
    outputRange: HERO_COLORS,
  })

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── NAV ── */}
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
            <TouchableOpacity style={styles.assistantBtn} onPress={() => router.push('/assistant')}>
              <Text style={styles.assistantIcon}>✦</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── HERO ── */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push('/catalog')}
          activeOpacity={0.92}
        >
          <Image
            source={require('@/assets/services/presale.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTag}>Студия оклейки авто · Москва</Text>
            <Animated.Text style={[styles.heroTitle, { color: animatedColor }]}>Создай{'\n'}свой{'\n'}стиль</Animated.Text>
            <Text style={styles.heroDesc}>
              Выбери автомобиль, настрой цвет в 3D{'\n'}и отправь заявку. Оплата — в студии.
            </Text>
            <View style={styles.heroCtaRow}>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Попробовать →</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── НАШИ РАБОТЫ — широкая большая ── */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => router.push('/ai-wrap' as any)}
          activeOpacity={0.88}
        >
          <Image
            source={require('@/assets/services/hybrid.jpg')}
            style={styles.wideImage}
            resizeMode="cover"
          />
          <View style={styles.wideOverlayTop} />
          <View style={styles.wideOverlayBottom} />
          <View style={styles.wideContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI ПРИМЕРКА</Text>
            </View>
            <Text style={styles.wideTitle}>Загрузи своё авто</Text>
            <Text style={styles.wideDesc}>
              Примерь цвет, мат, хром, карбон или дизайн пленки на реальном фото машины.
            </Text>
            <Text style={styles.wideLink}>Открыть примерку →</Text>
          </View>
        </TouchableOpacity>

        {/* ── НАШИ РАБОТЫ — широкая большая ── */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => router.push('/studio/gallery' as any)}
          activeOpacity={0.88}
        >
          <Image
            source={require('@/assets/services/vinyl.jpg')}
            style={styles.wideImage}
            resizeMode="cover"
          />
          <View style={styles.wideOverlayTop} />
          <View style={styles.wideOverlayBottom} />
          <View style={styles.wideContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ПОРТФОЛИО</Text>
            </View>
            <Text style={styles.wideTitle}>Наши работы</Text>
            <Text style={styles.wideDesc}>
              Реальные проекты студии — оклейка, тонировка, PPF и детейлинг.
            </Text>
            <Text style={styles.wideLink}>Смотреть галерею →</Text>
          </View>
        </TouchableOpacity>

        {/* ── ОКЛЕЙКА АВТО — широкая ── */}
        <TouchableOpacity
          style={styles.wideCard}
          onPress={() => router.push('/prices')}
          activeOpacity={0.88}
        >
          <Image
            source={require('@/assets/services/ppf.jpg')}
            style={styles.wideImage}
            resizeMode="cover"
          />
          <View style={styles.wideOverlayTop} />
          <View style={styles.wideOverlayBottom} />
          <View style={styles.wideContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>УСЛУГИ</Text>
            </View>
            <Text style={styles.wideTitle}>Оклейка авто</Text>
            <Text style={styles.wideDesc}>
              Виниловая плёнка, PPF, тонировка, детейлинг — полный прайс-лист.
            </Text>
            <Text style={styles.wideLink}>Смотреть цены →</Text>
          </View>
        </TouchableOpacity>

        {/* ── ЛЕКАЛЬНАЯ НАРЕЗКА — широкая ── */}
        <TouchableOpacity
          style={styles.wideCard}
          onPress={() => router.push('/prices/lekala_cut' as any)}
          activeOpacity={0.88}
        >
          <Image
            source={require('@/assets/services/ppf_cut.jpg')}
            style={styles.wideImage}
            resizeMode="cover"
          />
          <View style={styles.wideOverlayTop} />
          <View style={styles.wideOverlayBottom} />
          <View style={styles.wideContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ТЕХНОЛОГИЯ</Text>
            </View>
            <Text style={styles.wideTitle}>Лекальная нарезка{'\n'}плёнки</Text>
            <Text style={styles.wideDesc}>
              Плоттер режет по точным цифровым шаблонам — PPF, тонировка, винил. Нет ножа по краске, нет зазубрин.
            </Text>
            <Text style={styles.wideLink}>Подробнее →</Text>
          </View>
        </TouchableOpacity>

        {/* ── КАК ЭТО РАБОТАЕТ ── */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Как это работает</Text>
          <View style={styles.stepsList}>
            {[
              { n: '01', title: 'Выбери авто', desc: 'Найди свою модель в каталоге' },
              { n: '02', title: 'Настрой цвет', desc: 'Покрась каждую деталь в 3D' },
              { n: '03', title: 'Отправь заявку', desc: 'Приедь в студию — оплата на месте' },
            ].map(step => (
              <View key={step.n} style={styles.step}>
                <Text style={styles.stepNum}>{step.n}</Text>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.supportLink} onPress={() => router.push('/support')}>
          <Text style={styles.supportLinkText}>Служба поддержки</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 16, paddingBottom: 48 },

  // NAV
  nav: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  logo: { color: '#C9A84C', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  logoSub: { color: '#555', fontSize: 11, letterSpacing: 1, marginTop: 2 },
  navRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  navLink: { color: '#888', fontSize: 15 },
  assistantBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  assistantIcon: { color: '#C9A84C', fontSize: 16, fontWeight: '800' },

  // HERO
  heroCard: {
    borderRadius: 24, overflow: 'hidden',
    marginBottom: 12, height: 420,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  heroImage: { position: 'absolute', width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute', width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  heroContent: {
    flex: 1, padding: 28, justifyContent: 'flex-end',
  },
  heroTag: {
    color: '#C9A84C', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
  },
  heroTitle: {
    color: '#fff', fontSize: 58, fontWeight: '900',
    lineHeight: 62, marginBottom: 16,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.65)', fontSize: 14,
    lineHeight: 22, marginBottom: 24,
  },
  heroCtaRow: { flexDirection: 'row' },
  heroCta: {
    backgroundColor: '#C9A84C', paddingHorizontal: 28,
    paddingVertical: 15, borderRadius: 14,
  },
  heroCtaText: { color: '#000', fontSize: 15, fontWeight: '800' },


  // WIDE CARDS
  featuredCard: {
    borderRadius: 20, overflow: 'hidden',
    marginBottom: 12, height: 300,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
  },
  wideCard: {
    borderRadius: 20, overflow: 'hidden',
    marginBottom: 12, height: 220,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
  },
  wideImage: { position: 'absolute', width: '100%', height: '100%' },
  wideOverlayTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  wideOverlayBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 190,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  wideContent: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.18)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.45)',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10,
  },
  badgeText: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  wideTitle: {
    color: '#fff', fontSize: 22, fontWeight: '900',
    lineHeight: 28, marginBottom: 8,
  },
  wideDesc: { color: 'rgba(255,255,255,0.68)', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  wideLink: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },


  // HOW IT WORKS
  stepsCard: {
    backgroundColor: '#111', borderRadius: 20, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  stepsTitle: {
    color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16,
  },
  stepsList: { gap: 14 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepNum: {
    color: '#C9A84C', fontSize: 22, fontWeight: '900',
    width: 36, lineHeight: 26,
  },
  stepText: { flex: 1 },
  stepTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  stepDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18 },

  // SUPPORT
  supportLink: { alignItems: 'center', paddingVertical: 16 },
  supportLinkText: { color: '#444', fontSize: 14 },
})
