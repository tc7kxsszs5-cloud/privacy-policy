import Link from 'next/link'

const CATEGORIES = [
  {
    id: 'ppf', title: 'Оклейка полиуретаном (PPF)',
    items: [
      { name: 'Автомобиль целиком', from: 180000 },
      { name: 'Передняя часть (капот, бампер, крылья, фары, зеркала)', from: 90000 },
      { name: 'Капот целиком', from: 17000 },
      { name: 'Бампер целиком', from: 17000 },
      { name: 'Передняя оптика (2 фары)', from: 6000 },
      { name: 'Под ручками дверей (4 ручки)', from: 4000 },
    ],
  },
  {
    id: 'tint', title: 'Тонировка стекол',
    items: [
      { name: 'Средний класс (Focus, Golf, Solaris, Rio)', from: 9900 },
      { name: 'Бизнес (Passat, Mercedes A/C/E, Camry, BMW 5)', from: 11900 },
      { name: 'Кроссоверы (BMW X3, Audi Q5, Tucson)', from: 11900 },
      { name: 'Внедорожники и минивэны', from: 13900 },
      { name: 'Представительский (Mercedes S, BMW 7)', from: 13900 },
    ],
  },
  {
    id: 'vinyl', title: 'Оклейка виниловой плёнкой',
    items: [
      { name: 'Полная оклейка кузова', from: 80000 },
      { name: 'Капот', from: 12000 },
      { name: 'Крыша', from: 8000 },
      { name: 'Бампер передний', from: 8000 },
      { name: 'Зеркала (пара)', from: 3000 },
    ],
  },
  {
    id: 'polish', title: 'Полировка кузова',
    items: [
      { name: 'Полировка кузова полная', from: 15000 },
      { name: 'Полировка одного элемента', from: 2000 },
      { name: 'Удаление царапин (локально)', from: 3000 },
    ],
  },
  {
    id: 'ceramic', title: 'Керамическое покрытие',
    items: [
      { name: 'Керамика на кузов', from: 20000 },
      { name: 'Керамика + полировка', from: 35000 },
    ],
  },
]

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽'
}

export default function PricesPage() {
  return (
    <main>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#C9A84C]/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div>
              <span className="text-[#C9A84C] text-base font-black tracking-widest">DETAILING TIME</span>
              <p className="text-[#666] text-[10px] tracking-wider">Студия оклейки авто</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-[#aaa] hover:text-[#C9A84C] text-sm transition-colors">Каталог</Link>
            <Link href="/prices" className="text-[#C9A84C] text-sm font-semibold">Цены</Link>
            <Link href="/ai-wrap" className="text-[#aaa] hover:text-[#C9A84C] text-sm transition-colors">AI примерка</Link>
            <Link href="/assistant" className="text-[#aaa] hover:text-[#C9A84C] text-sm transition-colors">Ассистент</Link>
          </div>
          <a href="tel:+74954111003" className="bg-[#C9A84C] text-black text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#b8963e] transition-colors">
            Позвонить
          </a>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Стоимость работ</p>
          <h1 className="text-5xl font-black mb-4">Прайс-лист</h1>
          <p className="text-[#666] text-lg mb-16">Цены указаны от, точная стоимость рассчитывается индивидуально</p>

          <div className="space-y-10">
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <h2 className="text-xl font-bold text-[#C9A84C] mb-4">{cat.title}</h2>
                <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                  {cat.items.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-6 py-4 ${i < cat.items.length - 1 ? 'border-b border-[#1a1a1a]' : ''}`}
                    >
                      <span className="text-[#ccc] text-sm pr-4">{item.name}</span>
                      <span className="text-[#C9A84C] font-bold whitespace-nowrap">от {fmt(item.from)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#111] border border-[#C9A84C]/20 rounded-2xl p-8 text-center">
            <p className="text-[#aaa] mb-2">Точную стоимость рассчитаем после осмотра автомобиля</p>
            <a href="tel:+74954111003" className="inline-block bg-[#C9A84C] text-black font-bold px-8 py-4 rounded-2xl mt-4 hover:bg-[#b8963e] transition-colors">
              Позвонить: +7 (495) 411-10-03
            </a>
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
