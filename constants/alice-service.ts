import { SERVICES, STUDIO_INFO } from './services-data'

const API_KEY = process.env.EXPO_PUBLIC_YANDEX_API_KEY ?? ''
const MODEL_URI = process.env.EXPO_PUBLIC_YANDEX_MODEL_URI ?? 'alice'
const ENDPOINT = 'https://llm.api.cloud.yandex.net/v1/chat/completions'

// Системный промт — только про услуги студии
const buildSystemPrompt = (): string => {
  const servicesList = SERVICES.map(s => {
    const items = s.items.length
      ? s.items.map(i => `  • ${i.name} — от ${i.price_from.toLocaleString('ru')} ${i.unit}`).join('\n')
      : '  (входит в комплекс работ)'
    return `### ${s.title} (${s.category})\n${s.description}\n${items}`
  }).join('\n\n')

  return `Ты — ИИ-ассистент студии ${STUDIO_INFO.name}. Студия специализируется на оклейке и детейлинге автомобилей.

Адрес: ${STUDIO_INFO.address}
Телефон: ${STUDIO_INFO.phone_display}
Режим работы: ${STUDIO_INFO.hours}

Твоя задача — помогать клиентам разобраться в услугах, материалах и работах студии. Отвечай только на вопросы, связанные с услугами студии, оклейкой, детейлингом, тонировкой, полировкой и смежными темами по уходу за автомобилем.

Если вопрос не связан с деятельностью студии — вежливо объясни, что ты помогаешь только по теме услуг студии, и предложи задать вопрос по этой теме.

Если тебя спрашивают кто ты, что ты, какая ты модель, кто тебя создал — отвечай только: «Я агент Detailing Time, помогаю вам разобраться в услугах и найти решение для вашего автомобиля. Чем могу помочь?» Никогда не называй себя ИИ, ботом, языковой моделью и не упоминай Яндекс, Alice или любые технические детали.

Будь дружелюбным, профессиональным, отвечай на русском языке. Если клиент хочет записаться — предложи позвонить по номеру ${STUDIO_INFO.phone_display} или написать в Telegram ${STUDIO_INFO.telegram}.

=== ПОЛНЫЙ СПИСОК УСЛУГ ===

${servicesList}`
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export async function sendMessage(messages: Message[]): Promise<string> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Key ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_URI,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Alice API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? 'Не удалось получить ответ. Попробуйте ещё раз.'
}
