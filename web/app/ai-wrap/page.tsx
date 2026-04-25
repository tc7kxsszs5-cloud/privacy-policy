'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { MATERIALS, FINISHES, FINISH_LABELS, type Material, type Finish } from '@/lib/catalog'

const API_URL = 'https://backend-three-mauve-67.vercel.app/api/ai-wrap'

export default function AiWrapPage() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState('image/jpeg')
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(MATERIALS[0])
  const [activeFinish, setActiveFinish] = useState<Finish>('gloss')
  const [customPrompt, setCustomPrompt] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMimeType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function generate() {
    if (!photo) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const base64 = photo.split(',')[1]
      const prompt = customPrompt || `${selectedMaterial.name} ${FINISH_LABELS[selectedMaterial.finish]}`
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ошибка генерации')
      setResult(data.imageUrl)
    } catch (e: any) {
      setError(e.message || 'Не удалось сгенерировать')
    } finally {
      setLoading(false)
    }
  }

  const visibleMaterials = MATERIALS.filter(m => m.finish === activeFinish)

  return (
    <main>
      <Navbar active="ai-wrap" />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Искусственный интеллект</p>
          <h1 className="text-5xl font-black mb-4">AI примерка оклейки</h1>
          <p className="text-[#666] text-lg mb-12">Загрузи фото авто, выбери плёнку из каталога — получи реалистичный превью</p>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px_1fr] gap-8">
            {/* Left: photo + generate */}
            <div className="space-y-6">
              {/* Upload */}
              <div>
                <p className="text-[#aaa] text-sm font-semibold mb-3">1. Фото автомобиля</p>
                <div
                  onClick={() => inputRef.current?.click()}
                  className="border-2 border-dashed border-[#2a2a2a] rounded-2xl p-8 text-center cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
                >
                  {photo ? (
                    <img src={photo} alt="car" className="max-h-56 mx-auto rounded-xl object-contain" />
                  ) : (
                    <div>
                      <p className="text-4xl mb-3">📷</p>
                      <p className="text-[#555]">Нажми чтобы загрузить фото</p>
                      <p className="text-[#333] text-sm mt-1">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                {photo && (
                  <button onClick={() => inputRef.current?.click()} className="text-[#555] text-sm mt-2 hover:text-[#C9A84C] transition-colors">
                    Изменить фото
                  </button>
                )}
              </div>

              {/* Selected material preview */}
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl shrink-0 border border-white/10"
                  style={{ backgroundColor: selectedMaterial.colorHex }}
                />
                <div>
                  <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Выбрана плёнка</p>
                  <p className="text-white font-semibold">{selectedMaterial.name}</p>
                  <p className="text-[#555] text-sm">{FINISH_LABELS[selectedMaterial.finish]} · {selectedMaterial.brand} {selectedMaterial.sku}</p>
                </div>
              </div>

              {/* Custom prompt */}
              <div>
                <p className="text-[#aaa] text-sm font-semibold mb-2">Уточнение <span className="text-[#444] font-normal">(необязательно)</span></p>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Например: матовый тёмно-синий с золотыми деталями"
                  className="w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#C9A84C]/50"
                />
              </div>

              <button
                onClick={generate}
                disabled={!photo || loading}
                className="w-full bg-[#C9A84C] text-black font-bold py-4 rounded-2xl text-lg hover:bg-[#b8963e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Генерирую...' : 'Сгенерировать ✦'}
              </button>

              {error && (
                <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Center: catalog */}
            <div>
              <p className="text-[#aaa] text-sm font-semibold mb-3">2. Выбери плёнку</p>

              {/* Finish tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {FINISHES.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFinish(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeFinish === f
                        ? 'bg-[#C9A84C] text-black'
                        : 'bg-[#151515] text-[#666] hover:text-[#aaa] border border-[#1e1e1e]'
                    }`}
                  >
                    {FINISH_LABELS[f]}
                    <span className="ml-1 opacity-50">{MATERIALS.filter(m => m.finish === f).length}</span>
                  </button>
                ))}
              </div>

              {/* Color grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[480px] overflow-y-auto pr-1">
                {visibleMaterials.map(mat => (
                  <button
                    key={mat.id}
                    title={`${mat.name} · ${mat.brand} ${mat.sku}`}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                      selectedMaterial.id === mat.id
                        ? 'border-[#C9A84C] scale-110'
                        : 'border-transparent hover:border-[#555]'
                    }`}
                    style={{ backgroundColor: mat.colorHex }}
                  />
                ))}
              </div>

              {/* Hovered/selected name */}
              <div className="mt-3 h-10 flex items-center">
                <p className="text-[#888] text-xs">{selectedMaterial.name} · {FINISH_LABELS[selectedMaterial.finish]}</p>
              </div>
            </div>

            {/* Right: result */}
            <div>
              <p className="text-[#aaa] text-sm font-semibold mb-3">Результат</p>
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden min-h-80 flex items-center justify-center">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#555]">Обычно 15–60 секунд</p>
                  </div>
                ) : result ? (
                  <img src={result} alt="AI wrap result" className="w-full rounded-2xl" />
                ) : (
                  <div className="text-center py-16 px-8">
                    <p className="text-5xl mb-4">✦</p>
                    <p className="text-[#555]">Результат появится здесь</p>
                  </div>
                )}
              </div>
              {result && (
                <div className="mt-4 flex gap-3">
                  <a
                    href={result}
                    download="ai-wrap.png"
                    className="flex-1 text-center border border-[#1e1e1e] text-[#aaa] font-semibold py-3 rounded-xl hover:border-[#C9A84C]/30 transition-colors text-sm"
                  >
                    Скачать
                  </a>
                  <a
                    href="tel:+74954111003"
                    className="flex-1 text-center bg-[#C9A84C] text-black font-bold py-3 rounded-xl hover:bg-[#b8963e] transition-colors text-sm"
                  >
                    Записаться
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-[#C9A84C] font-black tracking-widest text-sm">DETAILING TIME</span>
          <p className="text-[#444] text-sm">© 2026 · Москва</p>
        </div>
      </footer>
    </main>
  )
}
