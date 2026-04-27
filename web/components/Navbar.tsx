import Link from 'next/link'
import Image from 'next/image'
import AssistantStar from './AssistantStar'

interface NavbarProps {
  active?: 'catalog' | 'prices' | 'ai-wrap' | 'assistant' | 'configurator' | 'gallery'
}

export default function Navbar({ active }: NavbarProps) {
  const links = [
    { href: '/configurator', label: '3D Конфигуратор', id: 'configurator' },
    { href: '/catalog', label: 'Каталог', id: 'catalog' },
    { href: '/gallery', label: 'Работы', id: 'gallery' },
    { href: '/prices', label: 'Цены', id: 'prices' },
    { href: '/ai-wrap', label: 'AI примерка', id: 'ai-wrap' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#C9A84C]/10">
      <div className="max-w-7xl mx-auto px-8 h-18 flex items-center justify-between" style={{ height: 68 }}>
        <Link href="/" className="flex items-center gap-4">
          <Image src="/icon.png" alt="Detailing Time" width={44} height={44} className="rounded-2xl" />
          <div>
            <span className="text-[#C9A84C] text-base font-black tracking-widest block leading-none">DETAILING TIME</span>
            <span className="text-[#555] text-[11px] tracking-wider mt-0.5 block">Студия оклейки авто</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <Link
              key={l.id}
              href={l.href}
              className={`text-sm font-medium transition-colors ${active === l.id ? 'text-[#C9A84C] font-semibold' : 'text-[#888] hover:text-[#C9A84C]'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <AssistantStar active={active === 'assistant'} />
      </div>
    </nav>
  )
}
