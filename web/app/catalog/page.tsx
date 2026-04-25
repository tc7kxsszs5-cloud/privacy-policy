import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { MATERIALS, FINISHES, FINISH_LABELS } from '@/lib/catalog'

export default function CatalogPage() {
  return (
    <main>
      <Navbar active="catalog" />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Плёнки и материалы</p>
          <h1 className="text-5xl font-black mb-4">Каталог</h1>
          <p className="text-[#666] text-lg mb-16">Профессиональные плёнки 3M, Avery Dennison — {MATERIALS.length} вариантов</p>

          {FINISHES.map(finish => {
            const items = MATERIALS.filter(m => m.finish === finish)
            return (
              <div key={finish} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-[#C9A84C]">{FINISH_LABELS[finish]}</h2>
                  <span className="text-[#333] text-sm">{items.length} цветов</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {items.map(color => (
                    <div key={color.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden hover:border-[#C9A84C]/30 transition-colors cursor-pointer">
                      <div className="h-16 w-full" style={{ backgroundColor: color.colorHex }} />
                      <div className="p-3">
                        <p className="text-white font-medium text-xs leading-tight">{color.name}</p>
                        <p className="text-[#444] text-[10px] mt-1">{color.brand} · {color.sku}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="bg-[#111] border border-[#C9A84C]/20 rounded-3xl p-10 text-center mt-8">
            <h2 className="text-3xl font-black mb-3">Примерь на своё авто</h2>
            <p className="text-[#aaa] mb-6">Загрузи фото и посмотри как будет выглядеть оклейка</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/ai-wrap" className="inline-block bg-[#C9A84C] text-black font-bold px-8 py-4 rounded-2xl hover:bg-[#b8963e] transition-colors">
                AI примерка ✦
              </Link>
              <Link href="/configurator" className="inline-block border border-[#C9A84C]/40 text-[#C9A84C] font-bold px-8 py-4 rounded-2xl hover:border-[#C9A84C] transition-colors">
                3D Конфигуратор
              </Link>
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
