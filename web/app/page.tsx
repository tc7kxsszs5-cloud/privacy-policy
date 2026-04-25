import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'

const SERVICES = [
  {
    id: 'ppf',
    title: 'Защитная плёнка PPF',
    desc: 'Прозрачная полиуретановая плёнка — надёжный барьер против сколов, реагентов и царапин. Эффект самовосстановления. Гарантия 5 лет.',
    image: '/ppf.jpg',
    href: '/prices',
  },
  {
    id: 'vinyl',
    title: 'Оклейка виниловой плёнкой',
    desc: 'Полная или частичная оклейка. Глянец, мат, сатин, карбон, хром, хамелеон — более 100 цветов в каталоге.',
    image: '/vinyl.jpg',
    href: '/catalog',
  },
  {
    id: 'tint',
    title: 'Тонировка стёкол',
    desc: 'Атермальная плёнка LLumar ATR. Любой процент светопропускаемости. Зеркальная, цветная, матовая.',
    image: '/tint.jpg',
    href: '/prices',
  },
  {
    id: 'polish',
    title: 'Полировка кузова',
    desc: 'Удаление царапин, вихрей и окислений. Абразивная и безабразивная полировка. Восстановление глубокого блеска.',
    image: '/polish_restore.jpg',
    href: '/prices',
  },
  {
    id: 'ceramic',
    title: 'Керамическое покрытие',
    desc: 'Долгосрочная защита ЛКП. Гидрофобный эффект, устойчивость к химии. Блеск сохраняется годами.',
    image: '/ceramic.jpg',
    href: '/prices',
  },
  {
    id: 'detailing',
    title: 'Детейлинг',
    desc: 'Комплексная химчистка и восстановление. Озонирование салона, чистка кожи, полировка фар.',
    image: '/detailing.jpg',
    href: '/prices',
  },
]

const PRICES_PREVIEW = [
  { name: 'Тонировка передних стёкол', price: 'от 3 000' },
  { name: 'Тонировка полная', price: 'от 8 000' },
  { name: 'Оклейка капота', price: 'от 12 000' },
  { name: 'Полная оклейка кузова', price: 'от 80 000' },
  { name: 'PPF капот + бампер', price: 'от 25 000' },
  { name: 'Керамическое покрытие', price: 'от 20 000' },
]

const FAQ = [
  {
    q: 'Сколько стоит оклейка автомобиля?',
    a: 'Зависит от размера авто, материала и объёма работ. Частичная оклейка от 12 000 руб, полная от 80 000 руб.',
  },
  {
    q: 'Сколько времени занимает работа?',
    a: 'Тонировка — 1 день. Частичная оклейка — 1-2 дня. Полная оклейка — 3-7 дней.',
  },
  {
    q: 'Есть ли гарантия?',
    a: 'Да, на все работы предоставляем гарантию. На плёнку — гарантия производителя до 5 лет.',
  },
  {
    q: 'Можно ли записаться онлайн?',
    a: 'Да — воспользуйтесь AI примеркой на сайте или напишите нам в Telegram.',
  },
]

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />

      {/* Services */}
      <section id="services" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Что мы делаем</p>
          <h2 className="text-4xl font-black mb-16">Услуги</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <Link key={s.id} href={s.href} className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden hover:border-[#C9A84C]/30 transition-colors group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Wrap CTA */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-[#111] border border-[#C9A84C]/20 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Image src="/vinyl.jpg" alt="" fill className="object-cover" />
            </div>
            <div className="relative">
              <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Новая функция</p>
              <h2 className="text-4xl font-black mb-4">AI примерка оклейки</h2>
              <p className="text-[#aaa] text-lg mb-8 max-w-lg mx-auto">
                Загрузи фото своего автомобиля, выбери плёнку — и получи реалистичный превью с помощью искусственного интеллекта.
              </p>
              <Link
                href="/ai-wrap"
                className="inline-block bg-[#C9A84C] text-black font-bold px-10 py-4 rounded-2xl text-lg hover:bg-[#b8963e] transition-colors"
              >
                Попробовать бесплатно ✦
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Prices preview */}
      <section id="prices" className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Сколько стоит</p>
          <h2 className="text-4xl font-black mb-16">Прайс-лист</h2>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden mb-8">
            {PRICES_PREVIEW.map((p, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-5 ${i < PRICES_PREVIEW.length - 1 ? 'border-b border-[#1a1a1a]' : ''}`}
              >
                <span className="text-[#ccc]">{p.name}</span>
                <span className="text-[#C9A84C] font-bold">{p.price} ₽</span>
              </div>
            ))}
          </div>
          <Link href="/prices" className="text-[#C9A84C] font-semibold hover:underline text-sm">
            Полный прайс-лист →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Вопросы и ответы</p>
          <h2 className="text-4xl font-black mb-16">FAQ</h2>
          <div className="space-y-4 max-w-3xl">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-3">{item.q}</h3>
                <p className="text-[#666] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/assistant" className="inline-flex items-center gap-2 border border-[#C9A84C]/30 text-[#C9A84C] font-semibold px-6 py-3 rounded-xl hover:border-[#C9A84C] transition-colors text-sm">
              ✦ Задать вопрос AI ассистенту
            </Link>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">Как нас найти</p>
          <h2 className="text-4xl font-black mb-16">Контакты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                <p className="text-[#666] text-sm mb-2">Адрес</p>
                <p className="text-white font-semibold">Москва, ул. Маршала Прошлякова, 14к2</p>
              </div>
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                <p className="text-[#666] text-sm mb-2">Режим работы</p>
                <p className="text-white font-semibold">Ежедневно 10:00 – 20:00</p>
              </div>
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                <p className="text-[#666] text-sm mb-2">Телефон</p>
                <a href="tel:+74954111003" className="text-[#C9A84C] font-bold text-xl hover:underline">
                  +7 (495) 411-10-03
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <a href="https://t.me/flor_detailing" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#229ED9] rounded-2xl p-6 hover:opacity-90 transition-opacity">
                <span className="text-3xl">✈️</span>
                <div>
                  <p className="text-white font-bold text-lg">Telegram</p>
                  <p className="text-white/70 text-sm">@flor_detailing</p>
                </div>
              </a>
              <a href="https://wa.me/79854111003" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#25D366] rounded-2xl p-6 hover:opacity-90 transition-opacity">
                <span className="text-3xl">💬</span>
                <div>
                  <p className="text-white font-bold text-lg">WhatsApp</p>
                  <p className="text-white/70 text-sm">+7 (985) 411-10-03</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[#C9A84C] font-black tracking-widest text-sm">DETAILING TIME</span>
            <p className="text-[#444] text-xs mt-1">Студия оклейки автомобилей</p>
          </div>
          <div className="flex gap-6">
            <Link href="/catalog" className="text-[#555] text-sm hover:text-[#C9A84C] transition-colors">Каталог</Link>
            <Link href="/prices" className="text-[#555] text-sm hover:text-[#C9A84C] transition-colors">Цены</Link>
            <Link href="/ai-wrap" className="text-[#555] text-sm hover:text-[#C9A84C] transition-colors">AI примерка</Link>
          </div>
          <p className="text-[#444] text-sm">© 2026 Detailing Time · Москва</p>
        </div>
      </footer>
    </main>
  )
}
