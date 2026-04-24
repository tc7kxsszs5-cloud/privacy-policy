import { Hono } from 'hono'

type AiWrapBody = {
  imageBase64?: string
  mimeType?: string
  prompt?: string
  quality?: 'low' | 'medium' | 'high'
  size?: '1024x1024' | '1024x1536' | '1536x1024'
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function registerAiWrapRoute(app: Hono) {
  app.post('/ai-wrap', async (c) => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return c.json({ error: 'OPENAI_API_KEY не настроен на сервере' }, 500)
    }

    const body = await c.req.json<AiWrapBody>().catch(() => null)
    const imageBase64 = body?.imageBase64?.trim()
    const mimeType = body?.mimeType?.trim() || 'image/jpeg'
    const userPrompt = body?.prompt?.trim()

    if (!imageBase64 || !userPrompt) {
      return c.json({ error: 'Нужно загрузить фото и указать идею пленки' }, 400)
    }

    if (!ALLOWED_MIME.has(mimeType)) {
      return c.json({ error: 'Поддерживаются JPG, PNG и WEBP' }, 400)
    }

    const quality = body?.quality ?? 'medium'
    const size = body?.size ?? '1536x1024'

    // fetch('data:...') не работает в Edge runtime — конвертируем base64 вручную
    const binaryStr = atob(imageBase64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
    const imageFile = new File([bytes], 'client-car.jpg', { type: mimeType })

    const prompt = [
      'Edit the uploaded car or motorcycle photo for a car wrap studio preview.',
      'Keep the exact vehicle shape, camera angle, wheels, windows, lights, background, shadows, reflections, and license plate placement.',
      'Change only the painted body panels into the requested wrap material/design.',
      'Do not turn it into a different vehicle. Do not add text or logos unless the user explicitly asks.',
      `Requested wrap: ${userPrompt}.`,
    ].join(' ')

    const form = new FormData()
    form.append('model', 'gpt-image-1')
    form.append('image', imageFile)
    form.append('prompt', prompt)
    form.append('quality', quality)
    form.append('size', size)
    form.append('n', '1')
    form.append('response_format', 'b64_json')

    const openAiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    })

    const data = await openAiResponse.json().catch(() => null)
    if (!openAiResponse.ok) {
      const message = data?.error?.message || 'OpenAI не смог обработать фото'
      return c.json({ error: message }, openAiResponse.status as any)
    }

    const first = data?.data?.[0]
    const imageUrl = first?.b64_json ? `data:image/png;base64,${first.b64_json}` : first?.url

    if (!imageUrl) {
      return c.json({ error: 'OpenAI не вернул изображение' }, 502)
    }

    return c.json({ imageUrl })
  })
}
