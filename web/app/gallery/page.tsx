'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

type Work = {
  id: string
  studio_id: string
  photo_url: string
  description: string | null
  hashtag: string
  created_at: string
  studio_name?: string
  studio_slug?: string
}

type AppForm = {
  name: string
  phone: string
  message: string
}

export default function GalleryPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Work | null>(null)
  const [form, setForm] = useState<AppForm>({ name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('studio_works')
        .select(`
          id, studio_id, photo_url, description, hashtag, created_at,
          profiles!studio_id(studio_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (data) {
        setWorks(data.map((w: any) => ({
          ...w,
          studio_name: w.profiles?.studio_name ?? 'Студия',
          studio_slug: w.profiles?.studio_name?.toLowerCase().replace(/\s+/g, '-') ?? w.studio_id,
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSend() {
    if (!selected || !form.name || !form.phone) return
    setSending(true)
    await supabase.from('applications').insert({
      studio_id: selected.studio_id,
      client_name: form.name,
      client_phone: form.phone,
      message: form.message || null,
      work_id: selected.id,
    })
    setSending(false)
    setSent(true)
  }

  function openForm(work: Work) {
    setSelected(work)
    setSent(false)
    setForm({ name: '', phone: '', message: '' })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar active={undefined} />

      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Работы студий</h1>
        <p className="text-[#555] text-sm mb-10">Выберите работу и отправьте заявку в студию</p>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : works.length === 0 ? (
          <p className="text-[#444] text-center py-24">Пока нет работ</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {works.map(work => (
              <div key={work.id} className="break-inside-avoid group relative overflow-hidden rounded-xl border border-white/5 cursor-pointer" onClick={() => openForm(work)}>
                <img src={work.photo_url} alt={work.description ?? ''} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                  <p className="text-[#C9A84C] text-xs font-bold">{work.hashtag}</p>
                  <p className="text-white text-xs mt-0.5">{work.studio_name}</p>
                  <button className="mt-2 bg-[#C9A84C] text-black text-xs font-bold py-1.5 px-3 rounded-lg">Записаться</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✓</div>
                <p className="text-white text-lg font-bold mb-1">Заявка отправлена!</p>
                <p className="text-[#555] text-sm">Студия свяжется с вами в ближайшее время</p>
                <button onClick={() => setSelected(null)} className="mt-6 w-full bg-[#C9A84C] text-black font-bold py-3 rounded-xl">Закрыть</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <img src={selected.photo_url} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <p className="text-white font-bold text-sm">{selected.studio_name}</p>
                    <p className="text-[#C9A84C] text-xs">{selected.hashtag}</p>
                  </div>
                </div>

                <input
                  className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm mb-3 border border-white/10 outline-none focus:border-[#C9A84C]/50"
                  placeholder="Ваше имя *"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm mb-3 border border-white/10 outline-none focus:border-[#C9A84C]/50"
                  placeholder="Телефон *"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
                <textarea
                  className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm mb-4 border border-white/10 outline-none focus:border-[#C9A84C]/50 resize-none"
                  placeholder="Комментарий (необязательно)"
                  rows={2}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !form.name || !form.phone}
                  className="w-full bg-[#C9A84C] text-black font-bold py-3 rounded-xl text-sm disabled:opacity-40"
                >
                  {sending ? 'Отправляем...' : 'Отправить заявку'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
