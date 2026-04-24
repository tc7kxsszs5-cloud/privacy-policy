import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { maxDuration: 60 }

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY не настроен на сервере' })
  }

  const body = req.body
  const imageBase64: string = (body?.imageBase64 ?? '').trim()
  const mimeType: string = (body?.mimeType ?? 'image/jpeg').trim()
  const userPrompt: string = (body?.prompt ?? '').trim()

  if (!imageBase64 || !userPrompt) {
    return res.status(400).json({ error: 'Нужно загрузить фото и указать идею пленки' })
  }

  if (!ALLOWED_MIME.has(mimeType)) {
    return res.status(400).json({ error: 'Поддерживаются JPG, PNG и WEBP' })
  }

  const quality: string = body?.quality ?? 'medium'
  const size: string = body?.size ?? '1536x1024'

  const binaryStr = atob(imageBase64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
  const imageFile = new File([bytes], 'car.jpg', { type: mimeType })

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

  const openAiResponse = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })

  const data = await openAiResponse.json().catch(() => null)
  if (!openAiResponse.ok) {
    console.error('OpenAI error:', JSON.stringify(data))
    const message = data?.error?.message || 'OpenAI не смог обработать фото'
    return res.status(openAiResponse.status).json({ error: message })
  }

  const first = data?.data?.[0]
  const imageUrl = first?.b64_json ? `data:image/png;base64,${first.b64_json}` : first?.url

  if (!imageUrl) {
    return res.status(502).json({ error: 'OpenAI не вернул изображение' })
  }

  return res.status(200).json({ imageUrl })
}
