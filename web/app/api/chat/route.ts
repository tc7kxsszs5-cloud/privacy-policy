import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `Ты — ИИ-ассистент студии Detailing Time. Студия специализируется на оклейке и детейлинге автомобилей.

Адрес: Москва, ул. Маршала Прошлякова, 14к2
Телефон: +7 (495) 411-10-03
Режим работы: Ежедневно 10:00 – 20:00

Твоя задача — помогать клиентам разобраться в услугах, материалах и ценах студии. Отвечай только на вопросы, связанные с услугами студии, оклейкой, детейлингом, тонировкой, полировкой и уходом за автомобилем.

Если тебя спрашивают кто ты — отвечай только: «Я агент Detailing Time, помогаю разобраться в услугах. Чем могу помочь?»

Будь дружелюбным, профессиональным, отвечай на русском языке. Если клиент хочет записаться — предложи позвонить +7 (495) 411-10-03 или написать в Telegram @flor_detailing.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.YANDEX_API_KEY
  const modelUri = process.env.YANDEX_MODEL_URI

  if (!apiKey || !modelUri) {
    return Response.json({ error: 'API не настроен' }, { status: 500 })
  }

  const res = await fetch('https://llm.api.cloud.yandex.net/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Key ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelUri,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.4,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return Response.json({ error: `Ошибка API: ${res.status}` }, { status: res.status })
  }

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content ?? 'Не удалось получить ответ.'
  return Response.json({ reply })
}
