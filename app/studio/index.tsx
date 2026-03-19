import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getStudioProfile } from '@/constants/studio-service'
import { PriceList } from '@/components/studio/PriceList'
import type { StudioProfileWithPriceList } from '@/constants/studio-service'

export default function StudioProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudioProfileWithPriceList | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudioProfile()
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e63946" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoLetter}>Ф</Text>
          </View>
          <Text style={styles.studioName}>{profile?.name ?? 'Флор'}</Text>
          <Text style={styles.studioDesc}>{profile?.description ?? 'Профессиональная оклейка автомобилей'}</Text>
        </View>

        <View style={styles.infoBlock}>
          {profile?.address ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Адрес</Text>
              <Text style={styles.infoValue}>{profile.address}</Text>
            </View>
          ) : null}
          {profile?.phone ? (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${profile.phone}`)}>
              <Text style={styles.infoLabel}>📞 Телефон</Text>
              <Text style={[styles.infoValue, styles.link]}>{profile.phone}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.contacts}>
          {profile?.telegram ? (
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL(`https://t.me/${profile.telegram.replace('@', '')}`)}
            >
              <Text style={styles.contactBtnText}>Telegram</Text>
            </TouchableOpacity>
          ) : null}
          {profile?.whatsapp ? (
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL(`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`)}
            >
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {profile?.price_list && profile.price_list.length > 0 && (
          <View style={styles.section}>
            <PriceList items={profile.price_list} />
          </View>
        )}

        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/catalog')}>
          <Text style={styles.ctaBtnText}>Создать конфигурацию</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#888', fontSize: 16 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logoPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e63946', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoLetter: { color: '#fff', fontSize: 36, fontWeight: '800' },
  studioName: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  studioDesc: { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  infoBlock: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, flex: 1, textAlign: 'right' },
  link: { color: '#e63946' },
  contacts: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#333', alignItems: 'center',
  },
  contactBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  section: { marginBottom: 24 },
  ctaBtn: {
    backgroundColor: '#e63946', padding: 18, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
