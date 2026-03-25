import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { STUDIO_INFO } from '@/constants/services-data'

const FAQ = [
  {
    q: 'Как сделать заявку?',
    a: 'Выберите автомобиль в каталоге, откройте 3D-редактор, нажмите на детали и выберите материал. Когда конфигурация готова — нажмите "Отправить заявку".',
  },
  {
    q: 'Нужно ли оплачивать сразу?',
    a: 'Нет. В приложении оплата не предусмотрена. После отправки заявки приезжайте в студию, согласуйте детали и оплатите на месте.',
  },
  {
    q: 'Сколько времени занимает оклейка?',
    a: 'Зависит от объёма работ. Полная оклейка — от 3 до 7 рабочих дней. Отдельные элементы — от 1 дня.',
  },
  {
    q: 'Можно ли изменить заявку после отправки?',
    a: 'Да, позвоните нам или напишите в Telegram. Мы внесём изменения до начала работ.',
  },
  {
    q: 'Где находится студия?',
    a: `${STUDIO_INFO.address}. Работаем ${STUDIO_INFO.hours}.`,
  },
]

export default function SupportScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Поддержка</Text>
        <Text style={styles.subtitle}>Студия Флор</Text>

        <View style={styles.contacts}>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: '#229ED9' }]}
            onPress={() => Linking.openURL(`https://t.me/${STUDIO_INFO.telegram.replace('@', '')}`)}
          >
            <Text style={styles.contactBtnText}>Telegram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: '#25D366' }]}
            onPress={() => Linking.openURL(`https://wa.me/${STUDIO_INFO.whatsapp}`)}
          >
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: '#141414', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)' }]}
            onPress={() => Linking.openURL(`tel:${STUDIO_INFO.phone}`)}
          >
            <Text style={styles.contactBtnText}>Позвонить</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.faqTitle}>Частые вопросы</Text>
        {FAQ.map((item, i) => (
          <View key={i} style={styles.faqItem}>
            <Text style={styles.faqQ}>{item.q}</Text>
            <Text style={styles.faqA}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#C9A84C', fontSize: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#C9A84C', fontSize: 16, marginBottom: 32 },
  contacts: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  contactBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  contactBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  faqTitle: { color: '#C9A84C', fontSize: 18, fontWeight: '700', marginBottom: 16, letterSpacing: 0.5 },
  faqItem: {
    backgroundColor: '#141414', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', marginBottom: 12,
  },
  faqQ: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  faqA: { color: '#888', fontSize: 14, lineHeight: 22 },
})
