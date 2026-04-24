import Constants from 'expo-constants'

export type AiWrapRequest = {
  imageBase64: string
  mimeType: string
  prompt: string
  quality?: 'low' | 'medium' | 'high'
  size?: '1024x1024' | '1024x1536' | '1536x1024'
}

export type AiWrapResult = {
  imageUrl: string
}

const endpoint =
  Constants.expoConfig?.extra?.aiWrapEndpoint ||
  process.env.EXPO_PUBLIC_AI_WRAP_ENDPOINT ||
  'https://backend-three-mauve-67.vercel.app/api/ai-wrap'

export async function generateAiWrap(request: AiWrapRequest): Promise<AiWrapResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || 'Не удалось сгенерировать примерку')
  }

  if (!data?.imageUrl) {
    throw new Error('Сервис не вернул изображение')
  }

  return { imageUrl: data.imageUrl }
}
