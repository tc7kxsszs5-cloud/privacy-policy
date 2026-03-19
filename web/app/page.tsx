import Link from 'next/link'

const SERVICES = [
  { icon: '🛡️', title: 'PPF плёнка', desc: 'Защита кузова от сколов, царапин и химии. Прозрачная или цветная.' },
  { icon: '🪟', title: 'Тонировка стёкол', desc: 'Атермальная, зеркальная, цветная. Любой процент светопропускаемости.' },
  { icon: '🎨', title: 'Оклейка виниловой плёнкой', desc: 'Полная или частичная оклейка. Глянец, мат, сатин, карбон, хром.' },
  { icon: '✨', title: 'Полировка кузова', desc: 'Удаление царапин, восстановление блеска. Абразивная и безабразивная.' },
  { icon: '💎', title: 'Керамическое покрытие', desc: 'Долгосрочная защита ЛКП. Гидрофобный эффект, глубокий блеск.' },
  { icon: '🚿', title: 'Детейлинг', desc: 'Комплексная химчистка и восстановление внешнего вида автомобиля.' },
]

const PRICES = [
  { name: 'Тонировка передних стёкол', price: 'от 3 000' },
  { name: 'Тонировка полная', price: 'от 8 000' },
  { name: 'Оклейка капота', price: 'от 12 000' },
  { name: 'Полная оклейка кузова', price: 'от 80 000' },
  { name: 'PPF капот + бампер', price: 'от 25 000' },
  { name: 'Полировка кузова', price: 'от 15 000' },
  { name: 'Керамическое покрытие', price: 'от 20 000' },
  { name: 'Детейлинг комплекс', price: 'от 10 000' },
]

const FAQ = [
  {
    q: 'Сколько стоит оклейка автомобиля?',
    a: 'Зависит от размера авто, материала и объёма работ. Частичная оклейка от 12 000 руб, полная от 80 000 руб. Точную стоимость рассчитаем после осмотра.',
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
    a: 'Да — скачайте наше приложение, создайте конфигурацию вашего автомобиля и отправьте заявку. Либо позвоните или напишите в Telegram.',
  },
]

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/90 backdrop-blur border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-[#e63946] text-xl font-black tracking-widest">ФЛОР</span>
          <div className="flex items-center gap-6">
            <a href="#services" className="text-gray-400 hover:text-white text-sm transition-colors">Услуги</a>
            <a href="#prices" className="text-gray-400 hover:text-white text-sm transition-colors">Цены</a>
            <a href="#contacts" className="text-gray-400 hover:text-white text-sm transition-colors">Контакты</a>
            <a
              href="tel:+74954111003"
              className="bg-[#e63946] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#c1121f] transition-colors"
            >
              Позвонить
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#e63946] text-sm font-semibold tracking-widest uppercase mb-6">
            Студия оклейки автомобилей · Москва
          </p>
          <h1 className="text-6xl md:text-8xl font-black leading-none mb-8">
            Создай<br />свой<br /><span className="text-[#e63946]">стиль</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-lg mb-12 leading-relaxed">
            Профессиональная оклейка, тонировка и детейлинг автомобилей.
            Москва, ул. Маршала Прошлякова, 14к2.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:+74954111003"
              className="bg-[#e63946] text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-[#c1121f] transition-colors"
            >
              +7 (495) 411-10-03
            </a>
            <a
              href="https://t.me/flor_detailing"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#333] text-white font-bold px-8 py-4 rounded-2xl text-lg hover:border-[#555] transition-colors"
            >
              Telegram
            </a>
          </div>
          <p className="text-gray-600 text-sm mt-6">Ежедневно 10:00 – 20:00</p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#e63946] text-sm font-semibold tracking-widest uppercase mb-4">Что мы делаем</p>
          <h2 className="text-4xl font-black mb-16">Услуги</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#e63946]/30 transition-colors">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prices */}
      <section id="prices" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#e63946] text-sm font-semibold tracking-widest uppercase mb-4">Сколько стоит</p>
          <h2 className="text-4xl font-black mb-16">Прайс-лист</h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            {PRICES.map((p, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-5 ${i < PRICES.length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}
              >
                <span className="text-gray-300">{p.name}</span>
                <span className="text-[#e63946] font-bold">{p.price} руб.</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-4">* Точная стоимость рассчитывается индивидуально после осмотра автомобиля</p>
        </div>
      </section>

      {/* App CTA */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#e63946]/20 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-black mb-4">Настрой авто в 3D</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
              Скачай приложение, выбери свой автомобиль, примерь цвет и материал в реальном времени — и отправь заявку.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="bg-[#e63946] text-white font-bold px-8 py-4 rounded-2xl text-lg">
                App Store — скоро
              </div>
              <div className="border border-[#333] text-white font-bold px-8 py-4 rounded-2xl text-lg">
                Google Play — скоро
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#e63946] text-sm font-semibold tracking-widest uppercase mb-4">Вопросы и ответы</p>
          <h2 className="text-4xl font-black mb-16">FAQ</h2>
          <div className="space-y-4 max-w-3xl">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-3">{item.q}</h3>
                <p className="text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#e63946] text-sm font-semibold tracking-widest uppercase mb-4">Как нас найти</p>
          <h2 className="text-4xl font-black mb-16">Контакты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                <p className="text-gray-500 text-sm mb-2">📍 Адрес</p>
                <p className="text-white font-semibold">Москва, ул. Маршала Прошлякова, 14к2</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                <p className="text-gray-500 text-sm mb-2">🕐 Режим работы</p>
                <p className="text-white font-semibold">Ежедневно 10:00 – 20:00</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                <p className="text-gray-500 text-sm mb-2">📞 Телефон</p>
                <a href="tel:+74954111003" className="text-[#e63946] font-bold text-lg hover:underline">
                  +7 (495) 411-10-03
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <a
                href="https://t.me/flor_detailing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#229ED9] rounded-2xl p-6 hover:opacity-90 transition-opacity"
              >
                <span className="text-3xl">✈️</span>
                <div>
                  <p className="text-white font-bold text-lg">Telegram</p>
                  <p className="text-white/70 text-sm">@flor_detailing</p>
                </div>
              </a>
              <a
                href="https://wa.me/74954111003"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#25D366] rounded-2xl p-6 hover:opacity-90 transition-opacity"
              >
                <span className="text-3xl">💬</span>
                <div>
                  <p className="text-white font-bold text-lg">WhatsApp</p>
                  <p className="text-white/70 text-sm">+7 (495) 411-10-03</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-[#e63946] font-black tracking-widest">ФЛОР</span>
          <p className="text-gray-600 text-sm">© 2026 Студия оклейки автомобилей Флор · Москва</p>
        </div>
      </footer>
    </main>
  )
}
