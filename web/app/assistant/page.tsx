'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string }

const WELCOME: Message = {
  role: 'assistant',
  content: 'Привет! Я ассистент студии Detailing Time ✦\n\nПомогу разобраться в услугах, материалах и ценах. Спрашивай — отвечу.',
}

const ALICE_URL = '/api/chat'

const SUGGESTIONS = [
  'Сколько стоит оклейка капота?',
  'Какие плёнки вы используете?',
  'Как долго держится PPF?',
  'Можно ли записаться онлайн?',
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const history: Message[] = [...messages.filter(m => m !== WELCOME), { role: 'user', content: msg }]
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch(ALICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      const reply = data?.reply || 'Не удалось получить ответ'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка. Позвоните нам: +7 (495) 411-10-03' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col h-screen">
      <nav className="shrink-0 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#C9A84C]/10 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div>
              <span className="text-[#C9A84C] text-base font-black tracking-widest">DETAILING TIME</span>
              <p className="text-[#666] text-[10px] tracking-wider">Студия оклейки авто</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-[#aaa] hover:text-[#C9A84C] text-sm transition-colors">Каталог</Link>
            <Link href="/prices" className="text-[#aaa] hover:text-[#C9A84C] text-sm transition-colors">Цены</Link>
            <Link href="/ai-wrap" className="text-[#aaa] hover:text-[#C9A84C] text-sm transition-colors">AI примерка</Link>
            <Link href="/assistant" className="text-[#C9A84C] text-sm font-semibold">Ассистент</Link>
          </div>
          <a href="tel:+74954111003" className="bg-[#C9A84C] text-black text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#b8963e] transition-colors">
            Позвонить
          </a>
        </div>
      </nav>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#C9A84C] text-black font-medium'
                    : 'bg-[#111] border border-[#1e1e1e] text-[#ccc]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#111] border border-[#1e1e1e] px-5 py-4 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-4">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="bg-[#111] border border-[#1e1e1e] text-[#888] text-sm px-4 py-2 rounded-xl hover:border-[#C9A84C]/30 hover:text-[#C9A84C] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-6 pb-6 pt-2 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Задайте вопрос..."
            className="flex-1 bg-[#111] border border-[#1e1e1e] rounded-2xl px-5 py-4 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#C9A84C]/40"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="bg-[#C9A84C] text-black font-bold px-6 py-4 rounded-2xl hover:bg-[#b8963e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✦
          </button>
        </div>
      </div>
    </main>
  )
}
