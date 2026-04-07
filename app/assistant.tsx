import { useState, useRef, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { sendMessage, type Message } from '@/constants/alice-service'

type ChatMessage = Message & { id: string }

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Привет! Я ассистент студии Detailing Time 👋\n\nПомогу разобраться в услугах, материалах и ценах. Спрашивай — отвечу.',
}

export default function AssistantScreen() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<FlatList>(null)

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text }
    const history = [...messages.filter(m => m.id !== 'welcome'), userMsg]

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendMessage(history.map(({ role, content }) => ({ role, content })))
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Произошла ошибка. Попробуйте ещё раз или позвоните нам: +7 (495) 411-10-03',
      }])
    } finally {
      setLoading(false)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [input, loading, messages])

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>✦ Ассистент</Text>
          <Text style={styles.headerSub}>Detailing Time</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
            {item.role === 'assistant' && (
              <Text style={styles.bubbleLabel}>✦ Ассистент</Text>
            )}
            <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color="#C9A84C" />
          <Text style={styles.typingText}>Печатает...</Text>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Спросите об услугах..."
            placeholderTextColor="#555"
            multiline
            maxLength={500}
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)',
  },
  back: { color: '#C9A84C', fontSize: 16, width: 60 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#C9A84C', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#666', fontSize: 12 },

  list: { padding: 16, paddingBottom: 8 },

  bubble: {
    maxWidth: '85%', borderRadius: 16, padding: 12, marginBottom: 12,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#C9A84C',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
    borderBottomLeftRadius: 4,
  },
  bubbleLabel: { color: '#C9A84C', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  bubbleText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#0a0a0a' },

  typingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingBottom: 8,
  },
  typingText: { color: '#666', fontSize: 13 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0a0a0a',
  },
  input: {
    flex: 1, backgroundColor: '#1a1a1a', color: '#fff',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 120,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#C9A84C', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#0a0a0a', fontSize: 20, fontWeight: '800' },
})
